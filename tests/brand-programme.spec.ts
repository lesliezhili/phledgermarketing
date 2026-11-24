import { describe, it, expect } from "vitest"
import { planProgramme, eventRunSheet, coFundingStatus, quarterReport, themePostIdeas, programmeEconomics, TIERS, type QuarterMetrics } from "../src/lib/brand-programme"
import { PHLEDGER_2027, PHLEDGER_PARTNERS } from "../src/lib/brand-plans"
import { decide, auditEntry } from "../src/lib/approvals"
import { services, serviceLabel } from "../src/lib/catalog"
import { BRANDS } from "../src/lib/brands"
import { formatForChannel, CHANNEL_SPECS } from "../src/lib/social-publisher"

const policy = { mode: "zhi_li" as const }
const year = planProgramme("2027-01-04", PHLEDGER_2027, "standard", policy, PHLEDGER_PARTNERS)

describe("a year of quarterly campaigns", () => {
  it("four quarters, each 13 weeks, starting on Mondays", () => {
    expect(year.map(q => q.start)).toEqual(["2027-01-04", "2027-04-05", "2027-07-05", "2027-10-04"])
    for (const q of year) expect(new Date(q.start + "T00:00:00Z").getUTCDay()).toBe(1)
  })

  it("each quarter has the tier's full mix, due inside the quarter", () => {
    const perQuarter = Object.values(TIERS.standard.mix).reduce((a, b) => a + b, 0)
    for (const q of year) {
      expect(q.assets).toHaveLength(perQuarter)
      expect(q.assets.every(a => a.due >= q.start && a.due <= q.end)).toBe(true)
    }
  })

  it("the flagship comes before the webinar, and the report closes the quarter", () => {
    for (const q of year) {
      const due = (k: string) => q.assets.find(a => a.kind === k)!.due
      expect(due("flagship") < due("webinar")).toBe(true)
      expect(q.assets[q.assets.length - 1].kind).toBe("quarter_report")
    }
  })

  it("an executive-dinner theme runs as the event even on Standard", () => {
    const q3 = year[2]
    expect(q3.assets.find(a => a.kind === "roundtable")!.title).toMatch(/AI in production: what boards should ask/)
  })

  it("case studies are blocked until a customer gives permission", () => {
    for (const q of year) expect(q.assets.find(a => a.kind === "case_study")!.blocked).toMatch(/permission/)
    const withStory = planProgramme("2027-01-04", [{ ...PHLEDGER_2027[0], customerStory: "How Acme cut reporting time (with permission)" }], "standard", policy)
    expect(withStory[0].assets.find(a => a.kind === "case_study")!.blocked).toBeUndefined()
  })

  it("partner campaigns are blocked until PHledger joins the partner program", () => {
    expect(year[0].assets.find(a => a.kind === "partner_campaign")!.blocked).toMatch(/Join the partner program/)
    const joined = PHLEDGER_PARTNERS.map(p => (p.name === "Databricks" ? { ...p, status: "member" as const } : p))
    const q1 = planProgramme("2027-01-04", [PHLEDGER_2027[0]], "standard", policy, joined)[0]
    expect(q1.assets.find(a => a.kind === "partner_campaign")!.blocked).toBeUndefined()
  })

  it("tiers scale the work", () => {
    const lean = planProgramme("2027-01-04", PHLEDGER_2027, "lean", policy)[0].assets.length
    const full = planProgramme("2027-01-04", PHLEDGER_2027, "full", policy)[0].assets.length
    expect(lean).toBeLessThan(year[0].assets.length)
    expect(full).toBeGreaterThan(year[0].assets.length)
  })
})

