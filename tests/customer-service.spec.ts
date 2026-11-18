import { describe, it, expect } from "vitest"
import { classify, handleMessage, aftersalesPlan, csMeasures, STAGE, type Knowledge } from "../src/lib/customer-service"
import { aiCustomerServiceEconomics, MIN_MARGIN } from "../src/lib/economics"
import { services, serviceLabel, AI_CUSTOMER_SERVICE } from "../src/lib/catalog"
import { auditEntry, decide } from "../src/lib/approvals"

const k: Knowledge = {
  hours: "Tue–Sun 8am–4pm",
  address: "123 Smith St, Fitzroy",
  prices: [{ item: "Basque cheesecake", price: "$68 (8 inch)" }, { item: "Latte", price: "$5.50" }],
  orderLink: "https://example.com/order",
  reviewLink: "https://g.page/r/example",
  faqs: [{ keywords: ["store", "fridge", "保存"], answer: "Keep it in the fridge and eat within 3 days." }],
}
const base = { business: "Sir Charles", channel: "sms" as const, knowledge: k, policy: { mode: "zhi_li" as const } }

describe("understanding the message", () => {
  it.each([
    ["How much is the Basque cheesecake?", "price", "presale"],
    ["Are you open on Monday?", "hours_location", "presale"],
    ["Can I book a table for 6?", "booking", "presale"],
    ["I'd like 2 lattes for pickup at 9", "order", "purchase"],
    ["Where is my order?", "order_status", "aftersales"],
    ["The cake was wrong and the box was missing the candles", "complaint", "aftersales"],
    ["I want a refund", "refund_return", "aftersales"],
    ["Thanks, loved it!", "thanks", "aftersales"],
    ["Can I order the same as last time again?", "reorder", "aftersales"],
    ["我吃了以后过敏了", "critical", "aftersales"],
    ["STOP", "opt_out", "aftersales"],
    ["蛋糕多少钱？", "price", "presale"],
  ])("%s → %s", (text, intent, stage) => {
    expect(classify(text)).toBe(intent)
    expect(STAGE[classify(text)]).toBe(stage)
  })

  it("does not read 'chocolate' as a late-delivery complaint", () => {
    expect(classify("Do you have chocolate cake?")).not.toBe("complaint")
  })
})

describe("presale: answers only from approved facts", () => {
  it("quotes the published price and the order link, with the AI disclosure", () => {
    const r = handleMessage({ ...base, text: "How much is the Basque cheesecake?" })
    expect(r.reply).toContain("$68 (8 inch)")
    expect(r.reply).toContain("https://example.com/order")
    expect(r.reply).toContain("automated assistant")
    expect(r.reply).toContain("Reply STOP")
    expect(r.answeredByAi).toBe(true)
    expect(r.replyDecision.route).toBe("auto")
  })

  it("never invents a price it doesn't have", () => {
    const r = handleMessage({ ...base, text: "What's the price?", knowledge: {} })
    expect(r.reply).not.toMatch(/\$\d/)
    expect(r.handover?.to).toBe("owner")
  })

  it("replies in Chinese to a Chinese message", () => {
    const r = handleMessage({ ...base, channel: "wechat", text: "你们几点营业？" })
    expect(r.language).toBe("zh")
    expect(r.reply).toContain("营业时间")
    expect(r.reply).toContain("退订")
  })

  it("only discloses on first contact", () => {
    const r = handleMessage({ ...base, text: "Are you open Sunday?", firstContact: false })
    expect(r.reply).not.toContain("automated assistant")
  })

  it("new enquiries for service businesses ask the trade's questions", () => {
    const r = handleMessage({ ...base, business: "Kew Mowing", trade: "mowing", text: "Hi, can you do my lawn?", knowledge: {} })
    expect(r.intent).toBe("enquiry")
    expect(r.reply).toMatch(/1\./)
    expect(r.reply.match(/automated assistant/g)).toHaveLength(1)
  })
})

describe("aftersales: keep the customer, a person decides money and blame", () => {
  it("complaints get an instant apology and a person's reply, approved by Zhi Li", () => {
    const r = handleMessage({ ...base, text: "Very disappointed, the order was wrong" })
    expect(r.reply).toMatch(/sorry/i)
    expect(r.answeredByAi).toBe(false)
    expect(r.handover?.action).toBe("cs_complaint_reply")
    expect(r.handover?.decision.route).toBe("zhi_li")
    const auto = handleMessage({ ...base, policy: { mode: "auto_simple" }, text: "Very disappointed, the order was wrong" })
    expect(auto.handover?.decision.route).toBe("zhi_li")
  })

  it("refunds never promise money and never limit consumer law rights", () => {
    const r = handleMessage({ ...base, text: "I want my money back" })
    expect(r.reply).toContain("Australian Consumer Law are not affected")
    expect(r.reply).not.toMatch(/we will refund|no refunds/i)
    expect(r.handover?.decision.route).toBe("zhi_li_then_client")
    expect(() => auditEntry("Sir Charles", { type: "cs_refund" }, r.handover!.decision, ["Zhi Li"], "2026-11-18T10:00:00Z")).toThrow()
  })

  it("safety and legal go to the owner within an hour", () => {
    const r = handleMessage({ ...base, text: "My son had an allergic reaction after your cake" })
    expect(r.intent).toBe("critical")
    expect(r.handover?.decision.route).toBe("escalate_owner")
    expect(r.handover?.withinHours).toBe(1)
    expect(r.reply).toContain("000")
  })

  it("answers how-to questions from the FAQs", () => {
    const r = handleMessage({ ...base, text: "How should I store it? fridge?" })
    expect(r.reply).toContain("Keep it in the fridge")
    expect(r.answeredByAi).toBe(true)
  })

  it("thanks the customer and invites a review", () => {
    const r = handleMessage({ ...base, text: "Thank you, it was delicious!" })
    expect(r.reply).toContain("https://g.page/r/example")
  })

  it("STOP unsubscribes", () => {
    const r = handleMessage({ ...base, text: "stop" })
    expect(r.optOut).toBe(true)
    expect(r.reply).toMatch(/unsubscribed/)
  })
})

