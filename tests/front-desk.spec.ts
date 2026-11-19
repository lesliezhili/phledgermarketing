import { describe, it, expect } from "vitest"
import { FRONT_DESK, frontDeskOffer, estimate, billFrontDesk, handleCall, type CapturedOrder } from "../src/lib/front-desk"
import { frontDeskEconomics, frontDeskMinOrders, frontDeskPilotEconomics, MIN_MARGIN } from "../src/lib/economics"
import { services, serviceLabel } from "../src/lib/catalog"
import { corsHeaders } from "../src/lib/integration"

describe("offer (what phledger.com reads)", () => {
  it("keeps phledger.com's prices: $8 / $20 per order, no monthly or setup fee", () => {
    const o = frontDeskOffer("en")
    expect(o.tiers.map(t => [t.id, t.price])).toEqual([["standard", 8], ["high_value", 20]])
    expect(o.monthlyFee).toBe(0)
    expect(o.setupFee).toBe(0)
    expect(o.provider).toBe("PhLedger Marketing")
    expect(o.pilotFreeOrders).toBe(20)
  })
  it("Chinese offer has the same structure", () => {
    const en = frontDeskOffer("en"), zh = frontDeskOffer("zh")
    expect(zh.tiers.map(t => t.price)).toEqual(en.tiers.map(t => t.price))
    expect(zh.counts).toHaveLength(en.counts.length)
    expect(zh.tiers[0].name).toBe("普通订单")
  })
  it("is listed on the services page as pay per order, linking to its page", () => {
    const s = services.find(x => x.id === 13)!
    expect(serviceLabel(s)).toBe("Pay per order · $8 / $20")
    expect(s.href).toBe("/front-desk")
  })
})

describe("estimate", () => {
  it("matches phledger.com's calculator (4.3 weeks a month)", () => {
    expect(estimate({ missedPerWeek: 10, conversionPct: 40, avgOrderValue: 60, tier: "standard" }))
      .toEqual({ ordersPerMonth: 17, revenuePerMonth: 1020, feePerMonth: 136, returnPerDollar: 7.5 })
  })
  it("never estimates above the cap", () => {
    expect(estimate({ missedPerWeek: 50, conversionPct: 80, avgOrderValue: 500, tier: "high_value" }).feePerMonth).toBe(FRONT_DESK.defaultCap)
  })
})

describe("billing", () => {
  const o = (id: string, at: string, caller: string, extra: Partial<CapturedOrder> = {}): CapturedOrder =>
    ({ id, at, caller, tier: "standard", hasRequest: true, ...extra })

  it("charges real new orders only, with the reason for everything else", () => {
    const bill = billFrontDesk([
      o("1", "2026-12-01T10:00:00Z", "0412 345 678"),
      o("2", "2026-12-03T10:00:00Z", "+61412345678"), // same caller within 7 days
      o("3", "2026-12-04T10:00:00Z", "0400 000 001", { spam: true }),
      o("4", "2026-12-05T10:00:00Z", "0400 000 002", { hasRequest: false }),
      o("5", "2026-12-06T10:00:00Z", "0400 000 003", { existingCustomer: true }),
      o("6", "2026-12-07T10:00:00Z", "0400 000 004", { disputed: true }),
      o("7", "2026-12-08T10:00:00Z", "0400 000 005", { tier: "high_value" }),
    ])
    expect(bill.lines.map(l => l.reason)).toEqual([null, "duplicate", "spam", "no_request", "existing_customer", "disputed", null])
    expect(bill.amountDue).toBe(28)
  })

  it("pilot orders are free, then the cap holds", () => {
    const many = Array.from({ length: 60 }, (_, i) => o(String(i), `2026-12-01T10:${String(i).padStart(2, "0")}:00Z`, `04000001${String(i).padStart(2, "0")}`))
    const pilot = billFrontDesk(many, { pilotFreeRemaining: 20, cap: 200 })
    expect(pilot.lines.filter(l => l.reason === "pilot_free")).toHaveLength(20)
    expect(pilot.amountDue).toBe(200)
    expect(pilot.lines.some(l => l.reason === "over_cap")).toBe(true)
  })

  it("a cap below the minimum is raised to it", () => {
    expect(billFrontDesk([], { cap: 20 }).cap).toBe(FRONT_DESK.minCap)
  })
})

describe("calls", () => {
  const k = { orderLink: "https://example.com/order", hours: "9–5" }
  it("hang-up: text back with disclosure and opt-out", () => {
    const r = handleCall({ business: "Kew Plumbing", caller: "0400000000", knowledge: k, policy: { mode: "zhi_li" } })
    expect(r.mode).toBe("text_back")
    expect(r.callerMessage).toMatch(/Sorry we missed your call.*automated assistant.*STOP/)
  })
  it("answered call: spoken reply, link texted, one-screen owner summary", () => {
    const r = handleCall({ business: "Kew Plumbing", caller: "0400000000", transcript: "I want to order a service for tomorrow", knowledge: k, policy: { mode: "zhi_li" } })
    expect(r.mode).toBe("voice")
    expect(r.callerMessage).toMatch(/automated assistant/)
    expect(r.callerMessage).not.toContain("https://")
    expect(r.ownerSummary.split("\n")).toHaveLength(4)
  })
  it("complaint on the phone is flagged for the owner", () => {
    const r = handleCall({ business: "Kew Plumbing", caller: "0400000000", transcript: "The tap you fixed is broken again", knowledge: k, policy: { mode: "zhi_li" } })
    expect(r.ownerSummary).toContain("Needs you")
  })
})

describe("economics", () => {
  it("clears the minimum margin from the minimum order volume up to a busy month", () => {
    for (const tier of ["standard", "high_value"] as const) {
      for (let orders = frontDeskMinOrders(tier); orders <= 90; orders += 1) {
        expect(frontDeskEconomics(orders, tier).margin).toBeGreaterThanOrEqual(MIN_MARGIN)
      }
    }
  })
  it("minimum volumes to onboard", () => {
    expect(frontDeskMinOrders("standard")).toBe(12)
    expect(frontDeskMinOrders("high_value")).toBe(4)
  })
  it("the free pilot is an acquisition cost that pays back within a year", () => {
    for (const tier of ["standard", "high_value"] as const) {
      const p = frontDeskPilotEconomics(tier)
      expect(p.pilotCost).toBeLessThan(200)
      expect(p.paybackMonths).toBeLessThanOrEqual(12)
    }
  })
})

describe("integration access", () => {
  it("lets phledger.com call the API from the browser, and nobody else", () => {
    expect(corsHeaders("https://phledger.com")["Access-Control-Allow-Origin"]).toBe("https://phledger.com")
    expect(corsHeaders("https://www.phledger.com")["Access-Control-Allow-Origin"]).toBe("https://www.phledger.com")
    expect(corsHeaders("https://evil.example")["Access-Control-Allow-Origin"]).toBeUndefined()
    expect(corsHeaders(null)["Access-Control-Allow-Origin"]).toBeUndefined()
  })
})
