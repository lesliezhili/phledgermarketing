// src/app/api/leads/reply/route.ts -- POST a new lead, get the instant
// speed-to-lead reply and whether the lead can be charged per lead.
// Sending the SMS/email is done by the connector (MCP) that calls this.
import { NextResponse } from 'next/server'
import {
  firstReply, isChargeableSource, PLATFORM_SOURCES, QUALIFYING_QUESTIONS,
  type LeadSource, type Trade,
} from '@/lib/speed-to-lead'

const SOURCES: LeadSource[] = [
  'tracked_number', 'tracked_form', 'meta_lead_form', 'our_listing',
  'hipages', 'airtasker', 'bark', 'serviceseeking', 'franchise_hq', 'unknown',
]
const CHANNELS = ['sms', 'email', 'messenger'] as const

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 })
  }

  const business = typeof body.business === 'string' ? body.business.trim() : ''
  const channel = body.channel as (typeof CHANNELS)[number]
  const source = (body.source ?? 'unknown') as LeadSource
  const trade = (body.trade ?? 'general') as Trade

  if (!business || business.length > 100) {
    return NextResponse.json({ error: 'business is required (max 100 characters)' }, { status: 400 })
  }
  if (!CHANNELS.includes(channel)) {
    return NextResponse.json({ error: `channel must be one of ${CHANNELS.join(', ')}` }, { status: 400 })
  }
  if (!SOURCES.includes(source)) {
    return NextResponse.json({ error: `source must be one of ${SOURCES.join(', ')}` }, { status: 400 })
  }
  if (!(trade in QUALIFYING_QUESTIONS)) {
    return NextResponse.json({ error: `trade must be one of ${Object.keys(QUALIFYING_QUESTIONS).join(', ')}` }, { status: 400 })
  }
  const bookingLink = typeof body.bookingLink === 'string' && /^https:\/\//.test(body.bookingLink) ? body.bookingLink : undefined

  const reply = firstReply({ business, trade, channel, missedCall: body.missedCall === true, bookingLink })
  const chargeable = isChargeableSource(source)
  const reason = chargeable
    ? 'tracked PhLedger source'
    : PLATFORM_SOURCES.includes(source)
      ? 'platform lead: the client already pays this platform'
      : 'untracked source'

  return NextResponse.json({ reply, chargeable, reason })
}
