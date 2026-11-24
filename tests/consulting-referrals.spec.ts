import { describe, it, expect } from "vitest"
import { assessFdeFit, referralLink } from "../src/lib/consulting-referrals"
import { BRANDS, trackedLink } from "../src/lib/brands"

describe("PHledger brand matches phledger.com", () => {
  const c = BRANDS["phledger-consulting"]
  it("uses phledger.com's offer ladder and prices", () => {
    expect(c.ladder?.map(s => s.name)).toEqual(["Brief and first conversation", "Decision sprint", "Embedded FDE", "Fixed-scope build"])
    expect(c.pilotOffer.price).toContain("18,000")
  })
  it("social links land on the brief form, tagged", () => {
    const u = trackedLink(c, "linkedin", "x")
    expect(u).toMatch(/^https:\/\/phledger\.com\/\?utm_source=linkedin.*#contact$/)
  })
})

describe("spotting FDE work in marketing clients", () => {
  it("referral links are attributed to PhLedger Marketing", () => {
    const u = new URL(referralLink("test"))
    expect(u.hostname).toBe("phledger.com")
    expect(u.searchParams.get("utm_source")).toBe("phledger-marketing")
    expect(u.searchParams.get("utm_medium")).toBe("referral")
    expect(u.hash).toBe("#contact")
  })

  it("a café with no data problem is not referred", () => {
    const r = assessFdeFit({ business: "Corner Café", signals: { ai_idea: true } })
    expect(r.step).toBe("not_yet")
    expect(r.link).toBeNull()
    expect(r.brief).toBeNull()
  })

  it("a multi-store owner copying numbers by hand gets a free brief, not an 18k sprint", () => {
    const r = assessFdeFit({ business: "Sir Charles", stores: 3, signals: { manual_reporting: true, multi_site_compare: true }, language: "zh" })
    expect(r.step).toBe("brief")
    expect(r.brief).toContain("报表靠手工")
    expect(r.brief).toContain("未同意前不得发送")
  })

  it("a mid-sized provider facing a platform decision is offered a decision sprint", () => {
    const r = assessFdeFit({ business: "Care Co", industry: "Aged care", staff: 120, signals: { platform_decision: true, compliance_data: true } })
    expect(r.step).toBe("decision_sprint")
    expect(r.link).toContain("/cloud")
    expect(r.brief).toContain("Suggested first step: Decision sprint")
  })

  it("a large organisation with a team to train and many needs gets embedded FDE", () => {
    const r = assessFdeFit({ business: "Big Org", staff: 200, signals: { manual_reporting: true, many_systems: true, ai_idea: true, in_house_team: true } })
    expect(r.step).toBe("embedded_fde")
  })

  it("never sends without the client's agreement", () => {
    const r = assessFdeFit({ business: "Care Co", staff: 80, signals: { platform_decision: true } })
    expect(r.brief).toMatch(/do not send until yes/)
  })
})
