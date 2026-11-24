import { describe, it, expect } from "vitest"
import { BRANDS, trackedLink } from "../src/lib/brands"
import { CHANNEL_SPECS, formatForChannel, planWeek, publishWeek, DryRunPublisher, postKey } from "../src/lib/social-publisher"
import { CONSULTING_LAUNCH } from "../src/lib/campaigns"

const consulting = BRANDS["phledger-consulting"]
const marketing = BRANDS["phledger-marketing"]

describe("brands link to each other", () => {
  it("each brand points to the other", () => {
    expect(consulting.crossLink.to).toBe("phledger-marketing")
    expect(marketing.crossLink.to).toBe("phledger-consulting")
    expect(consulting.site).toBe("https://phledger.com")
  })

  it("every link is tagged with channel and campaign", () => {
    const url = new URL(trackedLink(consulting, "linkedin", "fde-pilot-launch"))
    expect(url.hostname).toBe("phledger.com")
    expect(url.searchParams.get("utm_source")).toBe("linkedin")
    expect(url.searchParams.get("utm_campaign")).toBe("fde-pilot-launch")
  })
})

describe("formatting for each channel", () => {
  const idea = CONSULTING_LAUNCH[0]

  it("respects every channel's length limit for every launch post", () => {
    for (const i of CONSULTING_LAUNCH) {
      for (const ch of consulting.channels) {
        expect(formatForChannel(i, consulting, ch).text.length).toBeLessThanOrEqual(CHANNEL_SPECS[ch].maxChars)
      }
    }
  })

  it("uses 'link in bio' where links aren't clickable", () => {
    expect(formatForChannel(idea, consulting, "instagram").text).toContain("link in bio")
    expect(formatForChannel(idea, consulting, "linkedin").text).toContain("utm_source=linkedin")
  })

  it("keeps X posts short with the tracked link", () => {
    const x = formatForChannel(idea, consulting, "x").text
    expect(x.length).toBeLessThanOrEqual(280)
    expect(x).toContain("utm_source=x")
  })

  it("Chinese posts keep their Chinese call to action", () => {
    const zh = CONSULTING_LAUNCH.find(i => i.language === "zh")!
    expect(formatForChannel(zh, consulting, "wechat").text).toContain("给 PHledger 发一份简短需求")
  })

  it("launch posts make no invented claims (no percentages or dollar results)", () => {
    for (const i of CONSULTING_LAUNCH) expect(`${i.hook} ${i.body}`).not.toMatch(/\d+%|\$\d/)
  })
})

describe("weekly plan and publishing", () => {
  const week = planWeek(consulting, CONSULTING_LAUNCH, "2026-11-23")

  it("follows each channel's recommended pace", () => {
    for (const ch of consulting.channels) {
      expect(week.filter(p => p.channel === ch)).toHaveLength(CHANNEL_SPECS[ch].postsPerWeek)
    }
    expect(week.every(p => p.date >= "2026-11-23" && p.date <= "2026-11-29")).toBe(true)
  })

  it("nothing is published until approved; person-only channels go to a queue", async () => {
    const pub = new DryRunPublisher()
    const before = await publishWeek(week, new Set(), pub)
    expect(pub.outbox).toHaveLength(0)
    expect(before.some(r => r.status === "needs_approval")).toBe(true)
    expect(before.filter(r => r.channel === "wechat").every(r => r.status === "queued_for_person")).toBe(true)

    const approved = new Set(week.map(postKey))
    const after = await publishWeek(week, approved, pub)
    expect(after.filter(r => r.status === "dry_run").length).toBe(week.filter(p => p.channel !== "wechat").length)
  })
})
