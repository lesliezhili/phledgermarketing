import { describe, it, expect } from "vitest"
import { buildScorecard, scorecardMarkdown, type ScorecardInput } from "../src/lib/scorecard"
import { buildCaseStudy, type CaseStudyInput } from "../src/lib/case-study"
import type { AuditEntry } from "../src/lib/approvals"

const entry = (route: AuditEntry["route"]): AuditEntry => ({ at: "2026-12-01T09:00:00Z", client: "Sir Charles", action: "enquiry_reply", route, approvedBy: ["auto"] })

const month: ScorecardInput = {
  month: "2026-12",
  pipeline: { healthChecks: 6, quotesSent: 3, pilotsStarted: 1, pilotsConverted: 1, newPaying: 1, churned: 0, referrals: 2 },
  clients: [{ name: "Sir Charles", plan: "Faithful + 2 add-ons", cashIn: 1035.3, hoursUsed: 7, hoursBudget: 9, satisfaction: 9 }],
  cashOut: { tools: 15, trackedNumbers: 15, sms: 20, other: 0 },
  audit: [...Array(40)].map(() => entry("auto")).concat([...Array(10)].map(() => entry("zhi_li"))),
  correctedActions: 0,
  quoteReplyHours: [2, 5, 20],
}

describe("PhLedger scorecard", () => {
  it("checks cash break-even including overhead", () => {
    const c = buildScorecard(month)
    expect(c.cash.out).toBe(150) // 50 cash costs + 100 overhead
    expect(c.cash.breakEven).toBe(true)
    expect(c.hours.effectiveHourly).toBeCloseTo((1035.3 - 150) / 7, 2)
  })

  it("measures closing, delivery and automation like the SOP", () => {
    const c = buildScorecard(month)
    expect(c.closing.quoteRate).toBe(0.5)
    expect(c.closing.pilotConversion).toBe(1)
    expect(c.closing.medianQuoteHours).toBe(5)
    expect(c.delivery.promoterShare).toBe(1)
    expect(c.automation.autoShare).toBe(0.8)
    expect(c.automation.hoursSaved).toBeCloseTo((40 * 5) / 60, 2)
    expect(c.flags).toEqual([])
    expect(scorecardMarkdown("2026-12", c)).toContain("✅ break-even")
  })

  it("flags a pilot-only month as below break-even and stops new unpaid work", () => {
    const c = buildScorecard({ ...month, clients: [{ name: "K", plan: "Pilot", cashIn: 0, hoursUsed: 6, hoursBudget: 6 }] })
    expect(c.cash.breakEven).toBe(false)
    expect(c.flags[0]).toMatch(/no new unpaid work/)
  })

  it("flags clients over their hour budget and a high error rate", () => {
    const c = buildScorecard({ ...month, clients: [{ ...month.clients[0], hoursUsed: 12 }], correctedActions: 3 })
    expect(c.flags.join(" ")).toMatch(/Over hour budget: Sir Charles/)
    expect(c.flags.join(" ")).toMatch(/needed fixing/)
  })
})

const kCase: CaseStudyInput = {
  business: "Sir Charles",
  anonymise: false,
  industry: { en: "Asian-fusion brunch café and cake shop, Fitzroy", zh: "菲茨罗伊亚洲融合早午餐咖啡馆和蛋糕店" },
  challenge: { en: "Influencers brought attention, but nobody owned what people saw on Google Maps.", zh: "网红带来了关注，但没人负责客人在谷歌地图上看到的内容。" },
  whatWeDid: [{ en: "Fixed the Google profile and listed 10 cakes", zh: "整理谷歌档案，上架 10 款蛋糕" }],
  periodDays: 30,
  periodEnd: "2027-01-05",
  metrics: [
    { name: { en: "Calls from Google Maps", zh: "谷歌地图来电" }, before: 20, after: 32, source: "Google Business Profile insights" },
    { name: { en: "Direction requests", zh: "导航次数" }, before: 150, after: 180, source: "Google Business Profile insights" },
    { name: { en: "Whole-cake enquiries", zh: "整蛋糕询价" }, before: 8, after: 6, source: "Tracked order page" },
  ],
  clientApproved: false,
}

describe("case study", () => {
  it("leads with the biggest real improvement and keeps falls visible", () => {
    const r = buildCaseStudy(kCase, "en")
    expect(r.headline).toBe("Sir Charles: Calls from Google Maps up 60% in 30 days")
    expect(r.markdown).toContain("| Whole-cake enquiries | 8 | 6 | -25% |")
    expect(r.markdown).toContain("Sources: Google Business Profile insights; Tracked order page.")
    expect(r.markdown).toContain("not a guarantee")
  })

  it("is not publishable until the client approves, and can be anonymised", () => {
    expect(buildCaseStudy(kCase, "en").publishable).toBe(false)
    const anon = buildCaseStudy({ ...kCase, anonymise: true, anonymousName: { en: "A Fitzroy café", zh: "菲茨罗伊一家咖啡馆" }, clientApproved: true }, "zh")
    expect(anon.headline).toBe("菲茨罗伊一家咖啡馆：30 天内谷歌地图来电增长 60%")
    expect(anon.markdown).not.toContain("Sir Charles")
    expect(anon.publishable).toBe(true)
  })
})
