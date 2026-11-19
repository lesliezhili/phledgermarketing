// POST /api/chat/handover — the visitor leaves contact details so a person
// can follow up on the chat. Saved to Supabase (dm_chat_handovers) when
// configured; otherwise an email draft with the transcript is returned.
import { cleanHistory } from '@/lib/chat-agent'
import { chatClientFor } from '@/lib/chat-clients'
import { handleMessage } from '@/lib/customer-service'
import { MARKET_IDS, type MarketId } from '@/lib/markets'
import { getSupabase } from '@/lib/supabase'
import { json, preflight, readJson } from '@/lib/integration'
import { allow, visitorKey } from '@/lib/rate-limit'

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(req: Request) {
  const b = await readJson<{ client: string; name: string; contact: string; messages: unknown; language: string; consent: boolean; source: string; market: string }>(req)
  if (!b) return json(req, { error: 'invalid request body' }, 400)
  const client = chatClientFor(b.client)
  if (!client) return json(req, { error: 'unknown client' }, 400)
  const origin = req.headers.get('origin')
  if (origin && !client.origins.includes(origin)) return json(req, { error: 'origin not allowed for this client' }, 403)
  const contact = str(b.contact, 120)
  if (!contact) return json(req, { error: 'contact is required' }, 400)
  if (b.consent !== true) return json(req, { error: 'consent to be contacted is required' }, 400)
  if (!allow(`handover:${visitorKey(req)}`, 5, 60 * 60_000)) return json(req, { error: 'Too many requests' }, 429)

  // Transcript: the visitor's messages and the replies, as sent by the widget.
  const raw = Array.isArray(b.messages) ? b.messages : []
  const transcript = raw
    .filter((t: { role?: string; content?: unknown }) => (t?.role === 'user' || t?.role === 'assistant') && typeof t.content === 'string')
    .slice(-24)
    .map((t: { role: string; content: string }) => `${t.role === 'user' ? 'Visitor' : 'Assistant'}: ${t.content.slice(0, 1000)}`)
    .join('\n')
  const lastUser = cleanHistory(raw).pop()
  const language = b.language === 'zh' || b.language === 'fr' ? b.language : 'en'
  const triage = lastUser
    ? handleMessage({ business: client.business, text: lastUser.content, channel: 'webchat', language, market: MARKET_IDS.includes(b.market as MarketId) ? (b.market as MarketId) : undefined, knowledge: client.knowledge[language], policy: { mode: 'zhi_li' } })
    : null
  const row = {
    client: client.id,
    name: str(b.name, 80),
    contact,
    language,
    stage: triage?.stage ?? null,
    intent: triage?.intent ?? null,
    within_hours: triage?.handover?.withinHours ?? 24,
    note: triage?.handover?.note ?? null,
    transcript,
    source: str(b.source, 200) || origin || 'direct',
  }

  const fallback = `mailto:${client.contactEmail}?subject=${encodeURIComponent(`Website chat: ${row.name || contact}`)}&body=${encodeURIComponent(
    `Name: ${row.name}\nContact: ${contact}\n\n${transcript}`,
  )}`
  const db = getSupabase()
  if (!db) return json(req, { stored: false, fallback }, 503)
  const { error } = await db.from('dm_chat_handovers').insert(row)
  if (error) return json(req, { stored: false, fallback }, 502)
  return json(req, { stored: true, withinHours: row.within_hours }, 201)
}

export const OPTIONS = preflight
