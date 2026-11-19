// AI Customer Service — presale (get customers) and aftersales (keep them).
//
// One inbox for every channel. The main two are the client's website (the
// enquiry email/form and an AI agent chat on the site — PhLedger's own runs
// on phledger.com) and phone/mobile (calls answered by a voice agent or
// text-back on a missed call, plus SMS); also WhatsApp, Messenger,
// Instagram and WeChat. Each customer message gets:
//   1. an instant reply (under a minute) that either answers from the facts
//      the client approved (hours, address, published prices, booking and
//      order links, policies, FAQs) or acknowledges and says who will follow
//      up and when — it never invents facts, prices or promises;
//   2. where needed, a hand-over to a person with a ready-to-approve note and
//      a deadline, routed by the approval harness (src/lib/approvals.ts).
//
// Rules the AI never breaks:
//   - It says it is an automated assistant on first contact.
//   - Prices only from the client's published list; no discounts, refunds,
//     credits or compensation — those are the owner's decision.
//   - Complaints get an instant apology and a person's reply; food safety,
//     allergy, injury, legal threats go to the owner now.
//   - Refund replies never limit Australian Consumer Law rights.
//   - "STOP" / "退订" stops all messages.
//   - Review requests go to every customer, never only happy ones
//     (Google's policy and ACCC guidance on reviews).
//   - Marketing (reorder offers, win-back) only to customers who consented.

import { decide, type ActionType, type ApprovalPolicy, type Decision } from './approvals'
import { firstReply, type Trade } from './speed-to-lead'

export type CsChannel =
  | 'webchat' // AI agent on the website
  | 'email' // website enquiry form or email
  | 'phone' // voice call (voice agent, or voicemail transcript)
  | 'sms' // mobile text
  | 'whatsapp' | 'messenger' | 'instagram' | 'wechat'
export type CsLanguage = 'en' | 'zh' | 'fr' // fr: Canadian French (Québec)
export type CsStage = 'presale' | 'purchase' | 'aftersales'

export type CsIntent =
  | 'enquiry' | 'price' | 'hours_location' | 'booking' | 'order' // presale and purchase
  | 'order_status' | 'how_to' | 'fault' | 'complaint' | 'refund_return' | 'cancel' | 'reorder' | 'thanks' // aftersales
  | 'critical' | 'opt_out'

export const STAGE: Record<CsIntent, CsStage> = {
  enquiry: 'presale', price: 'presale', hours_location: 'presale', booking: 'presale',
  order: 'purchase',
  order_status: 'aftersales', how_to: 'aftersales', fault: 'aftersales', complaint: 'aftersales',
  refund_return: 'aftersales', cancel: 'aftersales', reorder: 'aftersales', thanks: 'aftersales',
  critical: 'aftersales', opt_out: 'aftersales',
}

/** Facts the client has approved for the AI to use. Anything missing goes to a person. */
export interface Knowledge {
  hours?: string
  address?: string
  prices?: { item: string; price: string }[] // published prices only
  bookingLink?: string
  orderLink?: string
  reviewLink?: string
  returnsPolicy?: string // the client's own words; never overrides consumer law
  faqs?: { keywords: string[]; answer: string }[]
  /** Professional services (no shop orders): "I want…" is an enquiry, not an order. */
  professional?: boolean
  /** Reply to an open enquiry no FAQ matches (instead of the trade questions). */
  enquiryFallback?: string
}

export interface CsMessage {
  business: string
  text: string
  channel: CsChannel
  language?: CsLanguage // detected from the text if omitted
  firstContact?: boolean // add the automated-assistant disclosure (default true)
  trade?: Trade // for presale enquiries from service businesses
  knowledge: Knowledge
  policy: ApprovalPolicy
}

export interface Handover {
  action: ActionType
  decision: Decision
  to: 'owner' | 'zhi_li'
  withinHours: number
  note: string
}

export interface CsResult {
  intent: CsIntent
  stage: CsStage
  language: CsLanguage
  reply: string // the instant reply (route: auto)
  replyDecision: Decision
  answeredByAi: boolean // fully answered from approved facts, no person needed
  /** The reply is a generic fallback (no approved fact matched): a grounded AI answer may replace it. */
  generic: boolean
  handover: Handover | null
  optOut: boolean
  /** Phone only: links can't be spoken, so they follow by SMS straight after the call. */
  smsFollowUp?: string
}

