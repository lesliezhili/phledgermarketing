// Business-agnostic marketing catalogue.
//
// PhLedger Marketing sells one method to any business, whatever it sells.
// Channels (LinkedIn, Instagram, ...) are interchangeable tools chosen per
// client; services describe outcomes, not a single platform. Pages read from
// here so a new channel, business type or service is added in one place.

export type Tier = 'Grace' | 'Faithful' | 'Abundant'

export interface Channel {
  id: string
  name: string
  icon: string
  desc: string
  href: string
  color: string
}

export const channels: Channel[] = [
  { id: 'google', name: 'Google Maps & Search', icon: '📍', desc: 'Local search, reviews, business profile, foot traffic', href: '/google-maps', color: 'from-green-500 to-emerald-700' },
  { id: 'instagram', name: 'Instagram', icon: '📸', desc: 'Visual storytelling, reels, community building', href: '/instagram', color: 'from-purple-500 to-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: '👥', desc: 'Community groups, ads, marketplace, events', href: '/facebook', color: 'from-blue-500 to-indigo-600' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', desc: 'B2B leads, corporate clients, thought leadership', href: '/linkedin', color: 'from-blue-600 to-blue-800' },
  { id: 'x', name: 'X (Twitter)', icon: '𝕏', desc: 'Real-time engagement, threads, announcements', href: '/x-twitter', color: 'from-gray-700 to-black' },
]

export interface BusinessType {
  id: string
  name: string
  icon: string
  examples: string
  channels: string[] // channel ids, most important first
}

export const businessTypes: BusinessType[] = [
  { id: 'local', name: 'Local shop or venue', icon: '🏪', examples: 'Cafés, bakeries, salons, gyms, restaurants', channels: ['google', 'instagram', 'facebook'] },
  { id: 'online', name: 'Online product', icon: '🛒', examples: 'E-commerce, apps, courses, digital goods', channels: ['instagram', 'facebook', 'google'] },
  { id: 'b2b', name: 'Service to businesses', icon: '🏢', examples: 'Consulting, IT, accounting, trades, catering', channels: ['linkedin', 'google', 'x'] },
  { id: 'personal', name: 'Service to people', icon: '🤝', examples: 'Health, tutoring, care, coaching, home services', channels: ['google', 'facebook', 'instagram'] },
  { id: 'nonprofit', name: 'Church or non-profit', icon: '⛪', examples: 'Churches, charities, community groups', channels: ['facebook', 'instagram', 'google'] },
]

// ---------------------------------------------------------------------------
// Pricing — one price list for every client (AUD, excl. GST).
// Matches the PhLedger Marketing client proposal template.
// ---------------------------------------------------------------------------

export const SETUP_FEE = 490
export const MIN_MONTHS = 3

export interface Package {
  tier: Tier
  id: 'grace' | 'faithful' | 'abundant' // matches dm_profiles.plan
  price: number // per month
  channels: number
  desc: string
  features: string[]
  popular?: boolean
}

export const packages: Package[] = [
  {
    tier: 'Grace', id: 'grace', price: 149, channels: 2,
    desc: 'Stay visible on a tight budget.',
    features: ['2 channels run for you', '8 posts a month', 'Google Business Profile posts and review requests', 'Monthly one-page report', 'PhLedgerTax invoicing'],
  },
  {
    tier: 'Faithful', id: 'faithful', price: 349, channels: 3, popular: true,
    desc: 'Everything most businesses need to grow.',
    features: ['Everything in Grace', '3 channels run for you', '12 posts + 12 short videos a month', 'Paid ads managed (Meta, Google, LinkedIn or TikTok)', 'Customer loyalty program: birthday and repeat-customer emails', '20 outreach contacts a month', 'Monthly report + call'],
  },
  {
    tier: 'Abundant', id: 'abundant', price: 799, channels: 4,
    desc: 'Full-service marketing for fast growth.',
    features: ['Everything in Faithful', '4 channels run for you', 'Creator and partner program', '40 outreach contacts a month', 'LinkedIn / B2B campaign', 'Weekly report + monthly strategy call'],
  },
]

