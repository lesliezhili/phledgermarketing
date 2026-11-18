// The goal for every client, measured monthly:
//   more leads → more purchases → loyal repeat customers,
// won by service and products that beat expectations on price and quality.
//
// `funnel` turns the month's numbers into rates and flags the weakest step,
// so the monthly report (and next month's plan) works on the right thing.

export interface FunnelInput {
  leads: number // enquiries, calls, messages (all channels)
  orders: number // purchases from those leads (tracked)
  customers: number // distinct customers who bought this month
  repeatCustomers: number // of those, how many had bought before
  avgRating?: number // Google rating this month
  repliedWithin60s?: number // share of enquiries answered within 60 seconds (0–1)
}

export const FUNNEL_TARGETS = {
  conversion: 0.3, // 30% of leads become orders
  repeatRate: 0.35, // 35% of customers are returning customers
  rating: 4.6, // "over expectation" shows up in reviews
  replySpeed: 0.9, // 90% of enquiries answered within 60 seconds
}

export type FunnelStep = 'leads' | 'conversion' | 'loyalty' | 'quality' | 'speed'

export interface FunnelResult {
  conversion: number | null
  repeatRate: number | null
  belowTarget: FunnelStep[]
  focus: FunnelStep | null // the one thing to improve next month
}

const r2 = (n: number) => Math.round(n * 100) / 100

export function funnel(f: FunnelInput, previousLeads?: number): FunnelResult {
  const conversion = f.leads ? r2(f.orders / f.leads) : null
  const repeatRate = f.customers ? r2(f.repeatCustomers / f.customers) : null
  const below: FunnelStep[] = []
  // Order of importance: answer fast, keep quality high, convert, keep customers, then grow leads.
  if (f.repliedWithin60s !== undefined && f.repliedWithin60s < FUNNEL_TARGETS.replySpeed) below.push('speed')
  if (f.avgRating !== undefined && f.avgRating < FUNNEL_TARGETS.rating) below.push('quality')
  if (conversion !== null && conversion < FUNNEL_TARGETS.conversion) below.push('conversion')
  if (repeatRate !== null && repeatRate < FUNNEL_TARGETS.repeatRate) below.push('loyalty')
  if (previousLeads !== undefined && f.leads <= previousLeads) below.push('leads')
  return { conversion, repeatRate, belowTarget: below, focus: below[0] ?? null }
}
