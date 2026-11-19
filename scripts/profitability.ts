// npm run profitability
//
// Is PhLedger Marketing profitable, and by what percentage? Uses the same
// cost model the tests enforce (src/lib/economics.ts). Two views:
//   - Margin after paying Zhi Li $60 an hour (COSTS.hourlyCost) — the
//     business's own profit on top of a wage.
//   - Cash margin — before paying Zhi Li anything (only tools, phone numbers,
//     SMS, voice minutes and AI): what lands in the bank account.
import { writeFileSync, mkdirSync } from 'node:fs'
import { packages, AI_CUSTOMER_SERVICE, SEO_REPUTATION, ORDER_AUTOMATION, PPL } from '../src/lib/catalog'
import {
  COSTS, HOURS, CS_COST_PER_CONVERSATION, FRONT_DESK_COSTS,
  packageMonthlyCost, payPerLeadEconomics, costPerLead, pplMonthlyBaseCost,
  aiCustomerServiceEconomics, seoReputationEconomics, orderAutomationEconomics,
  frontDeskEconomics, frontDeskCostPerOrder, capacity,
} from '../src/lib/economics'

const pct = (n: number) => `${Math.round(n * 100)}%`
const aud = (n: number) => `$${Math.round(n).toLocaleString('en-AU')}`

interface Line { product: string; revenue: number; cost: number; cashCost: number; hours: number }

const lines: Line[] = []
for (const p of packages) {
  const hours = HOURS.packageMonthly[p.tier]
  lines.push({ product: `${p.tier} package`, revenue: p.price, cost: packageMonthlyCost(p.tier), cashCost: COSTS.toolsPerPackageClient + COSTS.trackedNumberPerMonth, hours })
}
{
  const ppl = payPerLeadEconomics({ enquiry: 8, call: 4 }) // a typical tiny-business month
  const hours = HOURS.pplMonthlyBase + (12 * HOURS.minutesPerLead) / 60
  lines.push({ product: 'Pay per lead (8 enquiries + 4 calls)', revenue: ppl.monthRevenue, cost: ppl.monthCost, cashCost: COSTS.trackedNumberPerMonth + 12 * HOURS.smsPerLead * COSTS.smsPerMessage, hours })
  void costPerLead; void pplMonthlyBaseCost; void PPL
}
{
  const e = aiCustomerServiceEconomics(200)
  lines.push({ product: 'AI Customer Service add-on (200 conversations)', revenue: e.monthlyFee, cost: e.monthlyCost, cashCost: 200 * CS_COST_PER_CONVERSATION, hours: HOURS.csMonthly })
  void AI_CUSTOMER_SERVICE
}
{
  const fee = SEO_REPUTATION.monthly
  const cost = HOURS.seoRepMonthly * COSTS.hourlyCost
  lines.push({ product: 'SEO & Reputation add-on', revenue: fee, cost, cashCost: 0, hours: HOURS.seoRepMonthly })
  void seoReputationEconomics
}
{
  const e = orderAutomationEconomics(100)
  const fee = ORDER_AUTOMATION.monthlyPerStore
  lines.push({ product: 'Order Automation add-on (100 orders)', revenue: fee, cost: HOURS.ordersMonthlyPerStore * COSTS.hourlyCost + 100 * HOURS.smsPerOrder * COSTS.smsPerMessage, cashCost: 100 * HOURS.smsPerOrder * COSTS.smsPerMessage, hours: HOURS.ordersMonthlyPerStore })
  void e
}
for (const [orders, tier] of [[12, 'standard'], [30, 'standard'], [6, 'high_value']] as const) {
  const e = frontDeskEconomics(orders, tier)
  lines.push({ product: `AI Front Desk (${orders} ${tier === 'standard' ? '$8' : '$20'} orders)`, revenue: e.fee, cost: e.cost, cashCost: FRONT_DESK_COSTS.fixedMonthly + orders * frontDeskCostPerOrder(), hours: FRONT_DESK_COSTS.hoursMonthly })
}

// A realistic month-12 client mix (base case): the paying clients one person can serve.
const mix: [string, number][] = [
  ['Grace package', 18], ['Faithful package', 8], ['Abundant package', 2],
  ['Pay per lead (8 enquiries + 4 calls)', 6],
  ['AI Customer Service add-on (200 conversations)', 6], ['SEO & Reputation add-on', 4], ['Order Automation add-on (100 orders)', 2],
  ['AI Front Desk (30 $8 orders)', 6],
]
let rev = 0, cost = 0, cash = 0, hours = 0
for (const [name, n] of mix) {
  const l = lines.find(x => x.product === name)!
  rev += l.revenue * n; cost += l.cost * n; cash += l.cashCost * n; hours += l.hours * n
}
cost += COSTS.monthlyOverhead; cash += COSTS.monthlyOverhead
const ownerPay = hours * COSTS.hourlyCost

const md = [
  '# PhLedger Marketing — profitability',
  '',
  `Cost model: Zhi Li's time at ${aud(COSTS.hourlyCost)}/hour, ${aud(COSTS.monthlyOverhead)}/month overhead, tools ${aud(COSTS.toolsPerPackageClient)} and a tracked number ${aud(COSTS.trackedNumberPerMonth)} per client, SMS ${Math.round(COSTS.smsPerMessage * 100)}c each. AUD ex GST, full price (no loyalty discount). Client ad spend is paid by the client and not counted.`,
  '',
  '## Per product, per month',
  '',
  '| Product | Revenue | Cost incl. $60/h | Margin after paying Zhi Li | Cash margin | Effective $/hour |',
  '| --- | ---: | ---: | ---: | ---: | ---: |',
  ...lines.map(l => `| ${l.product} | ${aud(l.revenue)} | ${aud(l.cost)} | ${pct((l.revenue - l.cost) / l.revenue)} | ${pct((l.revenue - l.cashCost) / l.revenue)} | ${aud((l.revenue - l.cashCost) / l.hours)} |`),
  '',
  '## Month 12, base case',
  '',
  `Mix: ${mix.map(([n, c]) => `${c} × ${n}`).join('; ')}.`,
  '',
  `- Revenue: ${aud(rev)} a month (${aud(rev * 12)} a year at that run rate)`,
  `- Hours: ${Math.round(hours)} a month of ${COSTS.hoursPerMonthAvailable} available`,
  `- Cash costs: ${aud(cash)} → cash profit ${aud(rev - cash)} (${pct((rev - cash) / rev)})`,
  `- After paying Zhi Li ${aud(ownerPay)} (${Math.round(hours)} h × ${aud(COSTS.hourlyCost)}): business profit ${aud(rev - cost)} (${pct((rev - cost) / rev)})`,
  `- Zhi Li's effective hourly earnings: ${aud((rev - cash) / hours)}`,
  '',
  '## Ceiling (hours full)',
  '',
  ...packages.map(p => { const c = capacity(p.tier); return `- All ${p.tier}: ${c.clients} clients, ${aud(c.monthlyProfit)}/month profit after pay and overhead` }),
].join('\n')

mkdirSync('clients/out', { recursive: true })
writeFileSync('clients/out/profitability.md', md)
console.log(md)
