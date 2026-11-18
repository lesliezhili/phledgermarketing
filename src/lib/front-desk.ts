// AI Front Desk — moved from phledger.com to PhLedger Marketing.
//
// Missed calls answered (voice agent, or a text-back within 60 seconds),
// the order taken down and sent to the owner, and every Google review logged,
// tagged and replied to with a draft. Pay per order captured: no monthly
// fee, no setup fee, a monthly cap the owner chooses.
//
// It is the phone-and-reviews slice of AI Customer Service
// (src/lib/customer-service.ts) sold on a pay-per-order basis.
//
// phledger.com keeps its /frontdesk page and uses this product through the
// integration API (/api/front-desk/*): offer and prices, the savings
// estimate, and pilot applications. This file is the single source of truth.

import { handleMessage, type Knowledge } from './customer-service'
import type { ApprovalPolicy } from './approvals'

export type FrontDeskTier = 'standard' | 'high_value'
export type Lang = 'en' | 'zh'

export const FRONT_DESK = {
  name: { en: 'AI Front Desk', zh: 'AI 前台' },
  prices: { standard: 8, high_value: 20 } as Record<FrontDeskTier, number>, // AUD ex GST per order captured
  monthlyFee: 0,
  setupFee: 0,
  defaultCap: 300, // the owner can choose another cap
  minCap: 100, // below this the cap stops covering the running costs of a busy month
  pilotFreeOrders: 20,
  disputeDays: 7,
  duplicateDays: 7,
  textBackSeconds: 60,
  languages: ['English', 'Mandarin', 'Cantonese'],
}

export const FRONT_DESK_COPY: Record<Lang, {
  tiers: Record<FrontDeskTier, { name: string; body: string; examples: string[] }>
  counts: string[]
  neverCharged: string[]
  included: string[]
}> = {
  en: {
    tiers: {
      standard: { name: 'Standard order', body: 'Restaurants, takeaway, hair & beauty, retail, everyday services.', examples: ['Table booking', 'Takeaway order', 'Haircut appointment'] },
      high_value: { name: 'High-value order', body: 'Trades, renovation, clinics, removalists, tutoring and other high-ticket jobs.', examples: ['Quote request', 'Repair call-out', 'New patient booking'] },
    },
    counts: ['A new caller the AI spoke to or texted back', 'Who left a name, contact and a real request (booking, order or quote)', 'Delivered to you and not disputed within 7 days'],
    neverCharged: ['Spam, robocalls, sales calls', 'Wrong numbers and hang-ups with no request', 'Duplicate calls from the same customer within 7 days', 'Existing customers just asking a question'],
    included: ['Google review monitoring, tagging and AI reply drafts', 'Missed-call text-back', 'Call recordings and transcripts', "Monthly 'orders recovered' report", 'English, Mandarin and Cantonese'],
  },
  zh: {
    tiers: {
      standard: { name: '普通订单', body: '餐馆外卖、美发美容、零售、日常服务。', examples: ['订位', '外卖单', '理发预约'] },
      high_value: { name: '高价值订单', body: '装修维修、诊所、搬家、补习等客单价高的生意。', examples: ['报价请求', '上门维修', '新病人预约'] },
    },
    counts: ['AI 接听或回短信的新来电客户', '留下了姓名、联系方式和真实需求（预约、下单或报价）', '已交给你，且 7 天内没有申诉'],
    neverCharged: ['骚扰、机器人和推销电话', '打错电话、没有需求就挂断', '同一客户 7 天内的重复来电', '老客户只是来问问题'],
    included: ['Google 评价监控、问题标签与 AI 回复草稿', '漏接电话自动回短信', '通话录音与文字记录', '每月「挽回订单」报告', '英语、普通话、粤语'],
  },
}

/** Public offer for phledger.com and anyone else integrating. */
export function frontDeskOffer(lang: Lang = 'en') {
  const c = FRONT_DESK_COPY[lang]
  return {
    product: FRONT_DESK.name[lang],
    provider: 'PhLedger Marketing',
    currency: 'AUD',
    gst: 'excluded',
    monthlyFee: FRONT_DESK.monthlyFee,
    setupFee: FRONT_DESK.setupFee,
    tiers: (Object.keys(FRONT_DESK.prices) as FrontDeskTier[]).map(id => ({ id, price: FRONT_DESK.prices[id], ...c.tiers[id] })),
    defaultCap: FRONT_DESK.defaultCap,
    pilotFreeOrders: FRONT_DESK.pilotFreeOrders,
    disputeDays: FRONT_DESK.disputeDays,
    counts: c.counts,
    neverCharged: c.neverCharged,
    included: c.included,
  }
}

// ---------------------------------------------------------------- estimate

