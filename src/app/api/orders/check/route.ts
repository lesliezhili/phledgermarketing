// POST an order (from any channel) with the store's menu; get the checked
// order, the confirmation message, the kitchen ticket and follow-ups.
import { NextResponse } from 'next/server'
import { checkOrder, orderConfirmation, kitchenTicket, followUps, CHANNEL_RULES, type OrderRequest, type ProductOption } from '@/lib/orders'

export async function POST(req: Request) {
  let body: { order?: OrderRequest; menu?: ProductOption[]; business?: string; language?: 'en' | 'zh'; today?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 })
  }
  const { order, menu, business } = body
  if (!order || !menu?.length || !business) return NextResponse.json({ error: 'order, menu and business are required' }, { status: 400 })
  if (!(order.channel in CHANNEL_RULES)) return NextResponse.json({ error: `channel must be one of ${Object.keys(CHANNEL_RULES).join(', ')}` }, { status: 400 })
  const today = body.today ?? new Date().toISOString().slice(0, 10)
  const checked = checkOrder({ ...order, customerName: order.customerName ?? '', contact: order.contact ?? '' }, menu, today)
  const language = body.language ?? (order.channel === 'wechat' || order.channel === 'rednote' ? 'zh' : 'en')
  return NextResponse.json({
    ok: checked.ok,
    errors: checked.errors,
    needsPerson: checked.needsPerson,
    price: checked.price ?? null,
    autoReply: CHANNEL_RULES[order.channel].autoReply,
    confirmation: checked.errors.length ? null : orderConfirmation(checked, business, language),
    kitchenTicket: checked.errors.length ? null : kitchenTicket(checked),
    followUps: checked.ok ? followUps(checked, today) : [],
  })
}
