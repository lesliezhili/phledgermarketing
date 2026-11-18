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
  packages, commitments, SETUP_FEE, leadPrices, PPL, MULTI_STORE, FOUNDING_OFFER, FOUNDING_PILOT, SEO_REPUTATION, ORDER_AUTOMATION, LAUNCH_OFFER, REFERRAL, type Tier, type LeadType,
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
  extraStoreSetup: 2, // claim/verify profile, categories, hours, products, photos, review card
  afterPilotExtraSetup: 2, // Faithful/Abundant after a Google-only pilot: ads and social connections
  extraStoreMonthly: 0.5, // local posts reuse the first store's content; review replies
  seoRepSetup: 2, // SEO audit, schema, titles, review automation
  seoRepMonthly: 1, // SEO updates, approving negative-review replies
  seoRepExtraStore: 0.5,
  ordersSetup: 2,
  ordersMonthlyPerStore: 0.5, // menu updates, orders that need a person
  smsPerOrder: 3, // confirmation, reminder, thank-you
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
  const dayOneCash = monthlyFee * c.months + SETUP_FEE * (1 - c.setupDiscount)
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

/** Each extra store for an owner with several stores. */
export function extraStoreEconomics() {
  const monthlyCost = HOURS.extraStoreMonthly * COSTS.hourlyCost + COSTS.trackedNumberPerMonth + COSTS.toolsPerPackageClient
  const dayOneCash = MULTI_STORE.extraStoreSetup + MULTI_STORE.extraStoreMonthly
  const dayOneCost = HOURS.extraStoreSetup * COSTS.hourlyCost + monthlyCost
  const worstFee = MULTI_STORE.extraStoreMonthly * (1 - LOYALTY_MAX_DISCOUNT)
  return {
    dayOneCash: r2(dayOneCash),
    dayOneCost: r2(dayOneCost),
    dayOneProfit: r2(dayOneCash - dayOneCost),
    monthlyMargin: r2((worstFee - monthlyCost) / worstFee),
  }
}

/** Founding-customer offer for an owner with `stores` stores on one package tier. */
export function foundingOfferEconomics(tier: Tier, stores: number) {
  const f = FOUNDING_OFFER
  const pkg = packages.find(p => p.tier === tier)!
  const extra = Math.max(0, stores - 1)
  const setupFee = (SETUP_FEE + extra * MULTI_STORE.extraStoreSetup) * (1 - f.setupDiscount)
  const monthlyFee = (pkg.price + extra * MULTI_STORE.extraStoreMonthly) * (1 - f.monthlyDiscount)
  const extraStoreMonthlyCost = HOURS.extraStoreMonthly * COSTS.hourlyCost + COSTS.trackedNumberPerMonth + COSTS.toolsPerPackageClient
  const setupCost = packageSetupCost() + extra * HOURS.extraStoreSetup * COSTS.hourlyCost
  const monthlyCost = packageMonthlyCost(tier) + extra * extraStoreMonthlyCost
  const dayOneCash = setupFee + f.prepayMonths * monthlyFee
  const standardDayOne = SETUP_FEE + extra * MULTI_STORE.extraStoreSetup + f.prepayMonths * (pkg.price + extra * MULTI_STORE.extraStoreMonthly)
  return {
    setupFee: r2(setupFee),
    monthlyFee: r2(monthlyFee),
    dayOneCash: r2(dayOneCash),
    // cash paid up front against setup plus the whole prepaid period's work
    prepaidPeriodProfit: r2(dayOneCash - setupCost - f.prepayMonths * monthlyCost),
    monthlyMargin: r2((monthlyFee - monthlyCost) / monthlyFee),
    savingVsStandard: r2(standardDayOne - dayOneCash),
  }
}

export const extraStoreMonthlyCost = () =>
  r2(HOURS.extraStoreMonthly * COSTS.hourlyCost + COSTS.trackedNumberPerMonth + COSTS.toolsPerPackageClient)

