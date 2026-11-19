// Speed-to-lead: the instant first reply to a new enquiry or missed call.
//
// Owners of mowing, cleaning, tree and other service businesses are on the
// tools and can't answer quickly. Replying within 5 minutes makes a lead far
// more likely to be qualified than replying within an hour, so PhLedger sends
// an immediate, honest automated reply that asks the questions needed to
// quote and offers a time — then the owner takes over.
//
// Rules built in (see the Platform Opportunity Map):
// - the reply says it is an automated assistant (no pretending to be a person)
// - every SMS identifies the business and offers an opt-out (Spam Act 2003)
// - leads from platforms the client already pays (hipages, Airtasker, Bark,
//   ServiceSeeking, franchise head office) are never charged per lead

export type LeadSource =
  | 'tracked_number' // client's tracked phone number (our Google profile, ads, flyers)
  | 'tracked_form' // enquiry form or email on our tracked page
  | 'meta_lead_form' // Meta instant lead form from ads we run
  | 'our_listing' // Gumtree / Marketplace / Nextdoor listing we wrote, tracked
  | 'wechat_account' // client's WeChat Official Account / WeCom contact that we set up and track
  | 'hipages'
  | 'airtasker'
  | 'bark'
  | 'serviceseeking'
  | 'franchise_hq' // e.g. Jim's Group head-office lead
  | 'unknown'

/** Sources PhLedger creates. Only these can be charged per lead. */
export const CHARGEABLE_SOURCES: LeadSource[] = ['tracked_number', 'tracked_form', 'meta_lead_form', 'our_listing', 'wechat_account']

/** Sources the client already pays another platform for. Never charged per lead. */
export const PLATFORM_SOURCES: LeadSource[] = ['hipages', 'airtasker', 'bark', 'serviceseeking', 'franchise_hq']

export const isChargeableSource = (source: LeadSource | undefined) =>
  !!source && CHARGEABLE_SOURCES.includes(source)

export type Trade = 'mowing' | 'cleaning' | 'tree' | 'gardening' | 'general'

/** The questions an owner needs answered before they can quote. */
export const QUALIFYING_QUESTIONS: Record<Trade, string[]> = {
  mowing: ['What suburb is the property in?', 'Front, back or both yards — and roughly how big?', 'One-off or regular (weekly, fortnightly)?'],
  cleaning: ['What suburb is the property in?', 'How many bedrooms and bathrooms?', 'Regular clean, one-off, or end-of-lease?'],
  tree: ['What suburb is the property in?', 'How many trees, and roughly how tall?', 'Is it urgent (storm damage or a risk to people or buildings)?'],
  gardening: ['What suburb is the property in?', 'What needs doing — hedges, weeding, clean-up, planting?', 'One-off or regular?'],
  general: ['What suburb are you in?', 'What do you need done?', 'When would you like it done?'],
}

/** The same questions in Simplified Chinese, for WeChat and Chinese-speaking customers. */
export const QUALIFYING_QUESTIONS_ZH: Record<Trade, string[]> = {
  mowing: ['房子在哪个区（suburb）？', '前院、后院还是都要？大概多大面积？', '一次性还是定期（每周、每两周）？'],
  cleaning: ['房子在哪个区（suburb）？', '几个卧室、几个卫生间？', '定期清洁、一次性清洁，还是退租清洁？'],
  tree: ['房子在哪个区（suburb）？', '几棵树？大概多高？', '紧急吗（风暴损坏，或危及人员、房屋安全）？'],
  gardening: ['房子在哪个区（suburb）？', '需要做什么——修剪树篱、除草、清理还是种植？', '一次性还是定期？'],
  general: ['您在哪个区（suburb）？', '需要做什么？', '希望什么时候做？'],
}

export type ReplyLanguage = 'en' | 'zh'
export type ReplyChannel = 'sms' | 'email' | 'messenger' | 'wechat'

/** Channels that need an opt-out line (Spam Act 2003 covers SMS and instant messages). */
const OPT_OUT_CHANNELS: ReplyChannel[] = ['sms', 'wechat']

/** Target time for the first reply. */
export const REPLY_TARGET_SECONDS = 60

export interface FirstReplyInput {
  business: string // client's business name
  trade?: Trade
  channel: ReplyChannel
  language?: ReplyLanguage // defaults to English
  missedCall?: boolean
  bookingLink?: string // where the customer can pick a quote time
}

const TEXT: Record<ReplyLanguage, {
  missed: (b: string) => string
  thanks: (b: string) => string
  ask: string
  photo: string
  booking: (link: string) => string
  disclosure: (b: string) => string
  optOut: string
  questions: Record<Trade, string[]>
}> = {
  en: {
    missed: b => `Hi, sorry we missed your call to ${b} — we're probably on a job.`,
    thanks: b => `Hi, thanks for contacting ${b}.`,
    ask: ' So we can quote, please reply with:',
    photo: 'A photo helps us quote faster.',
    booking: link => `Or pick a quote time: ${link}`,
    disclosure: b => `(This is ${b}'s automated assistant; the owner will follow up personally.)`,
    optOut: 'Reply STOP to opt out.',
    questions: QUALIFYING_QUESTIONS,
  },
  zh: {
    missed: b => `您好，抱歉错过了您打给${b}的电话——我们可能正在干活。`,
    thanks: b => `您好，感谢联系${b}。`,
    ask: '为了给您报价，请回复：',
    photo: '发张照片能帮我们更快报价。',
    booking: link => `也可以直接选择上门报价时间：${link}`,
    disclosure: b => `（这是${b}的自动助理，老板会亲自跟进。）`,
    optOut: '回复“退订”即可停止接收消息。',
    questions: QUALIFYING_QUESTIONS_ZH,
  },
}

/** Compose the instant first reply. Plain, honest, short enough for one phone screen. */
export function firstReply(input: FirstReplyInput): string {
  const trade = input.trade ?? 'general'
  const t = TEXT[input.language ?? 'en']
  const opener = input.missedCall ? t.missed(input.business) : t.thanks(input.business)
  const questions = t.questions[trade].map((q, i) => `${i + 1}. ${q}`).join('\n')
  const lines = [`${opener}${t.ask}`, questions]
  if (trade !== 'general') lines.push(t.photo)
  if (input.bookingLink) lines.push(t.booking(input.bookingLink))
  lines.push(t.disclosure(input.business))
  if (OPT_OUT_CHANNELS.includes(input.channel)) lines.push(t.optOut)
  return lines.join('\n')
}

/** Seconds between the lead arriving and the first reply. */
export function replySeconds(receivedAt: string, repliedAt: string): number {
  return Math.max(0, (Date.parse(repliedAt) - Date.parse(receivedAt)) / 1000)
}

export const metReplyTarget = (receivedAt: string, repliedAt: string) =>
  replySeconds(receivedAt, repliedAt) <= REPLY_TARGET_SECONDS
