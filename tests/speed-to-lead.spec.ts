import { describe, it, expect } from "vitest"
import { firstReply, isChargeableSource, metReplyTarget, replySeconds, QUALIFYING_QUESTIONS } from "../src/lib/speed-to-lead"

describe("speed-to-lead first reply", () => {
  it("asks the trade's qualifying questions and names the business", () => {
    const text = firstReply({ business: "Fitzroy Mowing", trade: "mowing", channel: "sms" })
    expect(text).toContain("Fitzroy Mowing")
    for (const q of QUALIFYING_QUESTIONS.mowing) expect(text).toContain(q)
    expect(text).toContain("A photo helps us quote faster.")
  })

  it("says it is automated and offers SMS opt-out (Spam Act)", () => {
    const sms = firstReply({ business: "Sparkle Clean", trade: "cleaning", channel: "sms" })
    expect(sms).toMatch(/automated assistant/)
    expect(sms).toMatch(/Reply STOP to opt out/)
    const email = firstReply({ business: "Sparkle Clean", trade: "cleaning", channel: "email" })
    expect(email).not.toMatch(/Reply STOP/)
    expect(email).toMatch(/automated assistant/)
  })

  it("apologises for a missed call and adds a booking link", () => {
    const text = firstReply({ business: "Tall Trees", trade: "tree", channel: "sms", missedCall: true, bookingLink: "https://example.com/book" })
    expect(text.startsWith("Hi, sorry we missed your call to Tall Trees")).toBe(true)
    expect(text).toContain("https://example.com/book")
    expect(text).toContain("urgent")
  })

  it("measures reply speed against the 60-second target", () => {
    expect(replySeconds("2026-12-01T09:00:00Z", "2026-12-01T09:00:45Z")).toBe(45)
    expect(metReplyTarget("2026-12-01T09:00:00Z", "2026-12-01T09:00:45Z")).toBe(true)
    expect(metReplyTarget("2026-12-01T09:00:00Z", "2026-12-01T09:05:00Z")).toBe(false)
  })

  it("only treats sources PhLedger tracks as chargeable", () => {
    expect(isChargeableSource("tracked_number")).toBe(true)
    expect(isChargeableSource("meta_lead_form")).toBe(true)
    expect(isChargeableSource("hipages")).toBe(false)
    expect(isChargeableSource("franchise_hq")).toBe(false)
    expect(isChargeableSource(undefined)).toBe(false)
  })
})