/**
 * A full quote for an owner with one or more stores on a package — the one
 * calculation every proposal and message uses. `commitmentId` is a
 * commitment from the catalog, or 'founding' for the founding-customer offer.
 */
export function storeQuoteEconomics(tier: Tier, stores: number, commitmentId: string) {
  const pkg = packages.find(p => p.tier === tier)!
  const extra = Math.max(0, Math.floor(stores) - 1)
  const listSetup = SETUP_FEE + extra * MULTI_STORE.extraStoreSetup
  const listMonthly = pkg.price + extra * MULTI_STORE.extraStoreMonthly

  let setupFee: number, monthlyFee: number, months: number, discount: number
  if (commitmentId === 'after_pilot') {
    // Founding client continuing after the free pilot: the first store's Google
    // set-up was done in the pilot (Grace: no setup fee; bigger packages pay half
    // for the extra set-up); extra stores pay half; billed monthly in advance.
    setupFee = (tier === 'Grace' ? 0 : SETUP_FEE * (1 - FOUNDING_OFFER.setupDiscount))
      + extra * MULTI_STORE.extraStoreSetup * (1 - FOUNDING_OFFER.setupDiscount)
    discount = FOUNDING_OFFER.monthlyDiscount
    monthlyFee = listMonthly * (1 - discount)
    months = 1
  } else if (commitmentId === 'founding') {
    setupFee = listSetup * (1 - FOUNDING_OFFER.setupDiscount)
    discount = FOUNDING_OFFER.monthlyDiscount
    monthlyFee = listMonthly * (1 - discount)
    months = FOUNDING_OFFER.prepayMonths
  } else {
    const c = commitments.find(x => x.id === commitmentId)
    if (!c) throw new Error(`unknown commitment ${commitmentId}`)
    setupFee = listSetup * (1 - c.setupDiscount)
    discount = c.discount
    monthlyFee = listMonthly * (1 - discount)
    months = c.months
  }

  const firstStoreSetupHours = commitmentId === 'after_pilot' ? (tier === 'Grace' ? 0 : HOURS.afterPilotExtraSetup) : HOURS.packageSetup
  const setupCost = firstStoreSetupHours * COSTS.hourlyCost + extra * HOURS.extraStoreSetup * COSTS.hourlyCost
  const monthlyCost = packageMonthlyCost(tier) + extra * extraStoreMonthlyCost()
  const dueToday = setupFee + months * monthlyFee
  const worstFee = listMonthly * (1 - Math.max(discount, LOYALTY_MAX_DISCOUNT))
  const prepaidPeriodProfit = dueToday - setupCost - months * monthlyCost
  const monthlyMargin = (worstFee - monthlyCost) / worstFee
  return {
    stores: extra + 1,
    listSetup: r2(listSetup),
    listMonthly: r2(listMonthly),
    setupFee: r2(setupFee),
    monthlyFee: r2(monthlyFee),
    months,
    dueToday: r2(dueToday),
    standardDueToday: r2(listSetup + months * listMonthly),
    saving: r2(listSetup + months * listMonthly - dueToday),
    prepaidPeriodProfit: r2(prepaidPeriodProfit),
    monthlyMargin: r2(monthlyMargin),
    profitable: prepaidPeriodProfit > 0 && monthlyMargin >= MIN_MARGIN,
  }
}

/**
 * Founding pilot: what the free trial costs, and how many months of the
 * founding monthly price (after the pilot) it takes to earn it back.
 */
export function foundingPilotEconomics(tier: Tier = 'Grace') {
  // Time is the only real cost: the pilot uses free tools (FOUNDING_PILOT.cashCost).
  const cost = FOUNDING_PILOT.maxHours * COSTS.hourlyCost + FOUNDING_PILOT.cashCost
  const pkg = packages.find(p => p.tier === tier)!
  const monthlyProfit = pkg.price * (1 - FOUNDING_OFFER.monthlyDiscount) - packageMonthlyCost(tier)
  return { cost: r2(cost), cashCost: FOUNDING_PILOT.cashCost, monthlyProfitAfter: r2(monthlyProfit), paybackMonths: r2(cost / monthlyProfit) }
}

