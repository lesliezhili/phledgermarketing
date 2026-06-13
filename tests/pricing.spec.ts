import { describe, it, expect } from "vitest"
import { computeSmartQuote } from "../lib/pricing/smart-pricing"

describe("smart-pricing invariants", () => {
  it("clamps the demand multiplier within [0.80, 1.35]", () => {
    const q = computeSmartQuote({ category: "personalCare", hours: 2, startHour: 8, providerLoadPct: 95, leadTimeHours: 1 })
    expect(q.demandMultiplier).toBeGreaterThanOrEqual(0.80)
    expect(q.demandMultiplier).toBeLessThanOrEqual(1.35)
  })
  it("floors the multiplier at 0.80 for off-peak + low load + long lead", () => {
    const q = computeSmartQuote({ category: "itSupport", hours: 1, startHour: 12, providerLoadPct: 0, leadTimeHours: 200 })
    expect(q.demandMultiplier).toBe(0.80)
  })
  it("applies the NDIS price cap (personalCare <= 78.81)", () => {
    const q = computeSmartQuote({ category: "personalCare", hours: 2, startHour: 8, providerLoadPct: 95, leadTimeHours: 1, fundingScheme: "ndis" })
    expect(q.cappedRate).toBeLessThanOrEqual(78.81)
    expect(q.cappedRate).toBeLessThanOrEqual(q.dynamicRate)
  })
  it("caps the total discount at 30%", () => {
    const q = computeSmartQuote({ category: "domestic", hours: 3, startHour: 12,
      flags: { firstBooking: true, referred: true, senior: true, loyaltyYears: 5 },
      bundleCount: 3, promoCode: "WELCOME10", green: { remote: true, paperless: true, distanceKm: 2 } })
    expect(q.discountPct).toBe(0.30)
  })
  it("GST=10%, platform fee=8% of net, and totals reconcile", () => {
    const q = computeSmartQuote({ category: "personalCare", hours: 2, startHour: 8, providerLoadPct: 80, leadTimeHours: 10 })
    expect(q.gst).toBeCloseTo(Number((q.net * 0.10).toFixed(2)), 2)
    expect(q.platformFee).toBeCloseTo(Number((q.net * 0.08).toFixed(2)), 2)
    expect(q.customerTotal).toBeCloseTo(Number((q.net + q.gst).toFixed(2)), 2)
    expect(q.providerPayout).toBeCloseTo(Number((q.net - q.platformFee).toFixed(2)), 2)
  })
})
