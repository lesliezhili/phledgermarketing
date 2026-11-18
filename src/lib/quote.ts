// Client quote generator — the PhLedger Marketing agent's "quote" step.
//
// INPUT  a QuoteInput (see clients/_template.json): business, contact,
//        language, stores, package, commitment, products, current assets,
//        meeting date.
// OUTPUT every number (from storeQuoteEconomics, never typed by hand), the
//        WeChat/email message, the meeting prep checklist and agenda, dated
//        actions, and product-name fixes — plus one Markdown brief.
//
// A quote that would lose money is refused: buildQuote throws, so the agent
// can never send an unprofitable offer.

import { FOUNDING_OFFER, MULTI_STORE, SETUP_FEE, packages, type Tier } from './catalog'
import { storeQuoteEconomics } from './economics'

export type QuoteLanguage = 'zh' | 'en'
export type QuoteChannel = 'wechat' | 'email'
export type QuoteCommitment = 'monthly' | '6m' | '12m' | 'founding'

export interface StoreInput {
  name?: string
  address?: string
  phone?: string
  hours?: string
}

export interface ProductInput {
  name: string
  price?: string // e.g. "6in $65 / 8in $85"; leave out if unknown
}

export interface QuoteInput {
  business: string
  contactName: string
  language: QuoteLanguage
  channel: QuoteChannel
  tier: Tier
  commitment: QuoteCommitment
  foundingClientNumber?: number // 1..FOUNDING_OFFER.maxClients when commitment is 'founding'
  stores?: StoreInput[] // known stores (first = main store)
  storeCount?: number // if the store list isn't known yet
  products?: ProductInput[]
  assets?: {
    googleAccount?: string // the business Google account email, if known
    googleProfileExists?: boolean
    phone?: string
    website?: string
    sameCompany?: boolean // are all stores one company / ABN?
  }
  nextBusyPeriod?: { en: string; zh: string }
  docLink?: string
  meetingDate?: string // YYYY-MM-DD
  today: string // YYYY-MM-DD (passed in so output is repeatable)
}

export interface ProductFix { from: string; to: string }
export interface Action { action: string; owner: 'PhLedger' | 'Client' | 'Both'; due: string }

export interface QuoteOutput {
  numbers: ReturnType<typeof storeQuoteEconomics>
  productFixes: ProductFix[]
  missingInfo: string[]
  message: string
  checklist: string[]
  agenda: { item: string; minutes: number }[]
  actions: Action[]
  markdown: string
}

// ---------------------------------------------------------------------------
// Product names: fix spelling and formatting before they go on Google.
// ---------------------------------------------------------------------------

const WORD_FIXES: [RegExp, string][] = [
  [/\bpanda(?=\s*(&|and)?\s*coconut)/i, 'Pandan'],
  [/\bgery\b/i, 'Grey'],
  [/\bmascapone\b/i, 'Mascarpone'],
  [/\bmascarpone\b/i, 'Mascarpone'],
  [/\bbutter\s+cream\b/i, 'Buttercream'],
  [/\bcheescake\b/i, 'Cheesecake'],
  [/\bchesnut\b/i, 'Chestnut'],
  [/\bpistacio\b/i, 'Pistachio'],
  [/\brasberry\b/i, 'Raspberry'],
]
const SMALL_WORDS = new Set(['with', 'and', 'of', 'in', 'on', 'the', 'a', 'or'])