describe("approvals for brand work", () => {
  it("case studies, press releases and event spend need the client's sign-off in every mode", () => {
    for (const mode of ["zhi_li", "zhi_li_and_client", "auto_simple"] as const) {
      for (const type of ["case_study_publish", "press_release", "event_spend"] as const) {
        expect(decide({ type }, { mode }).route).toBe("zhi_li_then_client")
      }
    }
    const d = decide({ type: "case_study_publish" }, policy)
    expect(() => auditEntry("PHledger", { type: "case_study_publish" }, d, ["Zhi Li"], "2027-02-08T00:00:00Z")).toThrow()
  })
  it("long-form content is never published automatically", () => {
    expect(decide({ type: "content_longform" }, { mode: "auto_simple" }).route).toBe("zhi_li")
    expect(decide({ type: "content_longform" }, { mode: "zhi_li_and_client" }).route).toBe("zhi_li_then_client")
  })
})

describe("events keep working after the room empties", () => {
  it("run-sheet from budget approval to the 30-day report", () => {
    const s = eventRunSheet("2027-06-10", "roundtable", policy)
    expect(s[0]).toMatchObject({ due: "2027-04-29", route: "zhi_li_then_client" })
    expect(s.map(x => x.step).join(" ")).toMatch(/Briefing pack.*Thank-you.*Amplify.*Event report/)
    expect(s[s.length - 1].due).toBe("2027-07-10")
  })
  it("webinars don't need event spend approval", () => {
    expect(eventRunSheet("2027-02-15", "webinar", policy)[0].route).toBeUndefined()
  })
})

describe("partner co-funding", () => {
  it("flags overspending and overdue proof, and reports pipeline per dollar", () => {
    const s = coFundingStatus([
      { partner: "AWS", activity: "Webinar", requested: 5000, approved: 4000, spent: 4500, proofDue: "2027-03-01", proofSent: false, pipeline: 40000 },
      { partner: "Databricks", activity: "Roundtable", requested: 3000, approved: 3000, spent: 2500, proofDue: "2027-06-01", proofSent: true, pipeline: 30000 },
    ], "2027-04-01")
    expect(s.overspent).toEqual(["AWS: Webinar"])
    expect(s.proofOverdue).toEqual(["AWS: Webinar"])
    expect(s.pipelinePerDollar).toBe(10)
  })
})

describe("quarter report", () => {
  const base: QuarterMetrics = { followers: 500, engagementRate: 0.03, flagshipDownloads: 80, webinarRegistrations: 60, webinarAttendees: 30, eventInvites: 30, eventAttendees: 10, leads: 12, pipeline: 120000, spend: 6000 }
  it("on track", () => {
    const r = quarterReport(base, { ...base, followers: 400 })
    expect(r.lines[0]).toBe("Followers: 500 (+25%)")
    expect(r.next[0]).toMatch(/On track/)
  })
  it("recommends fixes for weak spots", () => {
    const r = quarterReport({ ...base, webinarAttendees: 12, engagementRate: 0.01, flagshipDownloads: 10, eventAttendees: 3, pipeline: 9000 })
    expect(r.next.join(" ")).toMatch(/attendance is low.*reached few people.*under 2%.*Few invitees.*under 3× spend/)
  })
})

describe("social posts back each quarter", () => {
  it("launch, webinar and article posts that fit every channel, with no invented numbers", () => {
    const phl = BRANDS["phledger-consulting"]
    for (const q of year) {
      const ideas = themePostIdeas(q, `brand-q${q.index}`)
      expect(ideas.length).toBeGreaterThanOrEqual(3)
      for (const i of ideas) {
        expect(`${i.hook} ${i.body}`).not.toMatch(/\d+%|\$\d/)
        for (const ch of phl.channels) expect(formatForChannel(i, phl, ch).text.length).toBeLessThanOrEqual(CHANNEL_SPECS[ch].maxChars)
      }
    }
  })
})

describe("economics", () => {
  it("every tier clears the minimum margin and is profitable from day one", () => {
    for (const t of Object.keys(TIERS) as (keyof typeof TIERS)[]) {
      const e = programmeEconomics(t)
      expect(e.meetsMinimum).toBe(true)
      expect(e.dayOneProfit).toBeGreaterThan(0)
    }
  })
  it("the catalogue price matches the Standard tier", () => {
    const s = services.find(x => x.id === 14)!
    expect(s.addOnMonthly).toBe(TIERS.standard.monthly)
    expect(serviceLabel(s)).toBe("Add-on · $990/mo")
  })
})
