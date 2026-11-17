// Unit economics: is PhLedger Marketing profitable from day one?
//
// Rules this file enforces (tests/economics.spec.ts fails if a price,
// discount or hour budget breaks them):
//   1. Every new client pays more on day one than they cost on day one.
//   2. Every client keeps at least MIN_MARGIN gross margin every month,
//      even at the biggest discount they can get.
//   3. A pay-per-lead client with zero leads still covers their own costs.
//   4. Moving from pay per lead to a package is profitable on day one.
//
// All costs are ASSUMPTIONS in AUD excl. GST — change them here.

import {
  packages, commitments, SETUP_FEE, leadPrices, PPL, type Tier, type LeadType,
} from './catalog'

export const COSTS = {
  hourlyCost: 60, // value of Zhi Li's hour (a sustainable owner wage + super + overheads)
  toolsPerPackageClient: 15, // share of scheduler, design, database, AI per client per month
  trackedNumberPerMonth: 15, // call-tracking number per pay-per-lead or package client
  smsPerMessage: 0.1, // one outbound SMS
  monthlyOverhead: 100, // business-wide: domain, AI subscription, insurance share
  hoursPerMonthAvailable: 120, // about 30 hours a week of client work
}

// Hour budgets with automation doing the drafting, scheduling and reports.
// The agent drafts; Zhi Li approves in batches. These are limits, not targets.
export const HOURS = {
  packageSetup: 6, // fix the basics: offer, page, QR codes, profiles, tracking
  // Grace is fully automated: approve 8 drafted posts and review replies (1h).
  packageMonthly: { Grace: 1, Faithful: 3, Abundant: 7 } as Record<Tier, number>,
  pplSetup: 1.5, // tracked number + form, Google profile tune-up, speed-to-lead
  pplMonthlyBase: 0.25, // automated posts approved in a weekly batch, auto report
  minutesPerLead: 3, // check, log, hand over (most is automated)
  smsPerLead: 3, // first reply + up to 2 messages
  upgradeSetup: 4, // package setup after PPL: profile, number and page already exist
  healthCheck: 0.5, // free check, mostly drafted by the skill
}

export const MIN_MARGIN = 0.25 // at the deepest discount a client can get
const LOYALTY_MAX_DISCOUNT = 0.1 // loyalty from month 13; the bigger of loyalty/prepay applies

const r2 = (n: number) => Math.round(n * 100) / 100

export function packageMonthlyCost(tier: Tier) {
  return r2(HOURS.packageMonthly[tier] * COSTS.hourlyCost + COSTS.toolsPerPackageClient + COSTS.trackedNumberPerMonth)
}

export const packageSetupCost = () => r2(HOURS.packageSetup * COSTS.hourlyCost)

/** Day one and steady-state numbers for a package and way of paying. */
export function packageEconomics(tier: Tier, commitmentId = 'monthly') {
  const pkg = packages.find(p => p.tier === tier)!
  const c = commitments.find(x => x.id === commitmentId)!
  const monthlyFee = pkg.price * (1 - c.discount)
  const dayOneCash = monthlyFee * c.months + (c.setupWaived ? 0 : SETUP_FEE)
  const dayOneCost = packageSetupCost() + packageMonthlyCost(tier) // setup + first month's work
  const worstFee = pkg.price * (1 - Math.max(c.discount, LOYALTY_MAX_DISCOUNT))
  const monthlyCost = packageMonthlyCost(tier)
  return {
    dayOneCash: r2(dayOneCash),
    dayOneCost: r2(dayOneCost),
    dayOneProfit: r2(dayOneCash - dayOneCost),
    monthlyMargin: r2((worstFee - monthlyCost) / worstFee),
    monthlyProfitAtWorst: r2(worstFee - monthlyCost),
  }
}

export const pplSetupCost = () => r2(HOURS.pplSetup * COSTS.hourlyCost + COSTS.trackedNumberPerMonth)
export const pplMonthlyBaseCost = () => r2(HOURS.pplMonthlyBase * COSTS.hourlyCost + COSTS.trackedNumberPerMonth)
export const costPerLead = () => r2((HOURS.minutesPerLead / 60) * COSTS.hourlyCost + HOURS.smsPerLead * COSTS.smsPerMessage)

/** Pay per lead: day one, an empty month, and a month with leads. */
export function payPerLeadEconomics(leads: Partial<Record<LeadType, number>> = {}) {
  const leadRevenue = (Object.entries(leads) as [LeadType, number][])
    .reduce((s, [type, n]) => s + leadPrices.find(l => l.type === type)!.price * n, 0)
  const leadCount = Object.values(leads).reduce((s, n) => s + (n || 0), 0)
  // The monthly minimum counts toward leads: the client pays whichever is higher.
  const revenue = Math.max(leadRevenue, PPL.monthlyMinimum)
  const cost = pplMonthlyBaseCost() + leadCount * costPerLead()
  return {
    dayOneCash: r2(PPL.startupFee + PPL.monthlyMinimum), // start-up fee + first month's minimum, in advance
    dayOneCost: r2(pplSetupCost() + pplMonthlyBaseCost()),
    dayOneProfit: r2(PPL.startupFee + PPL.monthlyMinimum - pplSetupCost() - pplMonthlyBaseCost()),
    monthRevenue: r2(revenue),
    monthCost: r2(cost),
    monthProfit: r2(revenue - cost),
  }
}

/** Moving from pay per lead to a monthly package, with the largest credit. */
export function upgradeEconomics(tier: Tier) {
  const pkg = packages.find(p => p.tier === tier)!
  const dayOneCash = SETUP_FEE - PPL.upgradeCreditMax + pkg.price
  const dayOneCost = HOURS.upgradeSetup * COSTS.hourlyCost + packageMonthlyCost(tier)
  return { dayOneCash: r2(dayOneCash), dayOneCost: r2(dayOneCost), dayOneProfit: r2(dayOneCash - dayOneCost) }
}

/** How many clients of one kind fill the available hours, and what that earns. */
export function capacity(tier: Tier) {
  const clients = Math.floor(COSTS.hoursPerMonthAvailable / HOURS.packageMonthly[tier])
  const pkg = packages.find(p => p.tier === tier)!
  const profit = clients * (pkg.price - packageMonthlyCost(tier)) - COSTS.monthlyOverhead
  return { clients, monthlyProfit: r2(profit), effectiveHourly: r2(profit / COSTS.hoursPerMonthAvailable) }
}
