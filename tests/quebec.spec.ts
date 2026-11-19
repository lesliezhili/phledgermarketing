import { describe, it, expect } from "vitest"
import { MARKETS } from "../src/lib/markets"
import { BRANDS } from "../src/lib/brands"
import { AU_CA_LAUNCH, QC_LAUNCH } from "../src/lib/campaigns"
import { planMarkets, formatForChannel, CHANNEL_SPECS } from "../src/lib/social-publisher"
import { classify, detectLanguage, handleMessage } from "../src/lib/customer-service"
import { chat } from "../src/lib/chat-agent"
import { CHAT_CLIENTS } from "../src/lib/chat-clients"

const phl = BRANDS["phledger-consulting"]
const week = planMarkets(phl, [...AU_CA_LAUNCH, ...QC_LAUNCH], "2026-11-23")

describe("Québec market", () => {
  it("is French only, in CAD, with Law 25 and CASL", () => {
    const qc = MARKETS.qc
    expect(qc.contentLanguages).toEqual(["fr"])
    expect(qc.locale).toBe("fr-CA")
    expect(qc.currency).toBe("CAD")
    expect(qc.law.privacy).toMatch(/Loi 25/)
    expect(qc.law.antiSpam).toMatch(/CASL/)
  })

  it("Québec gets only French posts; Australia and Canada get none", () => {
    const qc = week.filter(p => p.market === "qc")
    expect(qc.length).toBeGreaterThan(0)
    const frIds = new Set(QC_LAUNCH.map(i => i.id))
    expect(qc.every(p => frIds.has(p.ideaId))).toBe(true)
    expect(week.filter(p => p.market !== "qc").some(p => frIds.has(p.ideaId))).toBe(false)
  })

  it("French posts link to the French page, tagged for Québec, with a French call to action", () => {
    const li = week.find(p => p.market === "qc" && p.channel === "linkedin")!
    expect(li.link).toMatch(/^https:\/\/phledger\.com\/canada\/fr/)
    expect(li.link).toContain("utm_campaign=fde-au-ca-qc")
    expect(li.text).toMatch(/Décrivez-nous votre projet : https|Voir le modèle de prix : https/)
    const ig = formatForChannel(QC_LAUNCH[0], phl, "instagram", "qc")
    expect(ig.text).toContain("lien dans la bio")
    expect(ig.text).not.toContain("link in bio")
  })

  it("every French post fits each channel and has its own French call to action", () => {
    for (const i of QC_LAUNCH) {
      expect(i.cta).toBeTruthy()
      for (const ch of MARKETS.qc.channels) expect(formatForChannel(i, phl, ch, "qc").text.length).toBeLessThanOrEqual(CHANNEL_SPECS[ch].maxChars)
      expect(`${i.hook} ${i.body}`).not.toMatch(/\d+%|\$\d/)
    }
  })
})

describe("customer service in French", () => {
  it("detects French", () => {
    expect(detectLanguage("Bonjour, combien coûte un sprint?")).toBe("fr")
    expect(detectLanguage("Est-ce que vous travaillez au Québec")).toBe("fr")
    expect(detectLanguage("How much is a sprint?")).toBe("en")
    expect(detectLanguage("Can I order at Café Test in Montréal?")).toBe("en")
    expect(detectLanguage("How much is the crème brûlée?")).toBe("en")
    expect(detectLanguage("Mon fils a fait une réaction allergique")).toBe("fr")
    expect(detectLanguage("多少钱")).toBe("zh")
  })

  it.each([
    ["Combien coûte le gâteau?", "price"],
    ["Êtes-vous ouverts dimanche?", "hours_location"],
    ["Je voudrais réserver une table", "booking"],
    ["Où est ma commande?", "order_status"],
    ["Je ne suis pas satisfait, la commande était mauvaise", "complaint"],
    ["Je veux un remboursement", "refund_return"],
    ["Merci, c'était délicieux!", "thanks"],
    ["Mon fils a fait une réaction allergique", "critical"],
    ["ARRET", "opt_out"],
  ])("%s → %s", (text, intent) => {
    expect(classify(text)).toBe(intent)
  })

  it("no false French matches in English", () => {
    expect(classify("The scout troop needs a quote")).toBe("price")
    expect(classify("Do you sell fermented drinks?")).not.toBe("hours_location")
  })

  it("Québec rules: 911, consumer protection law, French opt-out", () => {
    const base = { business: "Café Test", channel: "sms" as const, knowledge: {}, policy: { mode: "zhi_li" as const } }
    expect(handleMessage({ ...base, text: "Mon fils a fait une réaction allergique" }).reply).toContain("911")
    const refund = handleMessage({ ...base, text: "Je veux un remboursement" }).reply
    expect(refund).toContain("Loi sur la protection du consommateur")
    expect(refund).toContain("Répondez ARRET")
    expect(refund).not.toMatch(/Australian|000/)
  })

  it("phone in French: says links instead of reading them, asks to tell not reply", () => {
    const r = handleMessage({ business: "Café Test", channel: "phone", text: "Je veux commander", knowledge: { orderLink: "https://example.com/c" }, policy: { mode: "zhi_li" } })
    expect(r.reply).toContain("je vous envoie le lien par texto")
    expect(r.reply).toContain("dites-moi")
    expect(r.smsFollowUp).toBe("Café Test: https://example.com/c")
  })
})

describe("PHledger chat in French", () => {
  it("answers Québec questions in French from approved facts", async () => {
    const r = await chat(CHAT_CLIENTS.phledger, [{ role: "user", content: "Est-ce que vos données peuvent rester au Québec? Loi 25?" }], undefined, null)
    expect(r.language).toBe("fr")
    expect(r.reply).toContain("Loi 25")
    expect(r.reply).toContain("assistant automatisé")
  })
  it("prices in French with the AUD note", async () => {
    const r = await chat(CHAT_CLIENTS.phledger, [{ role: "user", content: "Combien coûte un sprint de décision?" }], undefined, null)
    expect(r.reply).toContain("Sprint de décision : 18 000 $ AU")
  })
  it("unknown question: French fallback to the French page", async () => {
    const r = await chat(CHAT_CLIENTS.phledger, [{ role: "user", content: "Bonjour, nous sommes une PME de Laval, pouvez-vous nous aider?" }], undefined, null)
    expect(r.reply).toContain("https://phledger.com/canada/fr#contact")
  })
})
