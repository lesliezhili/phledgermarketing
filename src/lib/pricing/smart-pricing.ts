// lib/pricing/smart-pricing.ts -- AI-driven dynamic pricing engine.
import {
  BASE_RATES, DEFAULT_RATE, MULT_MIN, MULT_MAX, PEAK_HOURS, OFFPEAK_HOURS,
  NDIS_PRICE_CAPS, GST_RATE, PLATFORM_FEE_RATE, MAX_TOTAL_DISCOUNT,
} from './config'
import { scoreSustainability, type SustainabilityContext } from './sustainability'
import { evaluatePromotions, type CustomerFlags } from './promotions'

export interface QuoteInput {
  category: string
  hours: number
  startHour: number
  leadTimeHours?: number
  providerLoadPct?: number
  fundingScheme?: 'ndis' | 'tac' | 'worksafe' | 'dva' | 'private'
  flags?: CustomerFlags
  green?: SustainabilityContext
  bundleCount?: number
  promoCode?: string
}

export interface QuoteBreakdown {
  category: string
  baseRate: number
  demandMultiplier: number
  dynamicRate: number
  cappedRate: number
  hours: number
  gross: number
  promotions: { id: string; label: string; pct: number }[]
  discountPct: number
  sustainability: { score: number; rebatePct: number; reasons: string[] }
  discountTotal: number
  net: number
  gst: number
  platformFee: number
  customerTotal: number
  providerPayout: number
  signals: Record<string, number>
}

function demandMultiplier(i: QuoteInput): { mult: number; signals: Record<string, number> } {
  const peak = PEAK_HOURS.includes(i.startHour) ? 1 : OFFPEAK_HOURS.includes(i.startHour) ? -1 : 0
  const load = ((i.providerLoadPct ?? 50) - 50) / 50
  const lead = i.leadTimeHours == null ? 0 : i.leadTimeHours < 24 ? 1 : i.leadTimeHours > 168 ? -0.5 : 0
  const W = { peak: 0.12, load: 0.15, urgency: 0.10 }
  const delta = W.peak * peak + W.load * load + W.urgency * lead
  const mult = Math.max(MULT_MIN, Math.min(MULT_MAX, Number((1 + delta).toFixed(4))))
  return { mult, signals: { peak, load, lead, delta: Number(delta.toFixed(4)) } }
}

export function computeSmartQuote(i: QuoteInput): QuoteBreakdown {
  const baseRate = BASE_RATES[i.category] ?? DEFAULT_RATE
  const { mult, signals } = demandMultiplier(i)
  const dynamicRate = Number((baseRate * mult).toFixed(2))

  let cappedRate = dynamicRate
  if (i.fundingScheme === 'ndis') {
    const cap = NDIS_PRICE_CAPS[i.category] ?? 0
    if (cap > 0) cappedRate = Math.min(dynamicRate, cap)
  }

  const gross = Number((cappedRate * i.hours).toFixed(2))
  const promo = evaluatePromotions({ flags: i.flags, startHour: i.startHour, bundleCount: i.bundleCount, code: i.promoCode })
  const green = scoreSustainability({ ...(i.green ?? {}), startHour: i.startHour })
  const discountPct = Number(Math.min(MAX_TOTAL_DISCOUNT, promo.bestDiscountPct + green.rebatePct).toFixed(4))
  const discountTotal = Number((gross * discountPct).toFixed(2))
  const net = Number((gross - discountTotal).toFixed(2))
  const gst = Number((net * GST_RATE).toFixed(2))
  const platformFee = Number((net * PLATFORM_FEE_RATE).toFixed(2))
  const customerTotal = Number((net + gst).toFixed(2))
  const providerPayout = Number((net - platformFee).toFixed(2))

  return {
    category: i.category, baseRate, demandMultiplier: mult, dynamicRate, cappedRate,
    hours: i.hours, gross,
    promotions: promo.applicable.map(p => ({ id: p.id, label: p.label, pct: p.pct })),
    discountPct, sustainability: green, discountTotal, net, gst, platformFee,
    customerTotal, providerPayout, signals,
  }
}