export const packageFor = (tier: Tier) => packages.find(p => p.tier === tier)

// Ways to commit. Longer commitments are rewarded so good clients stay.
export interface Commitment {
  id: string
  name: string
  months: number // months paid up front
  setupWaived: boolean
  discount: number // fraction off the monthly fee
  note: string
}

export const commitments: Commitment[] = [
  { id: 'monthly', name: 'Monthly', months: 1, setupWaived: false, discount: 0, note: MIN_MONTHS + "-month minimum, then cancel with 30 days' notice" },
  { id: '6m', name: '6 months up front', months: 6, setupWaived: true, discount: 0, note: 'Setup fee ($' + SETUP_FEE + ') waived' },
  { id: '12m', name: '12 months up front', months: 12, setupWaived: true, discount: 0.1, note: 'Setup fee waived + 10% off every month' },
]

// Rewards for staying and for sending friends.
export const loyaltyPerks = [
  { icon: '🔒', name: 'Price lock', desc: 'Your monthly price never goes up while you stay with us.' },
  { icon: '🎁', name: 'Loyalty discount', desc: '5% off from month 7 and 10% off from month 13, automatically. If you prepay, the bigger discount applies.' },
  { icon: '🤝', name: 'Refer a business', desc: 'You and the business you refer each get one month free, once they have paid their first month.' },
  { icon: '🩺', name: 'Free health check, any time', desc: 'A free marketing review for any business, with no obligation to buy.' },
  { icon: '📂', name: 'You own everything', desc: 'Accounts, photos, designs and customer lists stay yours if you leave.' },
  { icon: '↕️', name: 'Change package any month', desc: 'Move up or down a package from your next billing month.' },
]

// What a client pays today for a package and commitment.
export function quotePackage(tier: Tier | 'Free', commitmentId = 'monthly') {
  const pkg = tier === 'Free' ? undefined : packageFor(tier)
  const c = commitments.find(x => x.id === commitmentId) ?? commitments[0]
  if (!pkg) return { monthly: 0, months: 0, fees: 0, setup: 0, dueToday: 0, discount: 0 }
  const monthly = pkg.price * (1 - c.discount)
  const fees = monthly * c.months
  const setup = c.setupWaived ? 0 : SETUP_FEE
  return { monthly, months: c.months, fees, setup, dueToday: fees + setup, discount: c.discount }
}

// ---------------------------------------------------------------------------
// Pay as you go = pay per lead — for tiny businesses (see TINY_BUSINESS).
//
// The client pays only when a new customer reaches the business: an email,
// form or message, or a phone call. A lead is charged when it arrives,
// whether or not it turns into a sale. A small start-up fee and monthly minimum (PPL below) keep it profitable; no
// contract. Billing rules live in src/lib/leads.ts.
// ---------------------------------------------------------------------------

export type LeadType = 'enquiry' | 'call' | 'business'

export interface LeadPrice {
  type: LeadType
  name: string
  desc: string
  price: number // per lead, AUD excl. GST
  icon: string
}

export const leadPrices: LeadPrice[] = [
  { type: 'enquiry', name: 'Online enquiry', desc: 'An email, website form or social media message from a new customer asking to buy or book.', price: 15, icon: '✉️' },
  { type: 'call', name: 'Phone call', desc: 'A call from a new customer to your tracked number that lasts 60 seconds or more.', price: 25, icon: '📞' },
  { type: 'business', name: 'Business enquiry', desc: 'An email or call from a company: corporate orders, functions, contracts, wholesale.', price: 40, icon: '🏢' },
]

export const leadPriceFor = (type: LeadType) => leadPrices.find(l => l.type === type)!.price

