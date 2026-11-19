import { describe, it, expect } from "vitest"
import { PILOT_STACK, pilotCashCost, upgradesMonthlyCost, pilotStackMarkdown } from "../src/lib/pilot-stack"
import { FOUNDING_PILOT, packages } from "../src/lib/catalog"
import { cashCostPerClient, COSTS } from "../src/lib/economics"

describe("free tools for the pilot", () => {
  it("the pilot costs PhLedger no cash, matching the pilot terms", () => {
    expect(pilotCashCost()).toBe(0)
    expect(FOUNDING_PILOT.cashCost).toBe(0)
  })

  it("covers every pilot need with a free tool", () => {
    const needs = PILOT_STACK.map(i => i.need.toLowerCase()).join(" | ")
    for (const n of ["google maps", "ads", "seo", "order", "qr", "instagram", "missed calls", "wechat", "rednote", "records"]) {
      expect(needs).toContain(n)
    }
    expect(PILOT_STACK.every(i => i.freeTool.length > 0)).toBe(true)
  })

  it("paid upgrades are budgeted in the per-client cash costs every package already covers", () => {
    expect(upgradesMonthlyCost()).toBeLessThanOrEqual(cashCostPerClient())
    // and the cheapest package's fee covers those costs with room to spare
    const cheapest = Math.min(...packages.map(p => p.price))
    expect(cheapest * 0.9).toBeGreaterThan(cashCostPerClient() + COSTS.hourlyCost) // even at the founding/loyalty price
  })

  it("prints a table for the client plan", () => {
    expect(pilotStackMarkdown()).toContain("| Google Maps profile, posts, review replies, insights |")
  })
})
