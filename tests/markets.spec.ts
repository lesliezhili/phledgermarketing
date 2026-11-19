import { describe, it, expect } from "vitest"
import { MARKETS, localToUtc, localise } from "../src/lib/markets"
import { BRANDS, trackedLink } from "../src/lib/brands"
import { AU_CA_LAUNCH } from "../src/lib/campaigns"
import { planMarkets, CHANNEL_SPECS, postKey, publishWeek, DryRunPublisher } from "../src/lib/social-publisher"
import { chat } from "../src/lib/chat-agent"
import { CHAT_CLIENTS } from "../src/lib/chat-clients"

const phl = BRANDS["phledger-consulting"]

describe("markets", () => {
  it("PHledger is marketed in Australia and Canada together", () => {
    expect(phl.markets).toEqual(["au", "ca"])
    expect(MARKETS.au.currency).toBe("AUD")
    expect(MARKETS.ca.currency).toBe("CAD")
  })
  it("Canada has no Google Business Profile posts (no Canadian address yet)", () => {
    expect(MARKETS.ca.channels).not.toContain("google")
  })
  it("Canada's anti-spam rules are CASL with 10 business days to unsubscribe", () => {
    expect(MARKETS.ca.law.antiSpam).toMatch(/CASL/)
    expect(MARKETS.ca.law.unsubscribeBusinessDays).toBe(10)
    expect(MARKETS.au.law.unsubscribeBusinessDays).toBe(5)
  })
})

describe("local times, daylight saving included", () => {
  it("summer: Melbourne is UTC+11, Toronto UTC-5", () => {
    expect(localToUtc("2026-12-01", "08:30", "Australia/Melbourne")).toBe("2026-11-30T21:30:00.000Z")
    expect(localToUtc("2026-12-01", "08:30", "America/Toronto")).toBe("2026-12-01T13:30:00.000Z")
  })
  it("winter: Melbourne is UTC+10, Toronto UTC-4", () => {
    expect(localToUtc("2026-07-01", "08:30", "Australia/Melbourne")).toBe("2026-06-30T22:30:00.000Z")
    expect(localToUtc("2026-07-01", "08:30", "America/Toronto")).toBe("2026-07-01T12:30:00.000Z")
  })
})

describe("Canadian spelling", () => {
  it("uses -ize but keeps colour and centre", () => {
    expect(localise("Your organisation can modernise and optimise.", "ca")).toBe("Your organization can modernize and optimize.")
    expect(localise("the colour of the centre", "ca")).toBe("the colour of the centre")
    expect(localise("data analyses", "ca")).toBe("data analyses")
    expect(localise("Your organisation", "au")).toBe("Your organisation")
  })
})

describe("one plan, two markets", () => {
  const week = planMarkets(phl, AU_CA_LAUNCH, "2026-11-23")

  it("each market posts on its own channels at the recommended pace", () => {
    for (const m of ["au", "ca"] as const) {
      const channels = phl.channels.filter(c => MARKETS[m].channels.includes(c))
      for (const c of channels) expect(week.filter(p => p.market === m && p.channel === c)).toHaveLength(CHANNEL_SPECS[c].postsPerWeek)
    }
    expect(week.some(p => p.market === "ca" && p.channel === "google")).toBe(false)
  })

  it("market-only posts stay in their market", () => {
    expect(week.filter(p => p.ideaId === "ca-data-home").every(p => p.market === "ca")).toBe(true)
    expect(week.filter(p => p.ideaId === "au-data-home").every(p => p.market === "au")).toBe(true)
  })

  it("Canadian posts are spelled and tracked for Canada and land on the Canadian page", () => {
    const ca = week.filter(p => p.market === "ca" && p.channel === "linkedin")
    expect(ca.every(p => p.link?.startsWith("https://phledger.com/canada") || p.link?.includes("/cloud") || p.link?.includes("phledgerfinance"))).toBe(true)
    expect(ca.every(p => p.link?.includes("utm_campaign=fde-au-ca-ca"))).toBe(true)
    const shared = week.find(p => p.market === "ca" && p.ideaId === "au-ca-embedded" && p.channel === "linkedin")!
    expect(shared.text).toContain("organization")
    const au = week.find(p => p.market === "au" && p.ideaId === "au-ca-embedded" && p.channel === "linkedin")!
    expect(au.text).toContain("organisation")
    expect(au.link).toContain("utm_campaign=fde-au-ca-au")
  })

  it("posts go out at local business hours", () => {
    const ca = week.find(p => p.market === "ca" && p.channel === "linkedin")!
    expect(ca.localTime).toBe("08:30 America/Toronto")
    expect(ca.postAt).toBe(localToUtc(ca.date, "08:30", "America/Toronto"))
  })

  it("the same idea on the same day in two markets needs two approvals", async () => {
    const keys = new Set(week.map(postKey))
    expect(keys.size).toBe(week.length)
    const pub = new DryRunPublisher()
    const onlyAu = new Set(week.filter(p => p.market === "au").map(postKey))
    const r = await publishWeek(week, onlyAu, pub)
    expect(pub.outbox.every(p => p.market === "au")).toBe(true)
    expect(r.filter(x => x.status === "needs_approval").length).toBeGreaterThan(0)
  })

  it("no invented numbers or results in the campaign", () => {
    for (const i of AU_CA_LAUNCH) expect(`${i.hook} ${i.body}`).not.toMatch(/\d+%|\$\d/)
  })

  it("tracked links accept a market", () => {
    expect(trackedLink(phl, "linkedin", "x", undefined, "ca")).toBe("https://phledger.com/canada?utm_source=linkedin&utm_medium=social&utm_campaign=x-ca")
    expect(trackedLink(phl, "linkedin", "x")).toContain("#contact")
  })
})

describe("the chat agent knows about Canada", () => {
  it("answers in English and Chinese", async () => {
    const en = await chat(CHAT_CLIENTS.phledger, [{ role: "user", content: "Do you work with companies in Canada?" }], undefined, null)
    expect(en.reply).toMatch(/Canada as well as Australia/)
    expect(en.reply).toContain("https://phledger.com/canada")
    const zh = await chat(CHAT_CLIENTS.phledger, [{ role: "user", content: "你们服务加拿大的公司吗？" }], undefined, null)
    expect(zh.reply).toContain("加拿大")
  })
})