// Order matters: safety and opt-out first, then aftersales, then presale.
const INTENTS: [CsIntent, RegExp][] = [
  ['opt_out', /^\s*(stop|unsubscribe|退订|取消订阅|arr[eê]t|d[ée]sabonner|d[ée]sabonnement)\s*[.!。]?\s*$/i],
  ['critical', /food poisoning|\bsick\b|vomit|diarrh|allerg|anaphyla|epipen|injur|hospital|ambulance|lawyer|\bsue\b|legal action|police|scam|fraud|intoxication|malade|bless[ée]|blessure|h[ôo]pital|avocat|poursuite|fraude|arnaque|食物中毒|拉肚子|呕吐|过敏|受伤|医院|律师|起诉|报警|诈骗/i],
  ['refund_return', /refund|money back|\breturn(ing)?\b|exchange|chargeback|replace(ment)?|rembours|\bretour|[ée]change|remplacement|退款|退货|换货|退钱|赔偿/i],
  ['fault', /broken|faulty|defect|not working|doesn'?t work|stopped working|damaged|leak|warranty|bris[ée]|d[ée]fectueu|ne fonctionne (pas|plus)|ne marche (pas|plus)|endommag|garantie|fuite|坏了|不能用|故障|漏水|保修|损坏/i],
  ['complaint', /complain|unhappy|disappoint|terrible|awful|worst|rude|wrong order|missing|forgot|\blate\b|\bcold\b|never arrived|not happy|plainte|pas content|pas satisfait|insatisfait|d[ée][çc]u|d[ée]cevant|horrible|\bpire\b|impoli|en retard|mauvaise commande|manquant|jamais arriv|投诉|不满意|太差|送错|漏了|迟到|态度差|难吃/i],
  ['cancel', /cancel|annul|取消/i],
  ['order_status', /where('?s| is) my|order status|track(ing)?|ready yet|arrived yet|on (its|the) way|o[ùu] est ma commande|suivi|statut de|est-ce pr[eê]t|我的订单|到哪|什么时候到|好了吗/i],
  ['reorder', /again|re-?order|re-?book|same as (last|before)|another one|de nouveau|encore une fois|m[eê]me chose que|再订|再来|再约|续订|和上次一样/i],
  ['how_to', /how (do|can|should) i|how to|instructions|set ?up|look after|care for|comment (faire|utiliser|conserver|puis-je|est-ce que je)|mode d'emploi|怎么用|如何|怎么弄|保存/i],
  ['thanks', /thank|thanks|loved|love it|amazing|awesome|delicious|great (job|service)|merci|d[ée]licieux|g[ée]nial|excellent|谢谢|好吃|很棒|太好了|满意/i],
  ['booking', /\bbook|appointment|reservation|reserve|availab|free (on|this|next)|r[ée]serv|rendez-vous|disponib|预约|订位|有空|档期/i],
  ['price', /how much|price|cost|quote|\$|combien|\bprix\b|\bco[uû]t|tarif|soumission|devis|多少钱|价格|报价|价钱/i],
  ['hours_location', /open|hours|close|closing|where are you|address|parking|located|ouvert|heures|horaire|\bferm[ée]\b|adresse|stationnement|o[ùu] (êtes|etes)-vous|几点|营业|地址|在哪|停车/i],
  ['order', /\border\b|can i (get|have)|i'?d like|i want|pick ?up|deliver|commander|je voudrais|j'aimerais|je veux|livraison|ramassage|下单|我要|想订|想要|自取|外送/i],
]

export function classify(text: string): CsIntent {
  for (const [intent, re] of INTENTS) if (re.test(text)) return intent
  return 'enquiry'
}

const FRENCH_WORDS = /\b(bonjour|merci|vous|votre|vos|est-ce|combien|je|nous|pour|avec|une|des|les|du|au|aux|est|sont|pas|quel|quelle|comment|pourquoi|o[ùu]|veux|voudrais|aimerais|mon|ma|mes|un|le|la|et)\b/gi
const ENGLISH_WORDS = /\b(the|and|you|your|is|are|my|i|can|how|what|do|does|please|thanks|thank|order|want|to|for|of|with|in|at|on|this|that|have|we|it)\b/gi
export const detectLanguage = (text: string): CsLanguage => {
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh'
  // Score French against English, so "Can I order at Café X in Montréal?" stays English.
  const fr = (text.match(FRENCH_WORDS) ?? []).length + (/[àâçéèêëîïôûùüÿœ]/i.test(text) ? 1 : 0) + (/\b(j|c|qu|l|d|n)'/i.test(text) ? 1 : 0)
  const en = (text.match(ENGLISH_WORDS) ?? []).length
  return fr >= 2 && fr > en ? 'fr' : 'en'
}

const T = {
  en: {
    disclosure: (b: string) => `(I'm ${b}'s automated assistant; a person follows up whenever needed.)`,
    voiceDisclosure: (b: string) => `Hi, you're speaking with ${b}'s automated assistant. This call may be recorded so we get your details right; say "person" at any time to leave a message for the team.`,
    optOut: 'Reply STOP to opt out.',
    stopped: (b: string) => `You're unsubscribed from ${b}'s messages. You won't hear from us again unless you contact us.`,
    critical: (b: string) => `We're very sorry. This is serious and the owner of ${b} has been told now; a person will contact you as soon as possible. If anyone needs urgent medical help, call 000.`,
    complaint: (b: string) => `I'm sorry about this. I've passed it straight to the team at ${b} and a person will reply today. If you can, please reply with your order details (date, name, what you bought) and a photo if it helps.`,
    fault: (b: string) => `Sorry it isn't working as it should. Please reply with your order details, what happened and a photo or short video. A person from ${b} will reply within one business day about the next step.`,
    refund: (b: string) => `Thanks for letting us know. I've passed your request to the owner of ${b}, who will reply within one business day. Please reply with your order details and the reason. Your rights under the Australian Consumer Law are not affected.`,
    policy: (p: string) => `Our policy: ${p}`,
    cancel: (b: string) => `Got it. I've passed your cancellation to ${b} and a person will confirm it shortly.`,
    status: (b: string) => `Thanks — I'm checking with the team at ${b} and a person will update you shortly. Please reply with the name or number on your order.`,
    reorder: (link?: string) => link ? `Lovely to hear from you again! You can order or book here: ${link}. Or reply with what you'd like and when.` : `Lovely to hear from you again! Reply with what you'd like and when, and we'll confirm.`,
    thanks: (b: string, link?: string) => link ? `Thank you, that means a lot to the team at ${b}! If you have a moment, a Google review helps others find us: ${link}` : `Thank you, that means a lot to the team at ${b}!`,
    hours: (h: string) => `Our hours: ${h}`,
    address: (a: string) => `We're at ${a}.`,
    price: (lines: string) => `Our prices:\n${lines}`,
    priceUnknown: (b: string) => `Thanks for asking. A person from ${b} will confirm the price for you shortly.`,
    booking: (link: string) => `You can book a time here: ${link}`,
    order: (link: string) => `You can order here: ${link}. Or reply with what you'd like, the size or quantity, and the date and time you need it.`,
    orderNoLink: `Happy to help. Please reply with what you'd like, the size or quantity, and the date and time you need it, and we'll confirm.`,
    handover: (b: string) => `Thanks for your message. A person from ${b} will reply shortly.`,
  },
  zh: {
    disclosure: (b: string) => `（我是${b}的自动助理，需要时会有人亲自跟进。）`,
    voiceDisclosure: (b: string) => `您好，这里是${b}的自动助理。为准确记录您的信息，通话可能会被录音；随时说“转人工”即可给团队留言。`,
    optOut: '回复“退订”即可停止接收消息。',
    stopped: (b: string) => `已为您退订${b}的消息。除非您联系我们，否则不会再收到消息。`,
    critical: (b: string) => `非常抱歉。这件事很严重，${b}的老板已第一时间收到通知，会尽快有人联系您。如有人需要紧急医疗帮助，请拨打 000。`,
    complaint: (b: string) => `非常抱歉给您带来不好的体验。我已把情况直接转给${b}的团队，今天会有人回复您。方便的话请回复订单信息（日期、姓名、所购商品），有照片更好。`,
    fault: (b: string) => `抱歉产品出现问题。请回复订单信息、具体情况，以及照片或短视频。${b}会在一个工作日内有人回复下一步安排。`,
    refund: (b: string) => `收到，谢谢告知。您的请求已转给${b}的老板，会在一个工作日内回复。请回复订单信息和原因。您在澳大利亚消费者法下的权利不受影响。`,
    policy: (p: string) => `我们的政策：${p}`,
    cancel: (b: string) => `收到，已把您的取消请求转给${b}，稍后会有人确认。`,
    status: (b: string) => `谢谢，我正在和${b}的团队确认，稍后会有人告诉您进度。请回复订单上的姓名或单号。`,
    reorder: (link?: string) => link ? `欢迎再次光临！可以在这里下单或预约：${link}。也可以直接回复想要什么、什么时间。` : `欢迎再次光临！请直接回复想要什么、什么时间，我们来确认。`,
    thanks: (b: string, link?: string) => link ? `谢谢您！这对${b}的团队意义很大。方便的话，在 Google 留个评价能帮助更多人找到我们：${link}` : `谢谢您！这对${b}的团队意义很大。`,
    hours: (h: string) => `营业时间：${h}`,
    address: (a: string) => `地址：${a}`,
    price: (lines: string) => `价格：\n${lines}`,
    priceUnknown: (b: string) => `谢谢询价，${b}稍后会有人为您确认价格。`,
    booking: (link: string) => `可以在这里预约时间：${link}`,
    order: (link: string) => `可以在这里下单：${link}。也可以直接回复想要的商品、规格或数量，以及需要的日期和时间。`,
    orderNoLink: `乐意为您服务。请回复想要的商品、规格或数量，以及需要的日期和时间，我们来确认。`,
    handover: (b: string) => `谢谢您的消息，${b}稍后会有人回复您。`,
  },
  // Canadian French (Québec). Emergency number 911; consumer law: Loi sur la protection du consommateur.
  fr: {
    disclosure: (b: string) => `(Je suis l'assistant automatisé de ${b}; une personne fait le suivi au besoin.)`,
    voiceDisclosure: (b: string) => `Bonjour, vous parlez avec l'assistant automatisé de ${b}. Cet appel peut être enregistré pour bien noter vos renseignements; dites « une personne » à tout moment pour laisser un message à l'équipe.`,
    optOut: 'Répondez ARRET pour vous désabonner.',
    stopped: (b: string) => `Vous êtes désabonné des messages de ${b}. Vous n'aurez plus de nouvelles de nous, à moins de nous écrire.`,
    critical: (b: string) => `Nous sommes vraiment désolés. C'est sérieux : le propriétaire de ${b} vient d'être avisé et une personne vous contactera dès que possible. En cas d'urgence médicale, composez le 911.`,
    complaint: (b: string) => `Je suis désolé de cette situation. Je l'ai transmise directement à l'équipe de ${b} et une personne vous répondra aujourd'hui. Si possible, répondez en indiquant les détails de votre commande (date, nom, achat) et une photo au besoin.`,
    fault: (b: string) => `Désolé que ça ne fonctionne pas comme prévu. Répondez en indiquant les détails de votre commande, ce qui s'est passé, et une photo ou une courte vidéo. Une personne de ${b} vous répondra d'ici un jour ouvrable pour la suite.`,
    refund: (b: string) => `Merci de nous en informer. J'ai transmis votre demande au propriétaire de ${b}, qui vous répondra d'ici un jour ouvrable. Répondez en indiquant les détails de votre commande et la raison. Vos droits en vertu de la Loi sur la protection du consommateur ne sont pas touchés.`,
    policy: (p: string) => `Notre politique : ${p}`,
    cancel: (b: string) => `C'est noté. J'ai transmis votre annulation à ${b} et une personne la confirmera sous peu.`,
    status: (b: string) => `Merci, je vérifie auprès de l'équipe de ${b} et une personne vous donnera des nouvelles sous peu. Répondez en indiquant le nom ou le numéro de votre commande.`,
    reorder: (link?: string) => link ? `Ça fait plaisir de vous revoir! Vous pouvez commander ou réserver ici : ${link}. Ou répondez en indiquant ce que vous voulez et pour quand.` : `Ça fait plaisir de vous revoir! Répondez en indiquant ce que vous voulez et pour quand, et nous confirmerons.`,
    thanks: (b: string, link?: string) => link ? `Merci, ça compte beaucoup pour l'équipe de ${b}! Si vous avez un moment, un avis Google aide d'autres personnes à nous trouver : ${link}` : `Merci, ça compte beaucoup pour l'équipe de ${b}!`,
    hours: (h: string) => `Nos heures : ${h}`,
    address: (a: string) => `Nous sommes au ${a}.`,
    price: (lines: string) => `Nos prix :\n${lines}`,
    priceUnknown: (b: string) => `Merci de votre question. Une personne de ${b} vous confirmera le prix sous peu.`,
    booking: (link: string) => `Vous pouvez réserver un moment ici : ${link}`,
    order: (link: string) => `Vous pouvez commander ici : ${link}. Ou répondez en indiquant ce que vous voulez, la taille ou la quantité, et la date et l'heure souhaitées.`,
    orderNoLink: `Avec plaisir. Répondez en indiquant ce que vous voulez, la taille ou la quantité, et la date et l'heure souhaitées, et nous confirmerons.`,
    handover: (b: string) => `Merci de votre message. Une personne de ${b} vous répondra sous peu.`,
  },
}

const OPT_OUT_CHANNELS: CsChannel[] = ['sms', 'wechat', 'whatsapp']

function matchPrices(text: string, k: Knowledge) {
  const all = k.prices ?? []
  const t = text.toLowerCase()
  const hits = all.filter(p => t.includes(p.item.toLowerCase()))
  return hits.length ? hits : all.slice(0, 3)
}

export function matchFaq(text: string, k: Knowledge) {
  const t = text.toLowerCase()
  // English keywords match whole words ("bi" must not match "ambition"); Chinese has no spaces, so it matches anywhere.
  const hit = (w: string) => {
    const kw = w.toLowerCase()
    if (/[一-鿿]/.test(kw)) return t.includes(kw)
    return new RegExp(`(^|[^a-z0-9])${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9])`).test(t)
  }
  return k.faqs?.find(f => f.keywords.some(hit))?.answer
}

export function handleMessage(m: CsMessage): CsResult {
  const intent = classify(m.text)
  const language = m.language ?? detectLanguage(m.text)
  const t = T[language]
  const b = m.business
  const k = m.knowledge
  let reply: string
  let answeredByAi = true
  let generic = false
  let handover: { action: ActionType; to: 'owner' | 'zhi_li'; withinHours: number; note: string } | null = null
  const toPerson = (action: ActionType, to: 'owner' | 'zhi_li', withinHours: number, note: string) => {
    answeredByAi = false
    handover = { action, to, withinHours, note: `${note}\nCustomer wrote (${m.channel}): "${m.text}"` }
  }

  switch (intent) {
    case 'opt_out':
      return { intent, stage: STAGE[intent], language, reply: t.stopped(b), replyDecision: decide({ type: 'cs_instant_reply' }, m.policy), answeredByAi: true, generic: false, handover: null, optOut: true }
    case 'critical':
      reply = t.critical(b)
      toPerson('cs_critical', 'owner', 1, 'SAFETY OR LEGAL: call the customer now. Do not admit fault or offer money in writing before the owner decides.')
      break
    case 'complaint':
      reply = t.complaint(b)
      toPerson('cs_complaint_reply', 'zhi_li', 4, 'Complaint: owner confirms the facts; Zhi Li approves the drafted reply. Any refund or credit is a separate owner decision.')
      break
    case 'fault': {
      const faq = matchFaq(m.text, k)
      reply = faq ? `${faq}\n${t.fault(b)}` : t.fault(b)
      toPerson('cs_support_reply', 'zhi_li', 24, 'Fault: check the order and the photo; repair, replace or refund under the consumer guarantees as the owner decides.')
      break
    }
    case 'refund_return':
      reply = k.returnsPolicy ? `${t.refund(b)}\n${t.policy(k.returnsPolicy)}` : t.refund(b)
      toPerson('cs_refund', 'owner', 24, 'Refund or return: the owner decides (with Zhi Li) — remedies under the Australian Consumer Law cannot be refused for a major failure.')
      break
    case 'cancel':
      reply = t.cancel(b)
      toPerson('cs_support_reply', 'owner', 4, 'Cancellation: confirm it and any fee under the client\'s published terms.')
      break
    case 'order_status':
      reply = t.status(b)
      toPerson('cs_support_reply', 'owner', 2, 'Order status: staff check and reply with the update.')
      break
    case 'how_to': {
      const faq = matchFaq(m.text, k)
      if (faq) reply = faq
      else { reply = t.handover(b); generic = true; toPerson('cs_support_reply', 'zhi_li', 24, 'How-to question with no approved answer: draft one and add it to the FAQs.') }
      break
    }
    case 'reorder':
      reply = t.reorder(k.orderLink ?? k.bookingLink)
      break
    case 'thanks':
      reply = t.thanks(b, k.reviewLink)
      break
    case 'hours_location': {
      const parts = [k.hours && t.hours(k.hours), k.address && t.address(k.address)].filter(Boolean)
      if (parts.length) reply = parts.join('\n')
      else { reply = t.handover(b); toPerson('cs_support_reply', 'zhi_li', 4, 'Hours or address missing from the approved facts: add them.') }
      break
    }
    case 'price': {
      const hits = matchPrices(m.text, k)
      if (hits.length) reply = t.price(hits.map(p => `- ${p.item}${language === 'fr' ? ' : ' : ': '}${p.price}`).join('\n')) + (k.orderLink ? `\n${t.order(k.orderLink)}` : '')
      else { reply = t.priceUnknown(b); toPerson('cs_support_reply', 'owner', 4, 'Price question with no published price: the owner quotes.') }
      break
    }
    case 'booking':
      if (k.bookingLink) reply = t.booking(k.bookingLink)
      else { reply = t.handover(b); toPerson('cs_support_reply', 'owner', 2, 'Booking request: confirm a time with the customer.') }
      break
    case 'order':
      if (k.professional) {
        const faq = matchFaq(m.text, k)
        if (faq) reply = faq
        else { reply = k.enquiryFallback ?? t.handover(b); generic = true }
      } else reply = k.orderLink ? t.order(k.orderLink) : t.orderNoLink
      break
    default: { // enquiry
      const faq = matchFaq(m.text, k)
      if (faq) reply = faq
      else if (k.enquiryFallback) { reply = k.enquiryFallback; generic = true }
      else if (language === 'fr') { reply = t.handover(b); generic = true }
      else reply = firstReply({ business: b, trade: m.trade, channel: m.channel === 'wechat' ? 'wechat' : m.channel === 'email' ? 'email' : 'sms', language, bookingLink: k.bookingLink })
        .split('\n').filter(l => !l.startsWith('(') && !l.startsWith('（') && !/STOP|退订/.test(l)).join('\n')
    }
  }

  let smsFollowUp: string | undefined
  if (m.channel === 'phone') {
    // Spoken: disclose first, say links instead of reading them, text them after the call.
    // A URL ends at whitespace or Chinese punctuation (Chinese text has no spaces); trailing . , ; : are not part of it.
    const URL_RE = /https?:\/\/[^\s。，、；：！？（）()]+?(?=[.,;:!?]?(?:[\s。，、；：！？（）()]|$))/g
    const links = reply.match(URL_RE) ?? []
    reply = reply.replace(URL_RE, language === 'zh' ? '（链接稍后发短信给您）' : language === 'fr' ? '(je vous envoie le lien par texto)' : '(I\'ll text you the link)')
    reply = language === 'zh' ? reply.replace(/回复/g, '告诉我')
      : language === 'fr' ? reply.replace(/Répondez en indiquant/g, 'Dites-moi').replace(/répondez en indiquant/g, 'dites-moi')
      : reply.replace(/\b[Pp]lease reply with\b/g, 'Please tell me').replace(/\b[Rr]eply with\b/g, 'tell me')
    if (m.firstContact !== false) reply = `${t.voiceDisclosure(b)}\n${reply}`
    if (links.length) smsFollowUp = `${b}: ${links.join(' ')}`
  } else {
    if (m.firstContact !== false) reply += `\n${t.disclosure(b)}`
    if (m.firstContact !== false && OPT_OUT_CHANNELS.includes(m.channel)) reply += `\n${t.optOut}`
  }

  const ho = handover as { action: ActionType; to: 'owner' | 'zhi_li'; withinHours: number; note: string } | null
  return {
    intent,
    stage: STAGE[intent],
    language,
    reply,
    replyDecision: decide({ type: 'cs_instant_reply' }, m.policy),
    answeredByAi,
    generic,
    handover: ho ? { ...ho, decision: decide({ type: ho.action }, m.policy) } : null,
    optOut: false,
    smsFollowUp,
  }
}

// ---------------------------------------------------------------- aftersales

export type PurchaseKind = 'food' | 'service' | 'product'

export interface AftersalesInput {
  purchaseDate: string // YYYY-MM-DD
  kind: PurchaseKind
  repeatEveryDays?: number // usual gap between purchases (e.g. 14 for mowing, 30 for a cake)
  marketingConsent: boolean // customer agreed to offers (Spam Act 2003)
  hasReviewLink: boolean
}

export interface Touch {
  date: string
  type: 'thank_you' | 'check_in' | 'review_request' | 'care_tip' | 'reorder_reminder' | 'win_back'
  marketing: boolean // needs consent and an opt-out
  purpose: string
  action: ActionType
}

const addDays = (date: string, n: number) => {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/**
 * The keep-customers journey after a purchase. Service messages (thank-you,
 * check-in, review request, care tip) go to every customer; marketing
 * (reorder reminders, win-back) only with consent. An unhappy reply to the
 * check-in goes through handleMessage, so problems are fixed before they
 * become bad reviews — but the review request still goes to everyone.
 */
export function aftersalesPlan(a: AftersalesInput): Touch[] {
  const checkInDay = a.kind === 'food' ? 1 : a.kind === 'service' ? 1 : 3
  const touches: Touch[] = [
    { date: a.purchaseDate, type: 'thank_you', marketing: false, purpose: 'Thank them and say how to get help', action: 'cs_instant_reply' },
    { date: addDays(a.purchaseDate, checkInDay), type: 'check_in', marketing: false, purpose: 'Ask if everything was right; any problem goes to a person', action: 'cs_instant_reply' },
  ]
  if (a.hasReviewLink) {
    touches.push({ date: addDays(a.purchaseDate, checkInDay + 2), type: 'review_request', marketing: false, purpose: 'Invite an honest Google review (sent to every customer, never filtered)', action: 'loyalty_message' })
  }
  if (a.kind === 'product') {
    touches.push({ date: addDays(a.purchaseDate, 7), type: 'care_tip', marketing: false, purpose: 'How to use or look after it, from the approved FAQs', action: 'cs_instant_reply' })
  }
  if (a.marketingConsent && a.repeatEveryDays) {
    touches.push({ date: addDays(a.purchaseDate, Math.max(2, a.repeatEveryDays - 3)), type: 'reorder_reminder', marketing: true, purpose: 'Remind them before they usually buy again', action: 'loyalty_message' })
    touches.push({ date: addDays(a.purchaseDate, a.repeatEveryDays * 2), type: 'win_back', marketing: true, purpose: 'If they have not come back: a friendly note (any offer needs the owner\'s OK)', action: 'loyalty_message' })
  }
  return touches.sort((x, y) => x.date.localeCompare(y.date))
}

// ---------------------------------------------------------------- measures

export interface CsLog {
  intent: CsIntent
  firstReplySeconds: number
  answeredByAi: boolean
  handoverHours?: number // time a person took, if handed over
  handoverWithinHours?: number // the deadline it had
}

/** Monthly customer-service measures for the report. */
export function csMeasures(logs: CsLog[]) {
  const n = logs.length || 1
  const presale = logs.filter(l => STAGE[l.intent] !== 'aftersales')
  const handed = logs.filter(l => !l.answeredByAi && l.handoverHours !== undefined)
  return {
    conversations: logs.length,
    presale: presale.length,
    aftersales: logs.length - presale.length,
    within60s: Math.round((logs.filter(l => l.firstReplySeconds <= 60).length / n) * 100) / 100,
    answeredByAi: Math.round((logs.filter(l => l.answeredByAi).length / n) * 100) / 100,
    handoversOnTime: handed.length ? Math.round((handed.filter(l => l.handoverHours! <= (l.handoverWithinHours ?? 24)).length / handed.length) * 100) / 100 : 1,
    complaints: logs.filter(l => l.intent === 'complaint' || l.intent === 'critical').length,
  }
}
