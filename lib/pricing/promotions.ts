// lib/pricing/promotions.ts -- promotion/discount rules engine.
import { MAX_TOTAL_DISCOUNT } from './config'

export interface CustomerFlags {
  firstBooking?: boolean
  senior?: boolean
  loyaltyYears?: number
  referred?: boolean
}

export interface PromoContext {
  flags?: CustomerFlags
  startHour?: number
  bundleCount?: number
  code?: string
}

export interface Promotion { id: string; label: string; pct: number; stackable: boolean }

const OFFPEAK = [10, 11, 12, 13, 14]
const CODES: Record<string, Promotion> = {
  WELCOME10: { id: 'WELCOME10', label: 'Welcome code', pct: 0.10, stackable: false },
  GREEN5:    { id: 'GREEN5',    label: 'Green code',   pct: 0.05, stackable: true },
}

export function evaluatePromotions(ctx: PromoContext = {}): {
  applicable: Promotion[]; bestDiscountPct: number
} {
  const f = ctx.flags ?? {}
  const all: Promotion[] = []
  if (f.firstBooking) all.push({ id: 'FIRST', label: 'First booking', pct: 0.15, stackable: false })
  if (f.referred)     all.push({ id: 'REFERRAL', label: 'Referral', pct: 0.10, stackable: false })
  const yrs = f.loyaltyYears ?? 0
  if (yrs >= 1) all.push({ id: 'LOYALTY', label: 'Loyalty ' + yrs + 'y', pct: Math.min(0.10, 0.02 * yrs), stackable: true })
  if (f.senior) all.push({ id: 'SENIOR', label: 'Senior', pct: 0.05, stackable: true })
  if (ctx.startHour != null && OFFPEAK.includes(ctx.startHour))
    all.push({ id: 'OFFPEAK', label: 'Off-peak', pct: 0.07, stackable: true })
  if ((ctx.bundleCount ?? 1) >= 3)
    all.push({ id: 'BUNDLE', label: 'Bundle 3+', pct: 0.08, stackable: true })
  if (ctx.code && CODES[ctx.code.toUpperCase()]) all.push(CODES[ctx.code.toUpperCase()])

  const nonStack = all.filter(p => !p.stackable).reduce((m, p) => Math.max(m, p.pct), 0)
  const stack    = all.filter(p => p.stackable).reduce((s, p) => s + p.pct, 0)
  const bestDiscountPct = Number(Math.min(MAX_TOTAL_DISCOUNT, nonStack + stack).toFixed(4))
  return { applicable: all, bestDiscountPct }
}
