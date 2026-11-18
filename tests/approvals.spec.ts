import { describe, it, expect } from "vitest"
import { decide, auditEntry, type ApprovalPolicy, type ActionType } from "../src/lib/approvals"
import { funnel } from "../src/lib/funnel"

const zhiLi: ApprovalPolicy = { mode: "zhi_li" }
const withClient: ApprovalPolicy = { mode: "zhi_li_and_client" }
const auto: ApprovalPolicy = { mode: "auto_simple", maxDailyAdBudget: 30 }

describe("approval modes", () => {
  it("routine, time-critical work runs automatically in every mode", () => {
    for (const p of [zhiLi, withClient, auto]) {
      for (const type of ["enquiry_reply", "order_confirmation", "ad_pause"] as ActionType[]) {
        expect(decide({ type }, p).route).toBe("auto")
      }
      expect(decide({ type: "ad_budget_today", amount: 20, planDailyMax: 58 }, p).route).toBe("auto")
    }
  })

  it("full automation handles simple ads, thank-you replies and Google posts", () => {
    expect(decide({ type: "review_reply_positive" }, auto).route).toBe("auto")
    expect(decide({ type: "post_google" }, auto).route).toBe("auto")
    expect(decide({ type: "ad_budget_today", amount: 25, planDailyMax: 58 }, auto).route).toBe("auto")
    // but not above the client's automatic limit, and not new ads or social posts
    expect(decide({ type: "ad_budget_today", amount: 45, planDailyMax: 58 }, auto).route).toBe("zhi_li")
    expect(decide({ type: "ad_new_creative" }, auto).route).toBe("zhi_li")
    expect(decide({ type: "post_social" }, auto).route).toBe("zhi_li")
  })

  it("Zhi Li approves content by default; the client too in the client mode", () => {
    expect(decide({ type: "review_reply_negative" }, zhiLi).route).toBe("zhi_li")
    expect(decide({ type: "post_social" }, zhiLi).route).toBe("zhi_li")
    expect(decide({ type: "review_reply_negative" }, withClient).route).toBe("zhi_li_then_client")
    expect(decide({ type: "loyalty_message" }, withClient).route).toBe("zhi_li_then_client")
  })

  it("a client can ask to approve specific actions in any mode", () => {
    expect(decide({ type: "post_google" }, { mode: "auto_simple", clientApproves: ["post_google"] }).route).toBe("zhi_li_then_client")
  })
})

describe("hard rules no mode can switch off", () => {
  for (const p of [zhiLi, withClient, auto]) {
    it(`in ${p.mode} mode`, () => {
      expect(decide({ type: "review_reply_critical" }, p).route).toBe("escalate_owner")
      expect(decide({ type: "order_allergy" }, p).route).toBe("escalate_owner")
      expect(decide({ type: "price_change" }, p).route).toBe("zhi_li_then_client")
      expect(decide({ type: "offer_discount" }, p).route).toBe("zhi_li_then_client")
      expect(decide({ type: "ad_budget_increase" }, p).route).toBe("zhi_li_then_client")
      expect(decide({ type: "ad_budget_today", amount: 80, planDailyMax: 58 }, p).route).toBe("zhi_li_then_client")
      expect(decide({ type: "post_rednote" }, p).route).toBe("person_sends")
    })
  }

  it("cannot log an action as done without the approvals it needs", () => {
    const d = decide({ type: "offer_discount" }, auto)
    expect(() => auditEntry("Sir Charles", { type: "offer_discount" }, d, [], "2026-12-01T09:00:00Z")).toThrow()
    expect(() => auditEntry("Sir Charles", { type: "offer_discount" }, d, ["Zhi Li"], "2026-12-01T09:00:00Z")).toThrow(/both/)
    expect(auditEntry("Sir Charles", { type: "offer_discount" }, d, ["Zhi Li", "K"], "2026-12-01T09:00:00Z").approvedBy).toEqual(["Zhi Li", "K"])
    const a = decide({ type: "enquiry_reply" }, zhiLi)
    expect(auditEntry("Sir Charles", { type: "enquiry_reply" }, a, [], "2026-12-01T09:00:00Z").approvedBy).toEqual(["auto"])
  })
})

describe("goal: more leads, more purchases, loyal customers", () => {
  it("finds the weakest step, fastest fix first", () => {
    const r = funnel({ leads: 100, orders: 20, customers: 80, repeatCustomers: 20, avgRating: 4.8, repliedWithin60s: 0.95 }, 90)
    expect(r.conversion).toBe(0.2)
    expect(r.repeatRate).toBe(0.25)
    expect(r.belowTarget).toEqual(["conversion", "loyalty"])
    expect(r.focus).toBe("conversion")
  })

  it("slow replies or a falling rating come before anything else", () => {
    expect(funnel({ leads: 50, orders: 10, customers: 10, repeatCustomers: 1, repliedWithin60s: 0.6 }).focus).toBe("speed")
    expect(funnel({ leads: 50, orders: 20, customers: 20, repeatCustomers: 10, avgRating: 4.3 }).focus).toBe("quality")
  })

  it("all on target: nothing to fix", () => {
    expect(funnel({ leads: 120, orders: 45, customers: 40, repeatCustomers: 16, avgRating: 4.8, repliedWithin60s: 0.97 }, 100).focus).toBeNull()
  })
})