export const WEEKS_PER_MONTH = 4.3

export interface EstimateInput {
  missedPerWeek: number
  conversionPct: number // share of missed calls that would have become an order
  avgOrderValue: number
  tier: FrontDeskTier
  cap?: number
}

export function estimate(i: EstimateInput) {
  const orders = Math.round(i.missedPerWeek * WEEKS_PER_MONTH * (i.conversionPct / 100))
  const revenue = orders * i.avgOrderValue
  const uncapped = orders * FRONT_DESK.prices[i.tier]
  const fee = Math.min(uncapped, i.cap ?? FRONT_DESK.defaultCap)
  return { ordersPerMonth: orders, revenuePerMonth: revenue, feePerMonth: fee, returnPerDollar: fee > 0 ? Math.round((revenue / fee) * 10) / 10 : 0 }
}

// ---------------------------------------------------------------- billing

export interface CapturedOrder {
  id: string
  at: string // ISO time
  caller: string // phone number
  tier: FrontDeskTier
  hasRequest: boolean // name, contact and a real booking/order/quote
  spam?: boolean
  existingCustomer?: boolean
  disputed?: boolean
}

export type NotChargedReason = 'spam' | 'no_request' | 'existing_customer' | 'duplicate' | 'disputed' | 'pilot_free' | 'over_cap'

const normalisePhone = (p: string) => p.replace(/\D/g, '').replace(/^61/, '0')

/** The month's front-desk bill: every order listed, charged or with the reason it wasn't. */
export function billFrontDesk(orders: CapturedOrder[], opts: { cap?: number; pilotFreeRemaining?: number } = {}) {
  const cap = Math.max(FRONT_DESK.minCap, opts.cap ?? FRONT_DESK.defaultCap)
  let free = opts.pilotFreeRemaining ?? 0
  let total = 0
  const lastSeen = new Map<string, number>()
  const lines = [...orders].sort((a, b) => a.at.localeCompare(b.at)).map(o => {
    const t = Date.parse(o.at)
    const key = normalisePhone(o.caller)
    const prev = lastSeen.get(key)
    lastSeen.set(key, t)
    let reason: NotChargedReason | null = null
    if (o.spam) reason = 'spam'
    else if (!o.hasRequest) reason = 'no_request'
    else if (o.existingCustomer) reason = 'existing_customer'
    else if (prev !== undefined && t - prev < FRONT_DESK.duplicateDays * 86_400_000) reason = 'duplicate'
    else if (o.disputed) reason = 'disputed'
    else if (free > 0) { free--; reason = 'pilot_free' }
    else if (total + FRONT_DESK.prices[o.tier] > cap) reason = 'over_cap'
    const amount = reason ? 0 : FRONT_DESK.prices[o.tier]
    total += amount
    return { id: o.id, tier: o.tier, amount, reason }
  })
  return { lines, amountDue: total, cap, pilotFreeRemaining: free }
}

// ---------------------------------------------------------------- calls

export interface FrontDeskCall {
  business: string
  ownerName?: string
  caller: string
  transcript?: string // voice agent transcript or voicemail; empty for a hang-up
  language?: Lang
  knowledge: Knowledge
  policy: ApprovalPolicy
}

/**
 * A missed or AI-answered call: what the caller hears or is texted, and the
 * one-screen summary texted to the owner.
 */
export function handleCall(c: FrontDeskCall) {
  const lang = c.language ?? (c.transcript && /[一-鿿]/.test(c.transcript) ? 'zh' : 'en')
  if (!c.transcript?.trim()) {
    // Hung up before anyone answered: text back within 60 seconds.
    const text = lang === 'zh'
      ? `抱歉错过了您打给${c.business}的电话，请问有什么可以帮您？（这是${c.business}的自动助理。回复“退订”即可停止接收消息。）`
      : `Sorry we missed your call to ${c.business} — how can we help? (This is ${c.business}'s automated assistant. Reply STOP to opt out.)`
    return { mode: 'text_back' as const, callerMessage: text, ownerSummary: `${c.business}: missed call from ${c.caller}, texted back.`, result: null }
  }
  const result = handleMessage({ business: c.business, text: c.transcript, channel: 'phone', language: lang, knowledge: c.knowledge, policy: c.policy })
  const ownerSummary = [
    `${c.business}: call from ${c.caller}`,
    `${result.stage} · ${result.intent.replace('_', ' ')}`,
    `"${c.transcript.slice(0, 160)}"`,
    result.handover ? `Needs you: ${result.handover.note.split('\n')[0]} (within ${result.handover.withinHours} h)` : 'Handled by AI.',
  ].join('\n')
  return { mode: 'voice' as const, callerMessage: result.reply, callerSms: result.smsFollowUp, ownerSummary, result }
}