export const LEAD_RULES = {
  minCallSeconds: 60, // shorter calls are not charged
  duplicateDays: 30, // the same person again within 30 days is not charged
  freeLeads: 0, // no free leads: every lead we deliver costs us time and SMS (see economics.ts)
  disputeDays: 7, // a lead can be disputed within 7 days
  defaultMonthlyCap: 300, // the client never pays more than their cap in a month
}

// Pay per lead is for TINY businesses only. Australia has no official
// "tiny" or "micro" label, so we use the ATO's lowest business-size
// threshold: aggregated annual turnover under $2 million — the test for a
// CGT small business entity. Aggregated turnover = the business's gross
// annual turnover plus that of its affiliates and connected entities.
// (ATO: under $10M is a small business entity; ASIC's small proprietary
// company test is far broader, so neither fits "tiny".)
export const TINY_BUSINESS = {
  maxAggregatedTurnover: 2_000_000,
  label: 'aggregated annual turnover under $2 million',
  source: 'ATO aggregated turnover test, as used for CGT small business entities',
  url: 'https://www.ato.gov.au/businesses-and-organisations/income-deductions-and-concessions/incentives-and-concessions/small-business-cgt-concessions/small-business-cgt-concessions-eligibility-conditions/cgt-small-business-entity-eligibility',
}

export const turnoverBands = [
  { id: 'under2m', name: 'Under $2 million', max: 2_000_000 },
  { id: '2to10m', name: '$2 million to under $10 million', max: 10_000_000 },
  { id: '10mplus', name: '$10 million or more', max: Infinity },
] as const

export type TurnoverBand = (typeof turnoverBands)[number]['id']

/** Only tiny businesses (ATO aggregated turnover under $2M) can pay per lead. */
export const isPayPerLeadEligible = (band: TurnoverBand | '' | undefined) => band === 'under2m'

// Booking id for the pay-per-lead option (services use 1–11).
export const PAY_PER_LEAD_ID = 100
export const PAYG_CREDIT_DAYS = 60

// Pay-per-lead terms that keep every client profitable from day one
// (proved in tests/economics.spec.ts):
// - a one-off start-up fee covers setting up the tracked number, form,
//   Google profile and speed-to-lead replies
// - a small monthly minimum covers the tracked number and automated work
//   even in a month with no leads; it counts toward leads, so a client with
//   enough leads pays nothing extra
// - the credit toward a package setup fee is capped so upgrades stay profitable
export const PPL = {
  startupFee: 149,
  monthlyMinimum: 39,
  upgradeCreditMax: 150,
}

// Several stores under one owner: the first store takes a package; each
// extra store gets its own Google Business Profile, tracked number and
// local posts, reusing the first store's content and offers.
export const MULTI_STORE = {
  extraStoreMonthly: 99,
  extraStoreSetup: 190,
}

export const leadNotCharged = [
  'Spam, sales pitches, job seekers and wrong numbers',
  `Calls under ${LEAD_RULES.minCallSeconds} seconds and missed calls with no message`,
  `The same person contacting you again within ${LEAD_RULES.duplicateDays} days`,
  'Your existing customers',
  'Leads you already pay another platform for (hipages, Airtasker, Bark, ServiceSeeking, franchise head office)',
  'Leads that did not come through your tracked number, form, listing or WeChat account',
  `Any lead you dispute within ${LEAD_RULES.disputeDays} days that we can't show was genuine`,
]

export const paygPerks = [
  `For tiny businesses only: ${TINY_BUSINESS.label} (ATO), including connected businesses.`,
  `One-off start-up fee $${PPL.startupFee}: your tracked number, enquiry form, Google profile tune-up and instant replies.`,
  `Minimum $${PPL.monthlyMinimum} a month, which counts toward your leads. No contract — stop any time.`,
  `Set a monthly cap (default $${LEAD_RULES.defaultMonthlyCap}). You never pay more than your cap.`,
  `Move to a package within ${PAYG_CREDIT_DAYS} days and up to $${PPL.upgradeCreditMax} of your lead spend comes off the $${SETUP_FEE} setup fee.`,
  'Ad spend is optional, paid by you at cost, and only if you choose to run ads.',
]

