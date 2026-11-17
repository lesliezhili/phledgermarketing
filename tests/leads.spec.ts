import { describe, it, expect } from "vitest"
import { billLeads, estimateMonthly, normaliseContact, type Lead } from "../src/lib/leads"

const lead = (id: string, over: Partial<Lead> = {}): Lead => ({
  id, type: "enquiry", contact: `${id}@example.com`, receivedAt: "2026-12-01T09:00:00Z", ...over,
})

describe("pay-per-lead billing", () => {
  it("charges $15 per enquiry, $25 per call, $40 per business enquiry", () => {
    const bill = billLeads([
      lead("a"),
      lead("b", { type: "call", contact: "0400 000 001", callSeconds: 120 }),
      lead("c", { type: "business" }),
    ], { monthlyCap: 1000 })
    expect(bill.charges.map(c => c.amount)).toEqual([15, 25, 40])
    expect(bill.total).toBe(80)
  })

  it("does not charge spam, existing customers, short calls or upheld disputes", () => {
    const bill = billLeads([
      lead("spam", { spam: true }),
      lead("old", { existingCustomer: true }),
      lead("short", { type: "call", contact: "0400 000 002", callSeconds: 30 }),
      lead("disp", { disputeUpheld: true }),
    ])
    expect(bill.total).toBe(0)
    expect(bill.charges.map(c => c.reason)).toEqual(["spam", "existing customer", "short call", "disputed"])
  })

  it("does not charge the same person twice within 30 days, across formats and months", () => {
    const history = [lead("h", { type: "call", contact: "+61 400 000 003", callSeconds: 90, receivedAt: "2026-11-20T09:00:00Z" })]
    const bill = billLeads([
      lead("again", { contact: "0400-000-003", receivedAt: "2026-12-05T09:00:00Z" }),
      lead("later", { contact: "0400000003", receivedAt: "2027-01-10T09:00:00Z" }),
    ], { history, monthlyCap: 1000 })
    expect(bill.charges.map(c => c.reason)).toEqual(["duplicate", "charged"])
    expect(bill.total).toBe(15)
  })

  it("gives free leads first, then charges", () => {
    const leads = ["a", "b", "c", "d"].map((id, i) => lead(id, { receivedAt: `2026-12-0${i + 1}T09:00:00Z` }))
    const bill = billLeads(leads, { freeLeadsRemaining: 3 })
    expect(bill.freeLeadsUsed).toBe(3)
    expect(bill.total).toBe(15)
  })

  it("never charges more than the monthly cap", () => {
    const leads = Array.from({ length: 10 }, (_, i) => lead(`b${i}`, { type: "business", receivedAt: `2026-12-${String(i + 1).padStart(2, "0")}T09:00:00Z` }))
    const bill = billLeads(leads, { monthlyCap: 100 })
    expect(bill.total).toBe(100)
    expect(bill.capReached).toBe(true)
    expect(bill.charges.filter(c => c.reason === "monthly cap").length).toBe(8)
  })

  it("normalises contacts and caps estimates", () => {
    expect(normaliseContact(" Jo@Example.COM ")).toBe("jo@example.com")
    expect(normaliseContact("+61 400 111 222")).toBe(normaliseContact("0400 111 222"))
    expect(estimateMonthly({ enquiry: 10, call: 4 })).toBe(250)
    expect(estimateMonthly({ business: 20 }, 300)).toBe(300)
  })
})
