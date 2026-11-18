import { describe, it, expect } from "vitest"
import { buildAgreement, type AgreementInput } from "../src/lib/agreement"

const k: AgreementInput = {
  business: "Sir Charles", contactName: "K", language: "zh", channel: "wechat",
  tier: "Faithful", commitment: "after_pilot", foundingClientNumber: 1, storeCount: 1,
  pilot: true, addOns: ["seo_reputation", "order_automation"], today: "2026-11-18",
}

describe("service agreement", () => {
  it("prices K's three requirements after the pilot exactly as in his plan", () => {
    const a = buildAgreement(k)
    expect(a.monthlyTotal).toBe(492.3) // Faithful 314.10 + SEO 89.10 + orders 89.10
    expect(a.fees.map(f => f.oneOff)).toEqual([245, 149, 149])
    expect(a.firstPayment).toBe(1035.3) // 543 one-off + first month
  })

  it("says work starts only after payment, and ad spend is paid by the client", () => {
    const md = buildAgreement(k).markdown
    expect(md).toContain("Work starts only after payment is received")
    expect(md).toContain("You pay ad spend directly to the platform; we never pay it on your behalf")
    expect(md).toContain("付款后才开始工作")
  })

  it("includes the free pilot, ownership, approvals, honesty and ACL protections", () => {
    const md = buildAgreement(k).markdown
    expect(md).toContain("## 3. Free pilot (30 days)")
    expect(md).toContain("If you stop, you owe nothing and keep everything we set up")
    expect(md).toContain("You own your accounts")
    expect(md).toContain("Always your decision: prices, discounts and offers")
    expect(md).toContain("no rewards for reviews")
    expect(md).toContain("Australian Consumer Law")
    expect(md).toContain("The Chinese summary is for convenience; the English terms prevail.")
    expect(md).toContain("not legal advice")
  })

  it("standard monthly client: full setup, no pilot or case-study clause, English only", () => {
    const a = buildAgreement({ ...k, language: "en", commitment: "monthly", pilot: false, addOns: [], tier: "Grace", foundingClientNumber: undefined })
    expect(a.firstPayment).toBe(639)
    expect(a.markdown).not.toContain("Free pilot")
    expect(a.markdown).not.toContain("Case study")
    expect(a.markdown).not.toContain("中文摘要")
  })

  it("refuses founding terms after the first 3 clients", () => {
    expect(() => buildAgreement({ ...k, foundingClientNumber: 4 })).toThrow(/first 3 clients/)
  })
})
