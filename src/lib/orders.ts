// Order automation across channels: Instagram, Facebook, RedNote (小红书),
// WeChat, phone and the website.
//
// Every order — whichever channel it came in on — is checked the same way
// (product, size, enough notice, date), then gets a confirmation message,
// a kitchen ticket and a reminder schedule. Staff never retype an order.
//
// What can be automated depends on the channel's rules (CHANNEL_RULES):
// Instagram and Facebook messages through Meta's official messaging API;
// RedNote has no public messaging API for this, so replies there are
// AI-drafted and sent by a person; phone orders come in through missed-call
// text-back or a 30-second staff form.

import { cleanProductName } from './quote'

export type OrderChannel = 'instagram' | 'facebook' | 'rednote' | 'wechat' | 'phone' | 'website'

export interface ChannelRule {
  name: string
  autoReply: boolean // may we send replies automatically?
  how: string
  replyWindowHours?: number // platform limit on replying after the customer's last message
}

export const CHANNEL_RULES: Record<OrderChannel, ChannelRule> = {
  instagram: { name: 'Instagram', autoReply: true, how: 'Instagram messaging via Meta\'s official API (business account linked to a Facebook Page)', replyWindowHours: 24 },
  facebook: { name: 'Facebook', autoReply: true, how: 'Messenger via Meta\'s official API (Facebook Page)', replyWindowHours: 24 },
  rednote: { name: 'RedNote (小红书)', autoReply: false, how: 'No public messaging API: AI drafts the reply, a person sends it; the order link goes in the profile and notes' },
  wechat: { name: 'WeChat', autoReply: true, how: 'WeChat Official Account / WeCom customer-service messages (verified account; limited reply window — check current rules)' },
  phone: { name: 'Phone', autoReply: true, how: 'Missed calls get an SMS with the order link; answered calls are entered by staff in a 30-second form' },
  website: { name: 'Website', autoReply: true, how: 'Order form on the tracked order page' },
}

export interface ProductOption {
  name: string
  sizes: { label: string; price: number }[]
  leadDays: number // days' notice needed
}

export interface OrderRequest {
  channel: OrderChannel
  customerName: string
  contact: string // phone or handle to confirm with
  product: string // as the customer wrote it
  size: string
  pickupDate: string // YYYY-MM-DD
  pickupTime?: string
  writing?: string // message on the cake
  notes?: string // allergies, delivery etc.
  marketingConsent?: boolean // agreed to offers/updates (Spam Act)
}

export interface CheckedOrder {
  ok: boolean // valid and safe to confirm automatically
  errors: string[]
  needsPerson: string[] // valid, but a person must confirm (e.g. allergies)
  product?: ProductOption
  price?: number
  request: OrderRequest
}

const daysBetween = (a: string, b: string) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5)
const key = (s: string) => cleanProductName(s).toLowerCase()

/** Check an order the same way whichever channel it came from. */
export function checkOrder(req: OrderRequest, menu: ProductOption[], today: string): CheckedOrder {
  const errors: string[] = []
  const product = menu.find(p => key(p.name) === key(req.product))
    ?? menu.find(p => key(p.name).includes(key(req.product)) || key(req.product).includes(key(p.name)))
  if (!product) errors.push(`Unknown product: ${req.product}`)
  const size = product?.sizes.find(s => s.label.toLowerCase() === req.size.toLowerCase().trim())
  if (product && !size) errors.push(`Size must be one of: ${product.sizes.map(s => s.label).join(', ')}`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(req.pickupDate)) errors.push('Pickup date must be YYYY-MM-DD')
  else {
    const notice = daysBetween(today, req.pickupDate)
    if (notice < 0) errors.push('Pickup date is in the past')
    else if (product && notice < product.leadDays) errors.push(`${product.name} needs ${product.leadDays} days' notice`)
  }
  if (!req.customerName.trim() || !req.contact.trim()) errors.push('Customer name and contact are required')
  const needsPerson: string[] = []
  if (/allerg|\bnuts?\b|gluten|coeliac|celiac|过敏/i.test(`${req.notes ?? ''} ${req.writing ?? ''}`)) {
    needsPerson.push('Allergy or dietary note: a person must confirm this order with the customer')
  }
  return { ok: errors.length === 0 && needsPerson.length === 0, errors, needsPerson, product, price: size?.price, request: req }
}

/** Confirmation sent on the channel the order came from. */
export function orderConfirmation(o: CheckedOrder, business: string, language: 'en' | 'zh'): string {
  const r = o.request
  const name = o.product?.name ?? r.product
  if (language === 'zh') {
    return [
      `${r.customerName}您好，${business} 已收到您的订单：`,
      `${name}（${r.size}）${o.price ? ` $${o.price}` : ''}`,
      `取货：${r.pickupDate}${r.pickupTime ? ` ${r.pickupTime}` : ''}`,
      ...(r.writing ? [`蛋糕上写：${r.writing}`] : []),
      '需要修改请直接回复这条消息。',
    ].join('\n')
  }
  return [
    `Hi ${r.customerName}, ${business} has your order:`,
    `${name} (${r.size})${o.price ? ` $${o.price}` : ''}`,
    `Pickup: ${r.pickupDate}${r.pickupTime ? ` ${r.pickupTime}` : ''}`,
    ...(r.writing ? [`Writing on the cake: ${r.writing}`] : []),
    'Reply to this message to change anything.',
  ].join('\n')
}

/** What the kitchen sees — one line per order, no retyping. */
export function kitchenTicket(o: CheckedOrder): string {
  const r = o.request
  return `${r.pickupDate} ${r.pickupTime ?? ''} | ${o.product?.name ?? r.product} ${r.size} | ${r.customerName} ${r.contact} | via ${CHANNEL_RULES[r.channel].name}${r.writing ? ` | writing: "${r.writing}"` : ''}${r.notes ? ` | notes: ${r.notes}` : ''}`.replace(/\s+\|/g, ' |')
}

export interface ScheduledMessage { when: string; what: 'confirmation' | 'reminder' | 'thank_you_review' | 'reorder_offer' }

/**
 * Follow-up messages for one order. Offers only go to customers who agreed to
 * hear from the business (Spam Act); the confirmation and pickup reminder are
 * part of the order itself.
 */
export function followUps(o: CheckedOrder, today: string): ScheduledMessage[] {
  const p = o.request.pickupDate
  const day = (iso: string, n: number) => {
    const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10)
  }
  const out: ScheduledMessage[] = [{ when: today, what: 'confirmation' }]
  if (daysBetween(today, p) >= 1) out.push({ when: day(p, -1), what: 'reminder' })
  out.push({ when: day(p, 1), what: 'thank_you_review' })
  if (o.request.marketingConsent) out.push({ when: day(p, 330), what: 'reorder_offer' }) // e.g. next birthday
  return out
}