/** Local SEO & Reputation add-on for `stores` stores. */
export function seoReputationEconomics(stores = 1) {
  const extra = Math.max(0, stores - 1)
  const fee = SEO_REPUTATION.monthly + extra * SEO_REPUTATION.perExtraStore
  const cost = (HOURS.seoRepMonthly + extra * HOURS.seoRepExtraStore) * COSTS.hourlyCost
  const setupCost = HOURS.seoRepSetup * COSTS.hourlyCost
  const worstFee = fee * (1 - LOYALTY_MAX_DISCOUNT)
  return {
    monthlyFee: r2(fee),
    dayOneProfit: r2(SEO_REPUTATION.setup + fee - setupCost - cost),
    monthlyMargin: r2((worstFee - cost) / worstFee),
  }
}

/** Order Automation add-on for one store in a month with `orders` orders. */
export function orderAutomationEconomics(orders: number) {
  const extraOrders = Math.max(0, orders - ORDER_AUTOMATION.includedOrders)
  const fee = ORDER_AUTOMATION.monthlyPerStore + extraOrders * ORDER_AUTOMATION.perExtraOrder
  const cost = HOURS.ordersMonthlyPerStore * COSTS.hourlyCost + orders * HOURS.smsPerOrder * COSTS.smsPerMessage
  const worstFee = fee * (1 - LOYALTY_MAX_DISCOUNT)
  return {
    monthlyFee: r2(fee),
    dayOneProfit: r2(ORDER_AUTOMATION.setup + fee - HOURS.ordersSetup * COSTS.hourlyCost - cost),
    monthlyMargin: r2((worstFee - cost) / worstFee),
  }
}

/**
 * Launch offer: what 100 free months cost (time and cash), and how long the
 * converted clients take to pay it back at a given conversion rate.
 */
export function launchOfferEconomics(conversionRate: number) {
  const n = LAUNCH_OFFER.maxClients
  const timeCost = n * LAUNCH_OFFER.maxHours * COSTS.hourlyCost
  const cashCost = n * LAUNCH_OFFER.aiCostPerClient
  const paying = Math.round(n * conversionRate)
  const tier = LAUNCH_OFFER.convertsTo
  const price = packages.find(p => p.tier === tier)!.price
  const monthlyProfitEach = price - packageMonthlyCost(tier)
  const hoursPerMonth = LAUNCH_OFFER.perMonth * LAUNCH_OFFER.maxHours
  return {
    timeCost: r2(timeCost),
    cashCost: r2(cashCost),
    paying,
    monthlyProfitFromConverted: r2(paying * monthlyProfitEach),
    paybackMonths: paying ? r2((timeCost + cashCost) / (paying * monthlyProfitEach)) : Infinity,
    hoursPerMonth,
    // converted client's first payment (no setup fee) vs. their first paid month's cost
    convertedDayOneProfit: r2(price - packageMonthlyCost(tier)),
  }
}

/** A referral credit never costs more than the cheapest paid month earns. */
export function referralEconomics() {
  const cheapest = Math.min(...packages.map(p => p.price - packageMonthlyCost(p.tier)))
  return { creditPerReferral: REFERRAL.creditEach * 2, cheapestMonthlyProfit: r2(cheapest) }
}

/** Cash PhLedger pays out per client per month (not time): tools and tracked number. */
export const cashCostPerClient = () => COSTS.toolsPerPackageClient + COSTS.trackedNumberPerMonth

/** How many clients of one kind fill the available hours, and what that earns. */
export function capacity(tier: Tier) {
  const clients = Math.floor(COSTS.hoursPerMonthAvailable / HOURS.packageMonthly[tier])
  const pkg = packages.find(p => p.tier === tier)!
  const profit = clients * (pkg.price - packageMonthlyCost(tier)) - COSTS.monthlyOverhead
  return { clients, monthlyProfit: r2(profit), effectiveHourly: r2(profit / COSTS.hoursPerMonthAvailable) }
}
