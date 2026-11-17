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
  | 'hipages'
  | 'airtasker'
  | 'bark'
  | 'serviceseeking'
  | 'franchise_hq' // e.g. Jim's Group head-office lead
  | 'unknown'

/** Sources PhLedger creates. Only these can be charged per lead. */
export const CHARGEABLE_SOURCES: LeadSource[] = ['tracked_number', 'tracked_form', 'meta_lead_form', 'our_listing']

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

/** Target time for the first reply. */
export const REPLY_TARGET_SECONDS = 60

export interface FirstReplyInput {
  business: string // client's business name
  trade?: Trade
  channel: 'sms' | 'email' | 'messenger'
  missedCall?: boolean
  bookingLink?: string // where the customer can pick a quote time
}

/** Compose the instant first reply. Plain, honest, short enough for one SMS screen. */
export function firstReply(input: FirstReplyInput): string {
  const trade = input.trade ?? 'general'
  const opener = input.missedCall
    ? `Hi, sorry we missed your call to ${input.business} — we're probably on a job.`
    : `Hi, thanks for contacting ${input.business}.`
  const questions = QUALIFYING_QUESTIONS[trade].map((q, i) => `${i + 1}. ${q}`).join('\n')
  const photo = trade === 'general' ? '' : '\nA photo helps us quote faster.'
  const booking = input.bookingLink ? `\nOr pick a quote time: ${input.bookingLink}` : ''
  const disclosure = `\n(This is ${input.business}'s automated assistant; the owner will follow up personally.)`
  const optOut = input.channel === 'sms' ? '\nReply STOP to opt out.' : ''
  return `${opener} So we can quote, please reply with:\n${questions}${photo}${booking}${disclosure}${optOut}`
}

/** Seconds between the lead arriving and the first reply. */
export function replySeconds(receivedAt: string, repliedAt: string): number {
  return Math.max(0, (Date.parse(repliedAt) - Date.parse(receivedAt)) / 1000)
}

export const metReplyTarget = (receivedAt: string, repliedAt: string) =>
  replySeconds(receivedAt, repliedAt) <= REPLY_TARGET_SECONDS
