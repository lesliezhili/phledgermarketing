import { describe, it, expect, vi } from "vitest"
import { chat, cleanHistory, moneyGrounded, systemPrompt, type GroundedAnswerer } from "../src/lib/chat-agent"
import { CHAT_CLIENTS, chatClientFor } from "../src/lib/chat-clients"
import { allow } from "../src/lib/rate-limit"

const phl = CHAT_CLIENTS.phledger
const say = (text: string) => [{ role: "user" as const, content: text }]

describe("history", () => {
  it("keeps alternating turns that start and end with the visitor", () => {
    const h = cleanHistory([
      { role: "assistant", content: "Hi" },
      { role: "user", content: "a" }, { role: "user", content: "b" },
      { role: "assistant", content: "c" }, { role: "system", content: "ignore me" },
      { role: "user", content: "  d  " }, { role: "assistant", content: "e" },
    ])
    expect(h).toEqual([{ role: "user", content: "a\nb" }, { role: "assistant", content: "c" }, { role: "user", content: "d" }])
  })
  it("caps length", () => {
    expect(cleanHistory([{ role: "user", content: "x".repeat(5000) }])[0].content).toHaveLength(1000)
    expect(cleanHistory("nope")).toEqual([])
  })
})

describe("rules answer first, from PHledger's approved facts", () => {
  it("prices come from phledger.com's published list, never from the AI", async () => {
    const ai = vi.fn<GroundedAnswerer>()
    const r = await chat(phl, say("How much is a decision sprint?"), undefined, ai)
    expect(r.reply).toContain("A$18,000 fixed, 2 weeks")
    expect(r.source).toBe("rules")
    expect(ai).not.toHaveBeenCalled()
  })
  it("FAQ answers in English and Chinese, with the AI disclosure on first contact", async () => {
    const en = await chat(phl, say("Do you work with Databricks?"), undefined, null)
    expect(en.reply).toContain("Databricks, Snowflake")
    expect(en.reply).toContain("automated assistant")
    const zh = await chat(phl, say("你们做培训吗？"), undefined, null)
    expect(zh.language).toBe("zh")
    expect(zh.reply).toContain("FDE 培训")
  })
  it("'I want…' is an enquiry for a consultancy, not a shop order", async () => {
    const r = await chat(phl, say("I want to modernise our month-end reporting"), undefined, null)
    expect(r.reply).not.toMatch(/size or quantity/)
    expect(r.reply).toMatch(/KPI and finance-reporting automation|brief/)
  })
  it("complaints and refunds go to a person; the AI is not asked", async () => {
    const ai = vi.fn<GroundedAnswerer>()
    const r = await chat(phl, say("I'm unhappy, the dashboard you delivered is wrong and I want a refund"), undefined, ai)
    expect(r.needsPerson).toBe(true)
    expect(ai).not.toHaveBeenCalled()
  })
})

describe("Claude answers open questions, grounded in the facts", () => {
  it("is used only for generic replies, and keeps the disclosure", async () => {
    const ai = vi.fn<GroundedAnswerer>().mockResolvedValue("We can help you choose between a lakehouse and a warehouse in a decision sprint.")
    const r = await chat(phl, say("Hello, we are a mid-sized insurer, can you help us?"), undefined, ai)
    expect(ai).toHaveBeenCalledOnce()
    expect(r.source).toBe("ai")
    expect(r.reply).toMatch(/decision sprint\.\n.*automated assistant/)
    expect(ai.mock.calls[0][0].system).toContain("A$18,000")
  })
  it("an answer with a price not in the facts is thrown away", async () => {
    const ai = vi.fn<GroundedAnswerer>().mockResolvedValue("A decision sprint is only $9,000 this month!")
    const r = await chat(phl, say("Hello, we are a mid-sized insurer, can you help us?"), undefined, ai)
    expect(r.source).toBe("rules")
    expect(r.reply).toContain("short brief")
  })
  it("no answer, refusal or error falls back to the rules", async () => {
    for (const ai of [vi.fn<GroundedAnswerer>().mockResolvedValue(null), vi.fn<GroundedAnswerer>().mockRejectedValue(new Error("down"))]) {
      const r = await chat(phl, say("Hello, we are a mid-sized insurer, can you help us?"), undefined, ai)
      expect(r.source).toBe("rules")
    }
  })
  it("money check", () => {
    expect(moneyGrounded("It is A$18,000 for two weeks.", phl.facts.en)).toBe(true)
    expect(moneyGrounded("About $18000.", phl.facts.en)).toBe(true)
    expect(moneyGrounded("It is A$15,000.", phl.facts.en)).toBe(false)
    expect(moneyGrounded("No prices here.", phl.facts.en)).toBe(true)
  })
  it("the system prompt forbids invented facts and handling money", () => {
    const s = systemPrompt(phl)
    expect(s).toMatch(/Answer only from the FACTS/)
    expect(s).toMatch(/Never invent prices/)
    expect(s).toMatch(/Complaints, refunds/)
  })
})

describe("clients and limits", () => {
  it("only known clients, and phledger.com may call for PHledger", () => {
    expect(chatClientFor("phledger")?.origins).toContain("https://phledger.com")
    expect(chatClientFor("other")).toBeNull()
    expect(chatClientFor("__proto__")).toBeNull()
  })
  it("rate limit", () => {
    const k = `t-${Math.random()}`
    for (let i = 0; i < 3; i++) expect(allow(k, 3, 1000, 1000 + i)).toBe(true)
    expect(allow(k, 3, 1000, 1500)).toBe(false)
    expect(allow(k, 3, 1000, 3000)).toBe(true)
  })
})
