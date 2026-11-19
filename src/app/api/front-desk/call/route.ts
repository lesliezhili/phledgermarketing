// POST /api/front-desk/call — a missed or AI-answered call (from the voice or
// telephony provider's webhook): what to say or text the caller, and the
// one-screen summary for the owner. Server-to-server; not opened to browsers.
import { NextResponse } from 'next/server'
import { handleCall, type FrontDeskCall } from '@/lib/front-desk'

export async function POST(req: Request) {
  let b: Partial<FrontDeskCall>
  try {
    b = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 })
  }
  if (typeof b.business !== 'string' || !b.business.trim()) return NextResponse.json({ error: 'business is required' }, { status: 400 })
  if (typeof b.caller !== 'string' || !b.caller.trim()) return NextResponse.json({ error: 'caller is required' }, { status: 400 })
  if (b.transcript !== undefined && (typeof b.transcript !== 'string' || b.transcript.length > 5000)) return NextResponse.json({ error: 'transcript must be text (max 5000 characters)' }, { status: 400 })
  return NextResponse.json(handleCall({
    business: b.business.trim(),
    caller: b.caller.trim(),
    transcript: b.transcript,
    language: b.language === 'zh' ? 'zh' : b.language === 'en' ? 'en' : undefined,
    knowledge: b.knowledge ?? {},
    policy: { mode: 'zhi_li' },
  }))
}
