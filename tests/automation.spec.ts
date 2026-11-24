import { describe, it, expect } from "vitest"
import { triageReview } from "../src/lib/review-response"
import { planToday, dailySummary, type AdDay } from "../src/lib/daily-ads"
import { localBusinessJsonLd, metaTags, keywordIdeas, napMismatches, type StoreSeo } from "../src/lib/local-seo"
import { checkOrder, orderConfirmation, kitchenTicket, followUps, CHANNEL_RULES, type ProductOption } from "../src/lib/orders"

const biz = { business: "Sir Charles", contact: "hello@example.com", products: ["Vanilla Basque Burnt Cheesecake", "Ube Mascarpone Cream Cake"] }

describe("review replies and bad feedback", () => {
  it("auto-publishes a plain 5-star thank-you that mentions what they liked", () => {
    const t = triageReview({ ...biz, rating: 5, reviewerName: "Amy Lee", text: "The Ube Mascarpone Cream Cake was amazing!" })
    expect(t.severity).toBe("positive")
    expect(t.autoPublish).toBe(true)
    expect(t.draftReply).toContain("Hi Amy")
    expect(t.draftReply).toContain("Ube Mascarpone Cream Cake")
  })

  it("does not mistake 'Basque Burnt Cheesecake' for a burnt-food complaint", () => {
    const t = triageReview({ ...biz, rating: 5, text: "Best vanilla basque burnt cheesecake in Fitzroy" })
    expect(t.topics).toEqual([])
    expect(t.autoPublish).toBe(true)
  })

  it("drafts a specific apology for a bad review and takes it offline", () => {
    const t = triageReview({ ...biz, rating: 1, reviewerName: "Tom", text: "Waited 40 minutes and the staff were rude" })
    expect(t.severity).toBe("negative")
    expect(t.autoPublish).toBe(false)
    expect(t.replyWithinHours).toBe(24)
    expect(t.topics).toEqual(expect.arrayContaining(["staff", "wait"]))
    expect(t.draftReply).toContain("hello@example.com")
    expect(t.draftReply).not.toMatch(/discount|free|voucher|refund/i) // never buy a review change
  })

  it("escalates food-safety and allergy reviews within the hour, whatever the stars", () => {
    for (const text of ["Got food poisoning after brunch", "I told them about my nut allergy", "吃完拉肚子了"]) {
      const t = triageReview({ ...biz, rating: 4, text })
      expect(t.severity).toBe("critical")
      expect(t.escalate).toBe(true)
      expect(t.autoPublish).toBe(false)
      expect(t.replyWithinHours).toBe(1)
    }
  })

  it("holds back a 4-star review that still complains", () => {
    const t = triageReview({ ...biz, rating: 4, text: "Lovely cakes but very expensive" })
    expect(t.autoPublish).toBe(false)
    expect(t.topics).toContain("price")
  })

  it("replies in Chinese and flags possible policy violations", () => {
    const t = triageReview({ ...biz, rating: 2, text: "服务态度很差", language: "zh" })
    expect(t.draftReply).toContain("这次服务让您不满意")
    expect(triageReview({ ...biz, rating: 1, text: "visit www.spam.example" }).possiblePolicyViolation).toBe(true)
  })
})

describe("daily Google Maps ads (投流)", () => {
  const plan = { monthlyBudget: 900, month: "2026-12", targetCostPerAction: 10 }
  const day = (d: number, spend: number, calls: number, directions: number): AdDay =>
    ({ date: `2026-12-${String(d).padStart(2, "0")}`, spend, clicks: 20, calls, directions })

  it("paces the remaining budget evenly and never doubles past the even rate", () => {
    const p = planToday(plan, [day(1, 30, 2, 2), day(2, 30, 1, 3)], "2026-12-03")
    expect(p.todayBudget).toBeCloseTo(840 / 29, 2)
    expect(p.costPerAction).toBe(7.5)
    expect(p.alerts).toEqual([])
    const behind = planToday(plan, [], "2026-12-30") // nothing spent: still capped at 2x even
    expect(behind.todayBudget).toBeCloseTo((900 / 31) * 2, 1)
  })

  it("alerts on high cost, no results and a used-up budget", () => {
    expect(planToday(plan, [day(1, 40, 1, 0), day(2, 40, 1, 0), day(3, 40, 0, 1)], "2026-12-04").alerts).toContain("cost_too_high")
    expect(planToday(plan, [day(1, 30, 0, 0), day(2, 30, 0, 0), day(3, 30, 0, 0)], "2026-12-04").alerts).toContain("no_results")
    const spent = planToday(plan, [day(1, 900, 50, 50)], "2026-12-02")
    expect(spent.alerts).toContain("budget_used")
    expect(spent.todayBudget).toBe(0)
  })

  it("writes the daily owner summary in Chinese", () => {
    const history = [day(1, 30, 2, 2)]
    const text = dailySummary(plan, history[0], planToday(plan, history, "2026-12-02"), "zh")
    expect(text).toContain("昨天：花费 $30，来电 2，导航 2")
    expect(text).toContain("✅ 一切正常")
  })
})

