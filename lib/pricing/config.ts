// lib/pricing/config.ts -- tunable parameters for the smart-pricing engine.
export const DEFAULT_RATE = 60
export const BASE_RATES: Record<string, number> = {
  personalCare: 72, nursing: 95, transport: 45, domestic: 58, social: 52,
  meals: 40, gardening: 56, itSupport: 65,
  musicLesson: 50, artClass: 50, digitalLiteracy: 55,
}
export const MULT_MIN = 0.80
export const MULT_MAX = 1.35
export const PEAK_HOURS = [7, 8, 17, 18, 19]
export const OFFPEAK_HOURS = [10, 11, 12, 13, 14]
export const NDIS_PRICE_CAPS: Record<string, number> = {
  personalCare: 78.81, domestic: 57.10, social: 67.56,
}
export const GST_RATE = 0.10
export const PLATFORM_FEE_RATE = 0.08
export const SUSTAINABILITY_REBATE_MAX = 0.06
export const MAX_TOTAL_DISCOUNT = 0.30