/** Fix known misspellings, spacing around "&", and title case. */
export function cleanProductName(name: string): string {
  let s = name.replace(/\s*&\s*/g, ' & ').replace(/\s+/g, ' ').trim().replace(/^\d+\s*[.)]\s*/, '')
  for (const [re, to] of WORD_FIXES) s = s.replace(re, to)
  return s
    .split(' ')
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function money(n: number): string {
  const opts = Number.isInteger(n) ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  return '$' + n.toLocaleString('en-AU', opts)
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const TIER_ZH: Record<Tier, string> = { Grace: 'Grace 谷歌地图套餐', Faithful: 'Faithful 全面营销套餐', Abundant: 'Abundant 全方位增长套餐' }

// ---------------------------------------------------------------------------
// Build the quote
// ---------------------------------------------------------------------------

export function buildQuote(input: QuoteInput): QuoteOutput {
  const stores = input.stores ?? []
  const storeCount = Math.max(1, stores.length, input.storeCount ?? 0)

  if (input.commitment === 'founding') {
    const n = input.foundingClientNumber ?? Infinity
    if (n > FOUNDING_OFFER.maxClients) {
      throw new Error(`The founding offer is only for the first ${FOUNDING_OFFER.maxClients} clients`)
    }
  }

  const numbers = storeQuoteEconomics(input.tier, storeCount, input.commitment)
  if (!numbers.profitable) {
    throw new Error('This quote would not be profitable from day one — change the package, stores or commitment')
  }

  // Spelling fixes first (they matter most), then formatting-only fixes.
  const bare = (s: string) => s.replace(/^\d+\s*[.)]\s*/, '').replace(/\s*&\s*/g, ' & ').replace(/\s+/g, ' ').trim()
  const productFixes = (input.products ?? [])
    .map(p => ({ from: p.name, to: cleanProductName(p.name) }))
    .filter(f => bare(f.from) !== f.to)
    .sort((a, b) => Number(bare(b.from).toLowerCase() !== b.to.toLowerCase()) - Number(bare(a.from).toLowerCase() !== a.to.toLowerCase()))

  const missingInfo: string[] = []
  const zh = input.language === 'zh'
  const t = (en: string, zhText: string) => (zh ? zhText : en)

  if (stores.length < storeCount || stores.some(s => !s.address || !s.phone || !s.hours)) {
    missingInfo.push(t('Each store\'s name, address, phone and opening hours', '各家店的店名、地址、电话和营业时间'))
  }
  if (!input.assets?.googleAccount || input.assets.googleProfileExists === undefined) {
    missingInfo.push(t('Whether each store already has a Google profile, and which email logs in', '谷歌上现在有没有店铺档案，用哪个邮箱登录'))
  }
  if ((input.products ?? []).some(p => !p.price)) {
    missingInfo.push(t('Product prices (e.g. 6-inch / 8-inch) and order lead times', '产品价格（如 6 寸 / 8 寸）和提前预订天数'))
  }
  if (storeCount > 1 && input.assets?.sameCompany === undefined) {
    missingInfo.push(t('Whether all stores are one company / ABN', '各家店是否属于同一个公司 / ABN'))
  }

  const checklist = [
    ...missingInfo,
    t('Logo and original product photos', 'Logo 和产品原图'),
    t('Who will answer calls and messages at each store', '每家店由谁接电话、回消息'),
  ]

  const agenda = zh
    ? [
        { item: '每家店的情况和优先顺序', minutes: 5 },
        { item: '当场看第一家店的谷歌地图，列出要改的地方', minutes: 10 },
        { item: '确认产品名字和价格', minutes: 5 },
        { item: '确认报价和店数', minutes: 5 },
        { item: '定下第一家店的上线日期', minutes: 5 },
      ]
    : [
        { item: 'Each store and which goes first', minutes: 5 },
        { item: 'Look at the first store on Google Maps together; list fixes', minutes: 10 },
        { item: 'Confirm product names and prices', minutes: 5 },
        { item: 'Confirm the quote and number of stores', minutes: 5 },
        { item: 'Set the go-live date for the first store', minutes: 5 },
      ]

  // Work starts only after the first payment, so every client is profitable from day one.
  const meet = input.meetingDate
  const base = meet ?? addDays(input.today, 3)
  const actions: Action[] = [
    { action: t('Send the quote message', '发送报价消息'), owner: 'PhLedger', due: input.today },
    ...(input.docLink ? [{ action: t('Share the plan document with the client', '把方案文档分享给客户'), owner: 'PhLedger' as const, due: input.today }] : []),
    { action: t('Prepare the meeting checklist', '准备会前资料'), owner: 'Client', due: addDays(base, -1) },
    { action: meet ? t('Meeting (30 minutes)', '会议（30 分钟）') : t('Agree a 30-minute meeting time', '约定 30 分钟会议时间'), owner: 'Both', due: meet ?? addDays(input.today, 2) },
    { action: t(`Accept the quote and pay the first invoice (${money(numbers.dueToday)}) via PhLedgerTax`, `确认报价并支付首期账单（${money(numbers.dueToday)}，PhLedgerTax 开票）`), owner: 'Client', due: addDays(base, 2) },
    { action: t('Claim and verify the first store\'s Google profile', '认领并验证第一家店的谷歌档案'), owner: 'PhLedger', due: addDays(base, 3) },
    { action: t('First store live on Google Maps', '第一家店谷歌地图上线'), owner: 'PhLedger', due: addDays(base, 14) },
    ...Array.from({ length: storeCount - 1 }, (_, i) => ({
      action: t(`Store ${i + 2} live (copied from the first store)`, `第 ${i + 2} 家店上线（复制第一家店）`),
      owner: 'PhLedger' as const,
      due: addDays(base, 14 + 7 * (i + 1)),
    })),
    { action: t('First monthly report and 15-minute review call', '第一份月度报告和 15 分钟回顾'), owner: 'Both', due: addDays(base, 44) },
  ]

  const message = zh ? messageZh(input, numbers, storeCount, productFixes, missingInfo) : messageEn(input, numbers, storeCount, productFixes, missingInfo)
  const out: QuoteOutput = { numbers, productFixes, missingInfo, message, checklist, agenda, actions, markdown: '' }
  out.markdown = toMarkdown(input, out)
  return out
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

type Numbers = QuoteOutput['numbers']

function priceLinesZh(input: QuoteInput, n: Numbers): string[] {
  const pkg = packages.find(p => p.tier === input.tier)!
  if (input.commitment === 'founding') {
    const s = 1 - FOUNDING_OFFER.setupDiscount
    const m = 1 - FOUNDING_OFFER.monthlyDiscount
    return [
      `• 第一家店：开通费 ${money(SETUP_FEE * s)}（原价 ${money(SETUP_FEE)}），每月 ${money(pkg.price * m)}（原价 ${money(pkg.price)}）`,
      `• 每多一家店：开通费 ${money(MULTI_STORE.extraStoreSetup * s)}（原价 ${money(MULTI_STORE.extraStoreSetup)}），每月 ${money(MULTI_STORE.extraStoreMonthly * m)}（原价 ${money(MULTI_STORE.extraStoreMonthly)}）`,
      `• 前 ${n.months} 个月预付，首付合计 ${money(n.dueToday)}，比标准价省 ${money(n.saving)}。价格锁定，不涨价。`,
    ]
  }
  const lines = [
    `• 第一家店：开通费 ${money(SETUP_FEE)}，每月 ${money(pkg.price)}`,
    `• 每多一家店：开通费 ${money(MULTI_STORE.extraStoreSetup)}，每月 ${money(MULTI_STORE.extraStoreMonthly)}`,
  ]
  if (input.commitment === 'monthly') lines.push(`• 首付（开通费 + 第一个月）：${money(n.dueToday)}。最短 3 个月，之后提前 30 天通知即可停。`)
  else lines.push(`• 预付 ${n.months} 个月，${n.setupFee === 0 ? '免开通费' : `开通费半价（${money(n.setupFee)}）`}${n.saving > 0 ? `，首付 ${money(n.dueToday)}，比按月付省 ${money(n.saving)}` : `，首付 ${money(n.dueToday)}`}。`)
  return lines
}

function priceLinesEn(input: QuoteInput, n: Numbers): string[] {
  const pkg = packages.find(p => p.tier === input.tier)!
  if (input.commitment === 'founding') {
    const s = 1 - FOUNDING_OFFER.setupDiscount
    const m = 1 - FOUNDING_OFFER.monthlyDiscount
    return [
      `• First store: setup ${money(SETUP_FEE * s)} (normally ${money(SETUP_FEE)}), ${money(pkg.price * m)} a month (normally ${money(pkg.price)})`,
      `• Each extra store: setup ${money(MULTI_STORE.extraStoreSetup * s)} (normally ${money(MULTI_STORE.extraStoreSetup)}), ${money(MULTI_STORE.extraStoreMonthly * m)} a month (normally ${money(MULTI_STORE.extraStoreMonthly)})`,
      `• First ${n.months} months paid up front: ${money(n.dueToday)} in total, ${money(n.saving)} less than the standard price. Your price is locked.`,
    ]
  }
  const lines = [
    `• First store: setup ${money(SETUP_FEE)}, ${money(pkg.price)} a month`,
    `• Each extra store: setup ${money(MULTI_STORE.extraStoreSetup)}, ${money(MULTI_STORE.extraStoreMonthly)} a month`,
  ]
  if (input.commitment === 'monthly') lines.push(`• First payment (setup + first month): ${money(n.dueToday)}. 3-month minimum, then 30 days' notice.`)
  else lines.push(`• ${n.months} months up front, ${n.setupFee === 0 ? 'setup waived' : `half-price setup (${money(n.setupFee)})`}: ${money(n.dueToday)}${n.saving > 0 ? `, saving ${money(n.saving)}` : ''}.`)
  return lines
}

function messageZh(input: QuoteInput, n: Numbers, storeCount: number, fixes: ProductFix[], missing: string[]): string {
  const founding = input.commitment === 'founding'
  const lines: string[] = []
  lines.push(`${input.contactName} 老板您好！${founding ? '谢谢您愿意做 PhLedger Marketing 的创始客户 🙏' : '谢谢您的信任 🙏'}`)
  lines.push('')
  lines.push(`我为 ${input.business} 整理了一份谷歌地图起步方案${input.docLink ? `，您有空先看看：\n${input.docLink}` : '。'}`)
  lines.push('')
  lines.push('**简单说：**')
  lines.push(`1️⃣ 先从谷歌地图（Google Maps）做起。第一家店 2 周内上线${input.nextBusyPeriod ? `，赶上${input.nextBusyPeriod.zh}` : ''}${storeCount > 1 ? '；其他店照着复制，每家大约一周' : ''}。`)
  lines.push('2️⃣ 每家店会有：正确的店名、营业时间和电话，产品带照片和价格，评价二维码卡，每周一篇帖子（我先写好，您确认后再发）。')
  lines.push('3️⃣ 现在就可以开始，不需要先做网站或公司邮箱。用店里现有的邮箱和电话就行，账号归您所有，我只做管理员。')
  lines.push('')
  lines.push(`**${founding ? '创始客户价' : '报价'}**（${TIER_ZH[input.tier]}，不含 GST${founding ? '，长期九折' : ''}）：`)
  lines.push(...priceLinesZh(input, n))
  if (founding) lines.push('• 另外请您帮个小忙：效果好的话，让我用您的真实数据做个案例（可以匿名），并在谷歌上给我留个真实评价。')
  if (fixes.length) {
    lines.push('')
    const ex = fixes.slice(0, 3).map(f => `${f.from.replace(/^\d+\s*[.)]\s*/, '')} → ${f.to}`).join('；')
    lines.push(`**另外提醒一下：** 有 ${fixes.length} 个产品名字上谷歌前要改一下，比如 ${ex}。`)
  }
  if (missing.length) {
    lines.push('')
    lines.push('见面时麻烦您准备：')
    for (const m of missing) lines.push(`• ${m}`)
  }
  lines.push('')
  lines.push(input.meetingDate ? `我们 ${input.meetingDate} 见，30 分钟就够 😊` : '您看这周哪天方便？30 分钟就够 😊')
  return lines.join('\n')
}

function messageEn(input: QuoteInput, n: Numbers, storeCount: number, fixes: ProductFix[], missing: string[]): string {
  const founding = input.commitment === 'founding'
  const lines: string[] = []
  lines.push(`Hi ${input.contactName}, ${founding ? 'thank you for being PhLedger Marketing\'s founding client 🙏' : 'thank you for your trust 🙏'}`)
  lines.push('')
  lines.push(`I've put together a Google Maps starter plan for ${input.business}${input.docLink ? `:\n${input.docLink}` : '.'}`)
  lines.push('')
  lines.push('**In short:**')
  lines.push(`1. We start with Google Maps. Your first store is live within 2 weeks${input.nextBusyPeriod ? `, in time for ${input.nextBusyPeriod.en}` : ''}${storeCount > 1 ? '; each other store follows in about a week' : ''}.`)
  lines.push('2. Each store gets the right name, hours and phone, products with photos and prices, a review QR card, and a weekly post (I draft it, you approve it).')
  lines.push('3. We can start now — no website or company email needed first. Your existing email and phone are fine; you own the accounts and I\'m a manager.')
  lines.push('')
  lines.push(`**${founding ? 'Founding-client price' : 'Quote'}** (${input.tier} package, excl. GST):`)
  lines.push(...priceLinesEn(input, n))
  if (founding) lines.push('• One favour: if it works well, let me write it up as a case study (can be anonymous) and leave an honest Google review.')
  if (fixes.length) {
    lines.push('')
    const ex = fixes.slice(0, 3).map(f => `${f.from.replace(/^\d+\s*[.)]\s*/, '')} → ${f.to}`).join('; ')
    lines.push(`**Also:** ${fixes.length} product names need fixing before they go on Google, e.g. ${ex}.`)
  }
  if (missing.length) {
    lines.push('')
    lines.push('Before we meet, could you have ready:')
    for (const m of missing) lines.push(`• ${m}`)
  }
  lines.push('')
  lines.push(input.meetingDate ? `See you on ${input.meetingDate} — 30 minutes is plenty 😊` : 'Which day suits you this week? 30 minutes is plenty 😊')
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Markdown brief for Zhi Li: everything in one place
// ---------------------------------------------------------------------------

function toMarkdown(input: QuoteInput, o: QuoteOutput): string {
  const n = o.numbers
  const md: string[] = []
  md.push(`# Quote — ${input.business} (${input.contactName})`, '')
  md.push(`Package: ${input.tier} · Stores: ${n.stores} · Commitment: ${input.commitment} · Language: ${input.language} · Channel: ${input.channel}`, '')
  md.push('## Numbers (AUD excl. GST)', '')
  md.push('| Item | Amount |', '| --- | --- |')
  md.push(`| Setup fee | ${money(n.setupFee)} (list ${money(n.listSetup)}) |`)
  md.push(`| Monthly fee, all stores | ${money(n.monthlyFee)} (list ${money(n.listMonthly)}) |`)
  md.push(`| Paid up front | ${n.months} month(s) |`)
  md.push(`| Due on acceptance | ${money(n.dueToday)} |`)
  md.push(`| Saving vs standard | ${money(n.saving)} |`)
  md.push(`| Profit over the prepaid period (internal) | ${money(n.prepaidPeriodProfit)} |`)
  md.push(`| Worst monthly margin (internal) | ${Math.round(n.monthlyMargin * 100)}% |`, '')
  md.push(`## Message to send (${input.channel})`, '', '```', o.message, '```', '')
  if (o.productFixes.length) {
    md.push('## Product name fixes', '', '| As supplied | On Google |', '| --- | --- |')
    for (const f of o.productFixes) md.push(`| ${f.from} | ${f.to} |`)
    md.push('')
  }
  md.push('## Meeting prep checklist', '')
  for (const c of o.checklist) md.push(`- [ ] ${c}`)
  md.push('', `## Agenda (${o.agenda.reduce((s, a) => s + a.minutes, 0)} minutes)`, '')
  o.agenda.forEach((a, i) => md.push(`${i + 1}. ${a.item} (${a.minutes} min)`))
  md.push('', '## Actions', '', '| Due | Owner | Action |', '| --- | --- | --- |')
  for (const a of o.actions) md.push(`| ${a.due} | ${a.owner} | ${a.action} |`)
  md.push('')
  return md.join('\n')
}