describe("website local SEO", () => {
  const store: StoreSeo = {
    business: "Sir Charles", type: "CafeOrCoffeeShop", street: "121 Johnston Street", suburb: "Fitzroy",
    state: "VIC", postcode: "3065", phone: "0434 910 121", cuisine: ["Asian fusion brunch"],
    hours: [{ days: ["Mo", "Tu"], opens: "08:00", closes: "15:00" }], products: ["Ube Mascarpone Cream Cake"],
    sameAs: ["https://www.instagram.com/example"],
  }

  it("builds schema.org LocalBusiness markup", () => {
    const j = localBusinessJsonLd(store) as Record<string, any>
    expect(j["@type"]).toBe("CafeOrCoffeeShop")
    expect(j.address.addressLocality).toBe("Fitzroy")
    expect(j.openingHoursSpecification[0].dayOfWeek).toEqual(["Monday", "Tuesday"])
    expect(j.hasMenu.hasMenuSection.hasMenuItem[0].name).toBe("Ube Mascarpone Cream Cake")
  })

  it("keeps titles and descriptions within search-result limits", () => {
    const m = metaTags(store, "Asian fusion brunch and whole cakes")
    expect(m.title.length).toBeLessThanOrEqual(60)
    expect(m.description.length).toBeLessThanOrEqual(155)
    expect(m.title).toContain("Fitzroy")
  })

  it("suggests local keywords and catches name/address/phone mismatches with Google", () => {
    expect(keywordIdeas(store, ["brunch"])).toContain("brunch fitzroy")
    expect(napMismatches(store, { ...store, street: "121 Johnston St", phone: "+61 434 910 121" })).toEqual([])
    expect(napMismatches(store, { ...store, phone: "03 9000 0000" })).toEqual(["phone"])
  })
})

describe("order automation across channels", () => {
  const menu: ProductOption[] = [
    { name: "Ube Mascarpone Cream Cake", sizes: [{ label: "6 inch", price: 65 }, { label: "8 inch", price: 85 }], leadDays: 2 },
  ]
  const req = {
    channel: "instagram" as const, customerName: "Mia", contact: "@mia", product: "ube mascapone cream cake",
    size: "8 inch", pickupDate: "2026-12-05", pickupTime: "11:00", writing: "Happy Birthday Mia",
  }

  it("matches the product even when misspelt and confirms the order", () => {
    const o = checkOrder(req, menu, "2026-12-01")
    expect(o.ok).toBe(true)
    expect(o.price).toBe(85)
    expect(orderConfirmation(o, "Sir Charles", "en")).toContain("Ube Mascarpone Cream Cake (8 inch) $85")
    expect(kitchenTicket(o)).toContain("via Instagram")
  })

  it("rejects too-short notice, unknown sizes and past dates", () => {
    expect(checkOrder({ ...req, pickupDate: "2026-12-02" }, menu, "2026-12-01").errors[0]).toMatch(/2 days' notice/)
    expect(checkOrder({ ...req, size: "10 inch" }, menu, "2026-12-01").ok).toBe(false)
    expect(checkOrder({ ...req, pickupDate: "2026-11-01" }, menu, "2026-12-01").errors).toContain("Pickup date is in the past")
  })

  it("sends allergy orders to a person instead of auto-confirming", () => {
    const o = checkOrder({ ...req, notes: "nut allergy" }, menu, "2026-12-01")
    expect(o.ok).toBe(false)
    expect(o.errors).toEqual([])
    expect(o.needsPerson.length).toBe(1)
  })

  it("only schedules offers for customers who agreed", () => {
    const o = checkOrder(req, menu, "2026-12-01")
    expect(followUps(o, "2026-12-01").map(f => f.what)).toEqual(["confirmation", "reminder", "thank_you_review"])
    const c = checkOrder({ ...req, marketingConsent: true }, menu, "2026-12-01")
    expect(followUps(c, "2026-12-01").map(f => f.what)).toContain("reorder_offer")
  })

  it("never auto-replies on RedNote (no public messaging API)", () => {
    expect(CHANNEL_RULES.rednote.autoReply).toBe(false)
    expect(CHANNEL_RULES.instagram.autoReply).toBe(true)
  })

  it("confirms in Chinese for WeChat and RedNote customers", () => {
    const o = checkOrder({ ...req, channel: "rednote" }, menu, "2026-12-01")
    expect(orderConfirmation(o, "Sir Charles", "zh")).toContain("取货：2026-12-05 11:00")
  })
})
