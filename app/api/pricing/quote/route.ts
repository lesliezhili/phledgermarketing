// app/api/pricing/quote/route.ts -- POST a booking context, get a smart quote.
import { NextResponse } from 'next/server'
import { computeSmartQuote, type QuoteInput } from '@/lib/pricing/smart-pricing'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<QuoteInput>
    if (!body.category || !body.hours || body.startHour == null) {
      return NextResponse.json({ error: 'category, hours and startHour are required' }, { status: 400 })
    }
    const quote = computeSmartQuote({
      category: body.category,
      hours: Number(body.hours),
      startHour: Number(body.startHour),
      leadTimeHours: body.leadTimeHours,
      providerLoadPct: body.providerLoadPct,
      fundingScheme: body.fundingScheme,
      flags: body.flags,
      green: body.green,
      bundleCount: body.bundleCount,
      promoCode: body.promoCode,
    })
    return NextResponse.json({ quote })
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 })
  }
}
