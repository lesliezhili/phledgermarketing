// AI chat agent for client websites (first: phledger.com).
//
// Two layers:
//   1. Rules (src/lib/customer-service.ts) read every message first. Prices,
//      FAQs, complaints, refunds, safety and hand-overs are decided here, the
//      same way on every channel — the AI never handles money, blame or safety.
//   2. Claude answers only the open questions the rules can't (a "generic"
//      reply), grounded in the client's approved facts. Its answer is checked:
//      any dollar amount it mentions must appear in the facts, or the rules'
//      reply is used instead. With no API key, the rules answer alone.

import Anthropic from '@anthropic-ai/sdk'
import { detectLanguage, handleMessage, type CsIntent, type CsStage } from './customer-service'
import type { ChatClient } from './chat-clients'

export type ChatLang = 'en' | 'zh' | 'fr'
export interface ChatTurn { role: 'user' | 'assistant'; content: string }

/** Answers an open question from facts; returns null to fall back to the rules. */
export type GroundedAnswerer = (input: { system: string; messages: ChatTurn[] }) => Promise<string | null>

export interface ChatResult {
  reply: string
  language: ChatLang
  intent: CsIntent
  stage: CsStage
  source: 'rules' | 'ai'
  /** A person must follow up: the widget asks for the visitor's contact details. */
  needsPerson: boolean
  personWithinHours?: number
  /** For the team only (never shown to the visitor). */
  internalNote?: string
}

export const MAX_TURNS = 12
export const MAX_CHARS = 1000

/** Alternating user/assistant turns, starting and ending with the visitor; trimmed and capped. */
export function cleanHistory(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return []
  const turns: ChatTurn[] = []
  for (const t of raw.slice(-MAX_TURNS * 2)) {
    if (!t || (t.role !== 'user' && t.role !== 'assistant') || typeof t.content !== 'string') continue
    const content = t.content.trim().slice(0, MAX_CHARS)
    if (!content) continue
    const last = turns[turns.length - 1]
    if (last && last.role === t.role) last.content = `${last.content}\n${content}`.slice(0, MAX_CHARS * 2)
    else turns.push({ role: t.role, content })
  }
  while (turns.length && turns[0].role !== 'user') turns.shift()
  while (turns.length && turns[turns.length - 1].role !== 'user') turns.pop()
  return turns.slice(-MAX_TURNS)
}

export function systemPrompt(client: ChatClient): string {
  return [
    `You are the automated website assistant for ${client.business}. Visitors are prospective or current clients.`,
    'Answer only from the FACTS below. If the answer is not in the facts, say you are not sure and suggest sending a short brief or emailing the team; do not guess.',
    'Never invent prices, discounts, client names, case studies, results or dates. Never promise anything on the team\'s behalf. Complaints, refunds and anything about money owed are handled by a person, not you.',
    'Reply in the visitor\'s language: English; Simplified Chinese if they write in Chinese; Canadian (Québec) French if they write in French (use Québec terms such as infonuagique and courriel). Plain text, no markdown, two to four sentences. Include a link from the facts only when it helps the visitor take the next step; for French speakers prefer https://phledger.com/canada/fr.',
    '',
    'FACTS',
    client.facts.en,
  ].join('\n')
}

const MONEY = /(?:A?\$|AUD\s?)\s?\d[\d,]*(?:\.\d+)?/gi

/** Every amount of money in the answer must appear in the facts. */
export function moneyGrounded(answer: string, facts: string): boolean {
  const norm = (s: string) => s.replace(/AUD\s?|A\$|\$|[\s,]/gi, '')
  const known = new Set((facts.match(MONEY) ?? []).map(norm))
  return (answer.match(MONEY) ?? []).every(m => known.has(norm(m)))
}

export async function chat(client: ChatClient, history: ChatTurn[], language?: ChatLang, answerer: GroundedAnswerer | null = claudeAnswerer()): Promise<ChatResult> {
  const last = history[history.length - 1]
  if (!last || last.role !== 'user') throw new Error('the last turn must be the visitor\'s message')
  const firstContact = !history.some(t => t.role === 'assistant')
  const lang: ChatLang = language ?? detectLanguage(last.content)
  const r = handleMessage({
    business: client.business,
    text: last.content,
    channel: 'webchat',
    language: lang,
    firstContact,
    knowledge: client.knowledge[lang],
    policy: { mode: 'zhi_li' },
  })

  const base: ChatResult = {
    reply: r.reply,
    language: lang,
    intent: r.intent,
    stage: r.stage,
    source: 'rules',
    needsPerson: !!r.handover,
    personWithinHours: r.handover?.withinHours,
    internalNote: r.handover?.note,
  }
  if (!r.generic || !answerer) return base

  const answer = await answerer({ system: systemPrompt(client), messages: history }).catch(() => null)
  if (!answer || answer.length > 1500 || !moneyGrounded(answer, client.facts.en)) return base
  const disclosure = firstContact ? `\n${r.reply.split('\n').pop()}` : ''
  return { ...base, reply: answer.trim() + disclosure, source: 'ai', needsPerson: false, personWithinHours: undefined, internalNote: undefined }
}

/** Claude, when ANTHROPIC_API_KEY is set on the server; otherwise null (rules only). */
export function claudeAnswerer(): GroundedAnswerer | null {
  if (!process.env.ANTHROPIC_API_KEY) return null
  const anthropic = new Anthropic({ timeout: 20_000, maxRetries: 1 })
  return async ({ system, messages }) => {
    try {
      const res = await anthropic.beta.messages.create({
        model: 'claude-opus-5-5',
        max_tokens: 4000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default', // on a policy decline, the API retries on a fallback model in the same call
        output_config: { effort: 'low' }, // short, factual chat replies
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        messages,
      })
      if (res.stop_reason === 'refusal') return null
      const text = res.content.flatMap(b => (b.type === 'text' ? [b.text] : [])).join('').trim()
      return text || null
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) console.warn('chat agent: rate limited, using rules')
      else if (err instanceof Anthropic.APIConnectionError) console.warn('chat agent: connection error, using rules')
      else if (err instanceof Anthropic.APIError) console.warn(`chat agent: API error ${err.status}, using rules`)
      else throw err
      return null
    }
  }
}
