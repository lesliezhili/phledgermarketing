// Service agreement generator.
//
// Builds a plain-English service agreement (with a Chinese summary for
// Chinese-speaking clients) from the same inputs and price list as the quote,
// so fees in the agreement can never differ from the quote.
//
// Break-even by design: fees are paid in advance and no work starts until the
// invoice is paid (the capped free pilot is the only exception, and it uses
// free tools only); ad spend and third-party costs are paid by the client
// directly, so PhLedger never carries the client's costs.
//
// This is a TEMPLATE, not legal advice. Have an Australian lawyer review it
// once before first use.

import {
  FOUNDING_OFFER, FOUNDING_PILOT, MIN_MONTHS, SEO_REPUTATION, ORDER_AUTOMATION, packages,
} from './catalog'
import { storeQuoteEconomics } from './economics'
import { money, type QuoteInput } from './quote'

export type AddOn = 'seo_reputation' | 'order_automation'

export interface AgreementInput extends QuoteInput {
  clientLegalName?: string // e.g. "Sir Charles Pty Ltd"
  clientAbn?: string
  addOns?: AddOn[]
  pilot?: boolean // founding pilot first (founding clients only)
  startDate?: string // YYYY-MM-DD
}

export const PROVIDER = {
  name: 'PhLedger Marketing',
  operator: 'Zhi Li',
  abn: '[PhLedger ABN]',
  email: '[PhLedger email]',
}

export interface AgreementOutput {
  fees: { item: string; oneOff: number; monthly: number }[]
  firstPayment: number // due before work starts (after the pilot, if any)
  monthlyTotal: number
  markdown: string
}

export function buildAgreement(a: AgreementInput): AgreementOutput {
  const stores = Math.max(1, a.stores?.length ?? 0, a.storeCount ?? 0)
  const extra = stores - 1
  const founding = a.commitment === 'founding' || a.commitment === 'after_pilot' || !!a.pilot
  if (founding && (a.foundingClientNumber ?? Infinity) > FOUNDING_OFFER.maxClients) {
    throw new Error(`Founding terms are only for the first ${FOUNDING_OFFER.maxClients} clients`)
  }
  const commitment = a.pilot ? 'after_pilot' : a.commitment
  const pkg = storeQuoteEconomics(a.tier, stores, commitment)
  if (!pkg.profitable) throw new Error('These terms would not be profitable from day one')
  const disc = founding ? 1 - FOUNDING_OFFER.monthlyDiscount : 1

  const fees: AgreementOutput['fees'] = [
    { item: `${a.tier} package, ${stores} store${stores > 1 ? 's' : ''}`, oneOff: pkg.setupFee, monthly: pkg.monthlyFee },
  ]
  if (a.addOns?.includes('seo_reputation')) {
    fees.push({
      item: 'Local SEO & Reputation add-on',
      oneOff: SEO_REPUTATION.setup,
      monthly: Math.round((SEO_REPUTATION.monthly + extra * SEO_REPUTATION.perExtraStore) * disc * 100) / 100,
    })
  }
  if (a.addOns?.includes('order_automation')) {
    fees.push({
      item: `Order Automation add-on (${ORDER_AUTOMATION.includedOrders} orders per store per month included, then ${money(ORDER_AUTOMATION.perExtraOrder)} per order)`,
      oneOff: ORDER_AUTOMATION.setup,
      monthly: Math.round(ORDER_AUTOMATION.monthlyPerStore * stores * disc * 100) / 100,
    })
  }
  const monthlyTotal = Math.round(fees.reduce((s, f) => s + f.monthly, 0) * 100) / 100
  const oneOffTotal = fees.reduce((s, f) => s + f.oneOff, 0)
  // First payment: all one-off fees plus the package's paid-up-front months
  // (founding: 3 months; after a pilot or monthly: 1 month) plus add-ons for 1 month.
  const addOnMonthly = monthlyTotal - pkg.monthlyFee
  const firstPayment = Math.round((oneOffTotal + pkg.months * pkg.monthlyFee + addOnMonthly) * 100) / 100

  return { fees, firstPayment, monthlyTotal, markdown: render(a, stores, pkg.months, fees, firstPayment, monthlyTotal, founding) }
}