describe("channels: website and phone/mobile", () => {
  it("phone: discloses first, never reads a link aloud, texts it after the call", () => {
    const r = handleMessage({ ...base, channel: "phone", text: "How much is the Basque cheesecake?" })
    expect(r.reply.split("\n")[0]).toMatch(/speaking with Sir Charles's automated assistant/)
    expect(r.reply).toMatch(/may be recorded/)
    expect(r.reply).not.toContain("https://")
    expect(r.reply).toContain("I'll text you the link")
    expect(r.reply).not.toContain("Reply STOP")
    expect(r.smsFollowUp).toBe("Sir Charles: https://example.com/order")
  })

  it("phone in Chinese asks the caller to tell, not reply", () => {
    const r = handleMessage({ ...base, channel: "phone", text: "我想下单" })
    expect(r.reply).toContain("自动助理")
    expect(r.reply).toContain("告诉我想要的商品")
    expect(r.reply).not.toContain("回复")
    expect(r.reply).not.toContain("https://")
    expect(r.smsFollowUp).toBe("Sir Charles: https://example.com/order")
  })

  it("website AI agent and email keep clickable links and no SMS opt-out", () => {
    for (const channel of ["webchat", "email"] as const) {
      const r = handleMessage({ ...base, channel, text: "How much is the latte?" })
      expect(r.reply).toContain("https://example.com/order")
      expect(r.reply).not.toContain("Reply STOP")
      expect(r.smsFollowUp).toBeUndefined()
    }
  })
})

describe("after-purchase journey", () => {
  it("everyone gets service messages and a review request; marketing only with consent", () => {
    const no = aftersalesPlan({ purchaseDate: "2026-11-18", kind: "food", repeatEveryDays: 30, marketingConsent: false, hasReviewLink: true })
    expect(no.map(t => t.type)).toEqual(["thank_you", "check_in", "review_request"])
    expect(no.some(t => t.marketing)).toBe(false)

    const yes = aftersalesPlan({ purchaseDate: "2026-11-18", kind: "food", repeatEveryDays: 30, marketingConsent: true, hasReviewLink: true })
    expect(yes.find(t => t.type === "reorder_reminder")?.date).toBe("2026-12-15")
    expect(yes.find(t => t.type === "win_back")?.date).toBe("2027-01-17")
    expect(yes.filter(t => t.marketing).every(t => decide({ type: t.action }, { mode: "zhi_li" }).route !== "auto")).toBe(true)
  })

  it("products get a care tip", () => {
    const p = aftersalesPlan({ purchaseDate: "2026-11-18", kind: "product", marketingConsent: false, hasReviewLink: false })
    expect(p.map(t => t.type)).toContain("care_tip")
  })
})

describe("measures and economics", () => {
  it("reports reply speed, AI resolution and on-time hand-overs", () => {
    const m = csMeasures([
      { intent: "price", firstReplySeconds: 5, answeredByAi: true },
      { intent: "complaint", firstReplySeconds: 8, answeredByAi: false, handoverHours: 3, handoverWithinHours: 4 },
      { intent: "refund_return", firstReplySeconds: 90, answeredByAi: false, handoverHours: 30, handoverWithinHours: 24 },
      { intent: "thanks", firstReplySeconds: 4, answeredByAi: true },
    ])
    expect(m).toMatchObject({ conversations: 4, presale: 1, aftersales: 3, within60s: 0.75, answeredByAi: 0.5, handoversOnTime: 0.5, complaints: 1 })
  })

  it("is profitable from day one at any volume and store count", () => {
    for (const conv of [0, 50, 200, 500, 2000]) {
      for (const stores of [1, 3, 5]) {
        const e = aiCustomerServiceEconomics(conv, stores)
        expect(e.dayOneProfit).toBeGreaterThan(0)
        expect(e.monthlyMargin).toBeGreaterThanOrEqual(MIN_MARGIN)
      }
    }
  })

  it("is listed as an add-on on the services page", () => {
    const s = services.find(x => x.id === 12)!
    expect(serviceLabel(s)).toBe(`Add-on · $${AI_CUSTOMER_SERVICE.monthly}/mo`)
  })
})
