// Review replies, including bad feedback.
//
// Every new Google (or Facebook) review is triaged and gets a drafted reply.
// - Positive reviews: reply from approved templates; can be auto-published.
// - Neutral / negative: draft for approval, reply within 24 hours.
// - Critical (food safety, allergy, injury, discrimination, legal): never
//   auto-published; the owner is alerted within 1 hour.
// Rules: never argue, never reveal customer details, never offer anything in
// return for changing a review, take problems offline, keep it short.

export type ReviewSeverity = 'positive' | 'neutral' | 'negative' | 'critical'
export type ReviewLanguage = 'en' | 'zh'

export interface ReviewInput {
  rating: number // 1–5 stars
  text: string
  reviewerName?: string
  business: string
  contact: string // where an unhappy customer can reach the owner, e.g. email or phone
  language?: ReviewLanguage
  products?: string[] // menu items, so a positive reply can mention what they liked
}

interface Topic {
  id: string
  critical: boolean
  keywords: RegExp
  en: string // apology phrase
  zh: string
}

const TOPICS: Topic[] = [
  { id: 'food_safety', critical: true, keywords: /food poisoning|sick|vomit|diarrh|hair in|cockroach|\bbugs?\b|insect|mou?ldy?|undercooked|食物中毒|拉肚子|呕吐|头发|蟑螂|虫子|发霉|没熟/i, en: '', zh: '' },
  { id: 'allergy', critical: true, keywords: /allerg|anaphyla|epipen|gluten|coeliac|celiac|过敏/i, en: '', zh: '' },
  { id: 'injury', critical: true, keywords: /injur|burn(t|ed) (my|me|hand)|cut (my|me)|hospital|ambulance|受伤|烫伤|医院/i, en: '', zh: '' },
  { id: 'discrimination_legal', critical: true, keywords: /racis|discriminat|lawyer|sue\b|legal action|police|歧视|律师|报警|起诉/i, en: '', zh: '' },
  { id: 'staff', critical: false, keywords: /rude|attitude|ignored|unfriendly|unprofessional|态度|服务差|不理人|冷漠/i, en: 'the service you received fell short', zh: '这次服务让您不满意' },
  { id: 'wait', critical: false, keywords: /slow|waited|waiting|took (so )?long|forever|太慢|等了|等很久/i, en: 'you had to wait so long', zh: '让您等了这么久' },
  { id: 'order', critical: false, keywords: /wrong order|missing|forgot|incorrect|not what i ordered|送错|漏了|做错|拿错/i, en: 'your order wasn\'t right', zh: '您的订单出了差错' },
  { id: 'quality', critical: false, keywords: /cold|bland|dry|stale|tasteless|soggy|burnt|disappoint|难吃|不好吃|太干|不新鲜|失望/i, en: 'your food wasn\'t up to our standard', zh: '食物没有达到我们的标准' },
  { id: 'price', critical: false, keywords: /expensive|overpriced|pricey|rip.?off|value|太贵|不值/i, en: 'it didn\'t feel like good value', zh: '让您觉得不值这个价' },
  { id: 'booking', critical: false, keywords: /booking|reservation|cancel+ed|预订|订位|取消/i, en: 'your booking didn\'t go smoothly', zh: '您的预订不顺利' },
]

/** Content that may break Google's review policies — consider reporting it (never reply in kind). */
const POLICY_FLAGS = /https?:\/\/|www\.|\bf+u+c+k|\bsh[i1]t\b|\bc[u*]nt\b/i

export interface ReviewTriage {
  severity: ReviewSeverity
  topics: string[]
  autoPublish: boolean
  escalate: boolean
  replyWithinHours: number
  possiblePolicyViolation: boolean
  draftReply: string
}

export function triageReview(r: ReviewInput): ReviewTriage {
  const rating = Math.min(5, Math.max(1, Math.round(r.rating)))
  // Ignore menu-item names when looking for complaints ("Basque Burnt
  // Cheesecake" is praise, not a burnt-food complaint).
  let scan = r.text
  for (const p of [...(r.products ?? []), 'burnt cheesecake', 'cold brew']) {
    scan = scan.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' ')
  }
  const topics = TOPICS.filter(t => t.keywords.test(scan))
  const critical = topics.some(t => t.critical)
  const severity: ReviewSeverity = critical ? 'critical' : rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative'
  const complaints = topics.filter(t => !t.critical)
  // A 4–5 star review that still complains about something is answered by a person.
  const autoPublish = severity === 'positive' && complaints.length === 0
  return {
    severity,
    topics: topics.map(t => t.id),
    autoPublish,
    escalate: critical,
    replyWithinHours: critical ? 1 : severity === 'positive' ? 48 : 24,
    possiblePolicyViolation: POLICY_FLAGS.test(r.text),
    draftReply: draft(r, severity, complaints),
  }
}

function draft(r: ReviewInput, severity: ReviewSeverity, complaints: Topic[]): string {
  const zh = r.language === 'zh'
  const name = r.reviewerName?.split(' ')[0]
  const liked = (r.products ?? []).find(p => r.text.toLowerCase().includes(p.toLowerCase()))

  if (zh) {
    const hi = name ? `${name}您好，` : '您好，'
    switch (severity) {
      case 'positive':
        return `${hi}谢谢您的好评！${liked ? `很高兴您喜欢我们的${liked}。` : '很高兴您喜欢。'}期待您再来 ${r.business}！`
      case 'neutral':
        return `${hi}谢谢您的反馈。${complaints[0] ? `很抱歉${complaints[0].zh}。` : ''}我们想做得更好，欢迎通过 ${r.contact} 告诉我们更多。`
      case 'negative':
        return `${hi}谢谢您告诉我们，很抱歉${complaints[0]?.zh ?? '这次体验让您失望'}。这不是我们希望在 ${r.business} 给任何客人的体验。请通过 ${r.contact} 联系我们，我们会认真处理。`
      case 'critical':
        return `${hi}非常抱歉听到这件事，我们非常重视。请通过 ${r.contact} 直接联系我们，我们会马上跟进。`
    }
  }
  const hi = name ? `Hi ${name}, ` : 'Hi, '
  switch (severity) {
    case 'positive':
      return `${hi}thank you for the lovely review! ${liked ? `We're so glad you enjoyed the ${liked}.` : 'We\'re so glad you enjoyed your visit.'} See you again soon at ${r.business}.`
    case 'neutral':
      return `${hi}thank you for your feedback. ${complaints[0] ? `We're sorry ${complaints[0].en}. ` : ''}We'd love to do better — please tell us more at ${r.contact}.`
    case 'negative':
      return `${hi}thank you for telling us, and we're sorry ${complaints[0]?.en ?? 'your visit was disappointing'}. That's not the experience we want anyone to have at ${r.business}. Please contact us at ${r.contact} so we can make it right.`
    case 'critical':
      return `${hi}we're very sorry to hear this and we take it seriously. Please contact us directly at ${r.contact} so we can follow up straight away.`
  }
}
