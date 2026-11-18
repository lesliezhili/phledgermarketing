// POST a customer message (any channel), get the instant reply and, where a
// person is needed, the hand-over with its approval route and deadline.
// Connectors call this: the website (AI agent chat, enquiry email), phone and
// mobile (voice agent or voicemail transcript, SMS), Meta, WhatsApp, WeChat.
import { NextResponse } from 'next/server'
import { handleMessage, type CsChannel, type CsMessage } from '@/lib/customer-service'

const CHANNELS: CsChannel[] = ['webchat', 'email', 'phone', 'sms', 'whatsapp', 'messenger', 'instagram', 'wechat']
const MODES = ['zhi_li', 'zhi_li_and_client', 'auto_simple']

export async function POST(req: Request) {
  let body: Partial<CsMessage>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 })
  }
  if (typeof body.business !== 'string' || !body.business.trim() || body.business.length > 100) return NextResponse.json({ error: 'business is required (max 100 characters)' }, { status: 400 })
  if (typeof body.text !== 'string' || !body.text.trim() || body.text.length > 2000) return NextResponse.json({ error: 'text is required (max 2000 characters)' }, { status: 400 })
  if (!body.channel || !CHANNELS.includes(body.channel)) return NextResponse.json({ error: `channel must be one of ${CHANNELS.join(', ')}` }, { status: 400 })
  if (body.language && !['en', 'zh'].includes(body.language)) return NextResponse.json({ error: 'language must be en or zh' }, { status: 400 })
  const policy = body.policy && MODES.includes(body.policy.mode) ? body.policy : { mode: 'zhi_li' as const }
  return NextResponse.json(handleMessage({
    business: body.business.trim(),
    text: body.text,
    channel: body.channel,
    language: body.language,
    firstContact: body.firstContact,
    trade: body.trade,
    knowledge: body.knowledge ?? {},
    policy,
  }))
}