export interface Service {
  id: number
  name: string
  desc: string
  tier: Tier | 'Free' // the cheapest package that includes it
  icon: string
}

// Ids are stable: /booking?service=<id> links depend on them.
export const services: Service[] = [
  { id: 1, name: 'Marketing Health Check', desc: 'A review of your offer, prices, profiles and print, with a fix list. Works for any business.', tier: 'Free', icon: '🩺' },
  { id: 2, name: 'Offer & Brand Messaging', desc: 'One clear offer, one price, one call to action, used on every channel.', tier: 'Grace', icon: '🎯' },
  { id: 3, name: 'Content Strategy & Calendar', desc: '30-day content plan for the channels that fit your business.', tier: 'Grace', icon: '📝' },
  { id: 4, name: 'Social Media Management', desc: 'Posts, short videos and replies on 2–4 channels, scheduled and tracked.', tier: 'Grace', icon: '📱' },
  { id: 5, name: 'Local & Google Visibility', desc: 'Google Business Profile, reviews and local search for walk-in and nearby customers.', tier: 'Grace', icon: '📍' },
  { id: 6, name: 'Paid Ads Management', desc: 'Ethical ad campaigns on Meta, Google, LinkedIn or TikTok — whichever reaches your buyers.', tier: 'Faithful', icon: '🚀' },
  { id: 7, name: 'Outreach & Partnerships', desc: 'Direct outreach to businesses, creators and community partners who can send you customers.', tier: 'Faithful', icon: '🤝' },
  { id: 8, name: 'Analytics & Reporting', desc: 'Monthly results against break-even: what sold, which channel, what to change.', tier: 'Grace', icon: '📊' },
  { id: 9, name: 'Customer Loyalty Program', desc: 'Birthday offers, repeat-customer emails and review requests that bring your customers back.', tier: 'Faithful', icon: '💌' },
  { id: 11, name: 'AI Speed-to-Lead Replies', desc: 'Every enquiry and missed call gets an honest automated reply within a minute — by SMS, email or WeChat, in English or Chinese — that asks the questions you need to quote — while you stay on the job. Works for leads from hipages, Airtasker, Bark and franchise head office too.', tier: 'Grace', icon: '⚡' },
  { id: 10, name: 'Creator & B2B Campaigns', desc: 'Creator partnerships and LinkedIn campaigns to win bigger and corporate customers.', tier: 'Abundant', icon: '👑' },
]

export function serviceLabel(s: Service) {
  if (s.tier === 'Free') return 'Free'
  return s.tier + ' · $' + packageFor(s.tier)!.price + '/mo'
}

export const adPlatforms = [
  { id: 'none', name: 'No paid ads' },
  { id: 'meta', name: 'Meta (Facebook & Instagram)' },
  { id: 'google', name: 'Google Search & Maps' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'tiktok', name: 'TikTok' },
]

// The same 5-step, 90-day method for every client.
export const methodSteps = [
  { name: 'Diagnose', when: 'Week 0', desc: 'Intake call: offers, prices, margins, capacity, baselines.' },
  { name: 'Fix the basics', when: 'Weeks 1–2', desc: 'Clear offer and price, one page to buy or enquire, QR codes and tracking.' },
  { name: 'Launch push', when: 'Weeks 3–6', desc: 'Content, ads and outreach on 2–4 channels, timed to your next busy period.' },
  { name: 'Grow and retain', when: 'Weeks 7–13', desc: 'Reviews, repeat-customer emails, partners; budget moves to what sells.' },
  { name: 'Report and decide', when: 'Day 90', desc: 'Results against break-even: renew, upgrade or stop.' },
]