function render(
  a: AgreementInput, stores: number, prepaidMonths: number,
  fees: AgreementOutput['fees'], firstPayment: number, monthlyTotal: number, founding: boolean,
): string {
  const client = a.clientLegalName ?? a.business
  const abn = a.clientAbn ?? '[client ABN]'
  const start = a.startDate ?? '[start date]'
  const pkgInfo = packages.find(p => p.tier === a.tier)!
  const L: string[] = []

  L.push(`# Service Agreement — ${PROVIDER.name} and ${client}`, '')
  L.push(`> Template for review. This is not legal advice: have an Australian lawyer review it before first use. Amounts are AUD and exclude GST.`, '')

  if (a.language === 'zh') {
    L.push('## 中文摘要（以英文条款为准）', '')
    if (a.pilot) {
      L.push(`- **${FOUNDING_PILOT.days} 天免费试点：** 只做 ${FOUNDING_PILOT.stores} 家店的谷歌地图和询价，不收任何费用；店长每周最多 ${FOUNDING_PILOT.maxStaffMinutesPerWeek} 分钟。试点结束您决定继续或停止，停止的话改好的东西都留给您。`)
    }
    L.push(`- **费用：** 每月 ${money(monthlyTotal)}，一次性开通费 ${money(fees.reduce((s, f) => s + f.oneOff, 0))}；${a.pilot ? '试点满意后' : '签约后'}第一次付款 ${money(firstPayment)}。按月提前付，**付款后才开始工作**。不含 GST。`)
    L.push('- **广告费：** 您直接付给谷歌 / Meta，账号归您；超出预算必须先经您同意。')
    L.push(`- **期限：** ${a.pilot ? '试点后按月，' : ''}最短 ${MIN_MONTHS} 个月，之后提前 30 天通知即可停。价格锁定，不涨价。`)
    L.push('- **审批：** 价格、优惠、超预算花费由您决定；严重差评和过敏订单马上通知您。')
    L.push('- **归属：** 所有账号、照片、内容和客户资料都归您。结束后 7 天内交还并移除我们的权限。')
    L.push('- **底线：** 不刷评价、不用好处换评价、不发垃圾信息，遵守澳洲法律和各平台规则。')
    L.push('')
  }

  L.push('## 1. Parties', '')
  L.push(`- **${PROVIDER.name}** (ABN ${PROVIDER.abn}), operated by ${PROVIDER.operator} ("we", "us").`)
  L.push(`- **${client}** (ABN ${abn}) ("you"), for ${stores} store${stores > 1 ? 's' : ''}${a.stores?.[0]?.address ? `, starting with ${a.stores[0].address}` : ''}.`)
  L.push(`- Start date: ${start}.`, '')

  L.push('## 2. Services', '')
  L.push(`We provide the ${a.tier} package (${pkgInfo.desc.replace(/\.$/, "").toLowerCase()}):`, '')
  for (const f of pkgInfo.features) L.push(`- ${f}`)
  if (a.addOns?.includes('seo_reputation')) L.push('- Local SEO on your website, AI-drafted replies to every review, and careful handling of bad reviews')
  if (a.addOns?.includes('order_automation')) L.push('- Order automation for Instagram, Facebook, RedNote, WeChat, phone and website orders')
  L.push('', 'Not included: ad spend, printing, product photography sessions, website hosting fees, and any work outside this list, which we will quote first.', '')

  if (a.pilot) {
    L.push(`## 3. Free pilot (${FOUNDING_PILOT.days} days)`, '')
    L.push(`- Scope: ${FOUNDING_PILOT.stores} store, Google Maps and enquiries only. No fee is charged for the pilot.`)
    L.push(`- We spend up to ${FOUNDING_PILOT.maxHours} hours. Your staff spend no more than ${FOUNDING_PILOT.maxStaffMinutesPerWeek} minutes a week.`)
    L.push('- We record the 30 days before the pilot as a baseline and compare on day 30.')
    L.push('- On day 30 you choose to continue on the terms below, or stop. If you stop, you owe nothing and keep everything we set up.', '')
  }

  const n = a.pilot ? 4 : 3
  L.push(`## ${n}. Fees and payment`, '')
  L.push('| Item | One-off | Monthly |', '| --- | --- | --- |')
  for (const f of fees) L.push(`| ${f.item} | ${money(f.oneOff)} | ${money(f.monthly)} |`)
  L.push(`| **Total** | **${money(fees.reduce((s, f) => s + f.oneOff, 0))}** | **${money(monthlyTotal)}** |`, '')
  L.push(`- First payment${a.pilot ? ' (only if you continue after the pilot)' : ''}: **${money(firstPayment)}**${prepaidMonths > 1 ? `, covering the one-off fees and the first ${prepaidMonths} months of the package` : ''}.`)
  L.push('- Invoices are issued through PhLedgerTax, monthly in advance, payable within 7 days. **Work starts only after payment is received.** GST is added where it applies.')
  if (founding) L.push(`- Founding-client terms: ${FOUNDING_OFFER.monthlyDiscount * 100}% off monthly fees for ${FOUNDING_OFFER.discountMonths} months; from month 13 the loyalty discount applies. The bigger discount applies; they do not stack.`)
  L.push('- Your monthly price is locked while you stay with us.', '')

  L.push(`## ${n + 1}. Ad spend and other costs`, '')
  L.push('- Ads run in your own Google Ads / Meta accounts. You pay ad spend directly to the platform; we never pay it on your behalf.')
  L.push('- We set daily budgets within the monthly plan you approve. Spending more than the plan needs your written approval (email or WeChat).', '')

  L.push(`## ${n + 2}. Term and ending the agreement`, '')
  L.push(`- Monthly plan: minimum ${MIN_MONTHS} months${a.pilot ? ' after the pilot' : ''}, then either party may end it with 30 days' written notice.`)
  L.push('- Either party may end it immediately if the other seriously breaches it and does not fix it within 14 days of notice.')
  L.push('- Fees already paid for a period that has started are not refunded, except where the law requires.', '')

  L.push(`## ${n + 3}. Approvals`, '')
  const mode = a.approvals?.mode ?? 'zhi_li'
  const modeText = mode === 'auto_simple'
    ? 'simple, low-risk actions (budget within plan, thank-you replies, Google posts) run automatically; other content is approved by us'
    : mode === 'zhi_li_and_client' ? 'we approve content, then you approve it before it is published' : 'we approve content before it is published'
  L.push(`- Approval mode: ${modeText}. Enquiry replies and confirmations of checked orders are sent automatically.`)
  L.push('- Always your decision: prices, discounts and offers, and any spend above the plan.')
  L.push('- We tell you within 1 hour about any review mentioning food safety, allergies, injury or legal issues, and about any order with an allergy note.')
  L.push('- Every action is logged with who approved it; you can ask for the log at any time.', '')

  L.push(`## ${n + 4}. Ownership and access`, '')
  L.push('- You own your accounts (Google, Meta, WeChat, RedNote, website), content, photos and customer lists. We are added as a manager, not an owner.')
  L.push('- When the agreement ends, we hand over everything we made and remove our access within 7 days.', '')

  L.push(`## ${n + 5}. Your part`, '')
  L.push('- Give us accurate details: prices, opening hours, products and allergen information.')
  L.push('- Answer customers we pass to you, and respond to urgent alerts.')
  L.push('- Only give us photos and content you have the right to use. We use influencer content only with the creator\'s permission.', '')

  L.push(`## ${n + 6}. How we work`, '')
  L.push('- Honest marketing only: no fake or paid reviews, no rewards for reviews, no asking only happy customers.')
  L.push('- We follow the Spam Act 2003 (consent and unsubscribe for marketing messages), the Australian Privacy Principles where they apply, and each platform\'s rules. Automated replies say they are automated.')
  L.push('- Results depend on many things outside our control (platforms, demand, your operations), so we do not guarantee specific sales. We report monthly on results from tracked sources: tracked links, QR codes, order page and Google profile insights.', '')

  L.push(`## ${n + 7}. Confidentiality and privacy`, '')
  L.push('- We use your business and customer information only to provide these services, keep it secure, and do not sell or share it.', '')

  if (founding) {
    L.push(`## ${n + 8}. Case study`, '')
    L.push('- With your approval of the final text, we may publish a case study of the results (anonymised if you prefer). You can withdraw consent before it is published.', '')
  }

  const g = founding ? n + 9 : n + 8
  L.push(`## ${g}. Liability`, '')
  L.push('- Nothing in this agreement excludes rights you have under the Australian Consumer Law.')
  L.push('- Otherwise, our total liability is limited to the fees you paid in the 3 months before the claim. We are not liable for platform decisions (such as account suspensions or ad rejections) outside our control.', '')

  L.push(`## ${g + 1}. General`, '')
  L.push('- Governed by the laws of Victoria, Australia. If there is a dispute, we will first talk in good faith, then try mediation before any court action.')
  L.push('- This is the whole agreement. Changes must be in writing and agreed by both parties.')
  if (a.language === 'zh') L.push('- The Chinese summary is for convenience; the English terms prevail.')
  L.push('')

  L.push('## Signatures', '')
  L.push(`| | ${PROVIDER.name} | ${client} |`, '| --- | --- | --- |', '| Name | ' + PROVIDER.operator + ' | |', '| Signature | | |', '| Date | | |')
  return L.join('\n') + '\n'
}
