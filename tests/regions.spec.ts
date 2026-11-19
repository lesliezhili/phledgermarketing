import { describe, it, expect } from "vitest"
import { handleMessage, REGION, type CsMessage } from "../src/lib/customer-service"
import { chat } from "../src/lib/chat-agent"
import { CHAT_CLIENTS } from "../src/lib/chat-clients"

const base: Omit<CsMessage, "text"> = { business: "Test Co", channel: "webchat", knowledge: {}, policy: { mode: "zhi_li" } }
const allergy = "My son had an allergic reaction after your cake"
const refund = "I want a refund"

describe("English replies follow the business's market", () => {
  it("Australia (default): 000 and the Australian Consumer Law", () => {
    expect(handleMessage({ ...base, text: allergy }).reply).toContain("call 000")
    const r = handleMessage({ ...base, text: refund })
    expect(r.reply).toContain("the Australian Consumer Law")
    expect(r.handover?.note).toMatch(/Australian Consumer Law/)
  })

  it("Canada: 911 and provincial consumer protection law, never Australian", () => {
    const k = { market: "ca" as const }
    const crit = handleMessage({ ...base, knowledge: k, text: allergy }).reply
    expect(crit).toContain("call 911")
    expect(crit).not.toContain("000")
    const r = handleMessage({ ...base, knowledge: k, text: refund })
    expect(r.reply).toContain("your province's consumer protection law")
    expect(r.reply).not.toMatch(/Australia/)
    expect(r.handover?.note).toMatch(/provincial consumer protection/)
    expect(r.handover?.note).not.toMatch(/Australia/)
  })

  it("Québec customers writing in English: 911 and Québec's Consumer Protection Act", () => {
    const r = handleMessage({ ...base, knowledge: { market: "qc" }, text: refund })
    expect(r.reply).toContain("Québec's Consumer Protection Act")
    expect(handleMessage({ ...base, knowledge: { market: "qc" }, text: allergy }).reply).toContain("911")
  })

  it("faults name the market's law in the hand-over note", () => {
    const r = handleMessage({ ...base, knowledge: { market: "ca" }, text: "The heater is broken" })
    expect(r.intent).toBe("fault")
    expect(r.handover?.note).toMatch(/provincial/)
  })

  it("Chinese replies for a Canadian business use 911 and provincial law", () => {
    const k = { market: "ca" as const }
    expect(handleMessage({ ...base, knowledge: k, text: "我吃了以后过敏了" }).reply).toContain("911")
    expect(handleMessage({ ...base, knowledge: k, text: "我要退款" }).reply).toContain("您所在省份的消费者保护法")
  })

  it("French defaults to Québec; a per-message market overrides the business's", () => {
    expect(handleMessage({ ...base, text: "Je veux un remboursement" }).reply).toContain("la Loi sur la protection du consommateur")
    expect(handleMessage({ ...base, market: "ca", text: refund }).reply).toContain("your province's")
  })

  it("every market and language has its law and emergency number", () => {
    for (const r of Object.values(REGION)) {
      expect(r.emergency).toMatch(/^(000|911)$/)
      for (const lang of ["en", "zh", "fr"] as const) expect(r.law[lang].length).toBeGreaterThan(5)
    }
  })
})

describe("PHledger chat uses the visitor's market from the page", () => {
  const h = [{ role: "user" as const, content: "I'm not happy with the work and want a refund" }]
  it("Canada page → provincial law; home page → Australian", async () => {
    const ca = await chat(CHAT_CLIENTS.phledger, h, undefined, null, "ca")
    expect(ca.reply).toContain("your province's consumer protection law")
    const au = await chat(CHAT_CLIENTS.phledger, h, undefined, null)
    expect(au.reply).toContain("the Australian Consumer Law")
  })
})
