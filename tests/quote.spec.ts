import { describe, it, expect } from "vitest"
import { buildQuote, cleanProductName, money, type QuoteInput } from "../src/lib/quote"

const k: QuoteInput = {
  business: "Sir Charles", contactName: "K", language: "zh", channel: "wechat",
  tier: "Grace", commitment: "founding", foundingClientNumber: 1, storeCount: 3,
  products: [
    { name: "2. Panda & Coconut Cream Cake" },
    { name: "3. Earl Gery & Chestnut Cream Cake" },
    { name: "6.Carrot& Walnut Cake with Cream cheese" },
    { name: "5.Russian Honey Cake" },
  ],
  nextBusyPeriod: { en: "Christmas orders", zh: "圣诞蛋糕预订" },
  today: "2026-11-18",
}

describe("client quote", () => {
  it("founding quote for 3 stores matches the plan sent to K", () => {
    const q = buildQuote(k)
    expect(q.numbers.setupFee).toBe(435)
    expect(q.numbers.monthlyFee).toBe(312.3)
    expect(q.numbers.dueToday).toBe(1371.9)
    expect(q.numbers.saving).toBe(539.1)
    expect(q.numbers.profitable).toBe(true)
  })

  it("writes the WeChat message in Chinese with the computed numbers", () => {
    const m = buildQuote(k).message
    expect(m).toContain("K 老板您好")
    expect(m).toContain("开通费 $245（原价 $490）")
    expect(m).toContain("每月 $134.10（原价 $149）")
    expect(m).toContain("首付合计 $1,371.90，比标准价省 $539.10")
    expect(m).toContain("赶上圣诞蛋糕预订")
    expect(m).not.toContain("prepaidPeriodProfit") // internal numbers never reach the client
  })

  it("fixes product names, spelling first, and skips names already right", () => {
    const q = buildQuote(k)
    expect(q.productFixes.map(f => f.to)).toEqual([
      "Pandan & Coconut Cream Cake", "Earl Grey & Chestnut Cream Cake", "Carrot & Walnut Cake with Cream Cheese",
    ])
    expect(cleanProductName("8. Pistachio & Raspberry Butter Cream Cake")).toBe("Pistachio & Raspberry Buttercream Cake")
    expect(cleanProductName("Ube Mascapone Cream Cake")).toBe("Ube Mascarpone Cream Cake")
  })

  it("puts unknowns on the meeting checklist", () => {
    const q = buildQuote(k)
    expect(q.missingInfo).toContain("各家店的店名、地址、电话和营业时间")
    expect(q.missingInfo).toContain("产品价格（如 6 寸 / 8 寸）和提前预订天数")
    expect(q.missingInfo).toContain("各家店是否属于同一个公司 / ABN")
    expect(q.agenda.reduce((s, a) => s + a.minutes, 0)).toBe(30)
  })

  it("dates actions so work starts only after the first payment", () => {
    const q = buildQuote({ ...k, meetingDate: "2026-11-21" })
    const pay = q.actions.find(a => a.action.includes("首期账单"))!
    const claim = q.actions.find(a => a.action.includes("认领"))!
    expect(pay.due < claim.due).toBe(true)
    expect(q.actions.filter(a => a.action.includes("上线"))).toHaveLength(3) // one per store
  })

  it("writes an English email quote for a standard monthly client", () => {
    const q = buildQuote({ ...k, language: "en", channel: "email", commitment: "monthly", storeCount: 1, products: [] })
    expect(q.numbers.dueToday).toBe(639) // $490 setup + $149 first month
    expect(q.message).toContain("Hi K")
    expect(q.message).toContain("First payment (setup + first month): $639")
    expect(q.markdown).toContain("# Quote — Sir Charles (K)")
  })

  it("refuses the founding offer after the first 3 clients", () => {
    expect(() => buildQuote({ ...k, foundingClientNumber: 4 })).toThrow(/first 3 clients/)
  })

  it("formats money for Australians", () => {
    expect(money(1371.9)).toBe("$1,371.90")
    expect(money(245)).toBe("$245")
  })
})
