// POST /api/chat — the website chat agent. Called from the client's website
// (phledger.com) with { client, messages, language? }. Returns the reply and
// whether a person needs to follow up. Internal notes are never returned.
import { chat, cleanHistory } from '@/lib/chat-agent'
import { chatClientFor } from '@/lib/chat-clients'
import { json, preflight, readJson } from '@/lib/integration'
import { allow, visitorKey } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const b = await readJson<{ client: string; messages: unknown; language: string }>(req)
  if (!b) return json(req, { error: 'invalid request body' }, 400)
  const client = chatClientFor(b.client)
  if (!client) return json(req, { error: 'unknown client' }, 400)
  const origin = req.headers.get('origin')
  if (origin && !client.origins.includes(origin)) return json(req, { error: 'origin not allowed for this client' }, 403)
  const history = cleanHistory(b.messages)
  if (!history.length) return json(req, { error: 'messages must end with the visitor\'s message' }, 400)
  if (!allow(`chat:${visitorKey(req)}`, 30, 10 * 60_000)) {
    return json(req, { error: 'Too many messages. Please wait a few minutes, or send us a brief.' }, 429, { 'Retry-After': '600' })
  }
  const language = b.language === 'zh' ? 'zh' : b.language === 'en' ? 'en' : undefined
  const r = await chat(client, history, language)
  return json(req, {
    reply: r.reply,
    language: r.language,
    stage: r.stage,
    source: r.source,
    needsPerson: r.needsPerson,
    personWithinHours: r.personWithinHours ?? null,
  })
}

export const OPTIONS = preflight
