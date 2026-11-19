// src/app/api/quote/route.ts -- POST a client's quote inputs, get the quote:
// numbers, message, checklist, agenda, actions and a Markdown brief.
// Unprofitable or invalid quotes are refused with 400.
import { NextResponse } from 'next/server'
import { buildQuote, type QuoteInput } from '@/lib/quote'

const TIERS = ['Grace', 'Faithful', 'Abundant']
const COMMITMENTS = ['monthly', '6m', '12m', 'founding']

export async function POST(req: Request) {
  let body: Partial<QuoteInput>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 })
  }

  const problems: string[] = []
  if (!body.business || typeof body.business !== 'string' || body.business.length > 100) problems.push('business is required (max 100 characters)')
  if (!body.contactName || typeof body.contactName !== 'string' || body.contactName.length > 60) problems.push('contactName is required (max 60 characters)')
  if (!['zh', 'en'].includes(body.language as string)) problems.push('language must be zh or en')
  if (!['wechat', 'email'].includes(body.channel as string)) problems.push('channel must be wechat or email')
  if (!TIERS.includes(body.tier as string)) problems.push(`tier must be one of ${TIERS.join(', ')}`)
  if (!COMMITMENTS.includes(body.commitment as string)) problems.push(`commitment must be one of ${COMMITMENTS.join(', ')}`)
  const count = Math.max(body.stores?.length ?? 0, body.storeCount ?? 1)
  if (!Number.isInteger(count) || count < 1 || count > 50) problems.push('storeCount must be 1 to 50')
  if (body.docLink && !/^https:\/\//.test(body.docLink)) problems.push('docLink must be an https link')
  if (problems.length) return NextResponse.json({ error: problems.join('; ') }, { status: 400 })

  try {
    const quote = buildQuote({ ...(body as QuoteInput), today: body.today ?? new Date().toISOString().slice(0, 10) })
    // Internal profit figures stay internal: they are in the brief, not the client message.
    return NextResponse.json(quote)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
