import { describe, it, expect } from "vitest"
import {
  packageEconomics, payPerLeadEconomics, upgradeEconomics, capacity, costPerLead,
  packageSetupCost, extraStoreEconomics, foundingOfferEconomics, storeQuoteEconomics, MIN_MARGIN, COSTS,
} from "../src/lib/economics"
import { packages, commitments, leadPrices, PPL, SETUP_FEE, LEAD_RULES } from "../src/lib/catalog"

// These tests fail if any price, discount or hour budget makes PhLedger
// Marketing lose money on a client's first day or in any month.

describe("profitable from day one", () => {
  for (const pkg of packages) {
    for (const c of commitments) {
      it(`${pkg.tier}, ${c.name}: day-one cash covers day-one cost`, () => {
        const e = packageEconomics(pkg.tier, c.id)
        expect(e.dayOneProfit).toBeGreaterThan(0)
      })
      it(`${pkg.tier}, ${c.name}: margin stays above ${MIN_MARGIN * 100}% at the biggest discount`, () => {
        expect(packageEconomics(pkg.tier, c.id).monthlyMargin).toBeGreaterThanOrEqual(MIN_MARGIN)
      })
    }
    it(`moving from pay per lead to ${pkg.tier} is profitable on day one, with the largest credit`, () => {
      expect(upgradeEconomics(pkg.tier).dayOneProfit).toBeGreaterThan(0)
    })
  }

  it("each extra store is profitable on day one and keeps the minimum margin", () => {
    const e = extraStoreEconomics()
    expect(e.dayOneProfit).toBeGreaterThan(0)
    expect(e.monthlyMargin).toBeGreaterThanOrEqual(MIN_MARGIN)
  })

  for (const pkg of packages) {
    it(`founding offer on ${pkg.tier} is profitable for 1 to 10 stores`, () => {
      for (let stores = 1; stores <= 10; stores++) {
        const e = foundingOfferEconomics(pkg.tier, stores)
        expect(e.prepaidPeriodProfit, `${stores} stores`).toBeGreaterThan(0)
        expect(e.monthlyMargin, `${stores} stores`).toBeGreaterThanOrEqual(MIN_MARGIN)
        expect(e.savingVsStandard).toBeGreaterThan(0)
      }
    })
  }

  it("the setup fee covers the setup work", () => {
    expect(SETUP_FEE).toBeGreaterThan(packageSetupCost())
  })

  it("pay per lead: start-up fee and first minimum cover set-up and the first month", () => {
    expect(payPerLeadEconomics().dayOneProfit).toBeGreaterThan(0)
  })

  it("pay per lead: a month with no leads still covers its own cost", () => {
    expect(payPerLeadEconomics({}).monthProfit).toBeGreaterThan(0)
  })

  it("pay per lead: every lead earns at least twice what it costs to handle", () => {
    for (const l of leadPrices) expect(l.price).toBeGreaterThanOrEqual(2 * costPerLead())
    const busy = payPerLeadEconomics({ enquiry: 10, call: 5, business: 2 })
    expect(busy.monthProfit).toBeGreaterThan(busy.monthCost)
  })

  it("pay per lead has no free leads and a default cap above the minimum", () => {
    expect(LEAD_RULES.freeLeads).toBe(0)
    expect(LEAD_RULES.defaultMonthlyCap).toBeGreaterThan(PPL.monthlyMinimum)
  })

  it("a full book of clients pays a sustainable hourly rate after overheads", () => {
    for (const pkg of packages) {
      const cap = capacity(pkg.tier)
      expect(cap.clients).toBeGreaterThan(0)
      expect(cap.effectiveHourly + COSTS.hourlyCost).toBeGreaterThan(COSTS.hourlyCost)
    }
  })
})

describe("every quote the agent can send is profitable", () => {
  for (const pkg of packages) {
    for (const commitment of ["monthly", "6m", "12m", "founding"]) {
      it(`${pkg.tier}, ${commitment}, 1 to 10 stores`, () => {
        for (let stores = 1; stores <= 10; stores++) {
          expect(storeQuoteEconomics(pkg.tier, stores, commitment).profitable, `${stores} stores`).toBe(true)
        }
      })
    }
  }
})
