// PhLedger's own brands — marketed with the same engine as clients
// ("PhLedger is its own first client").
//
// PhLedger Marketing  (this site)   — marketing automation for small businesses
// PHledger (phledger.com, repo lesliezhili/phledger) — Forward Deployed
//   Engineering partner for data, AI and cloud: senior engineers embedded in
//   the client's team who help decide, build test-first and train the team.
//   Prices and wording below follow phledger.com (src/content/*.ts there).
//
// The two brands link to each other: marketing clients who outgrow
// spreadsheets are consulting leads, and consulting proves the automation
// behind the marketing. Keep the consulting details in step with phledger.com.

import type { ApprovalPolicy } from './approvals'
import type { MarketId } from './markets'

export type SocialChannel = 'linkedin' | 'google' | 'facebook' | 'instagram' | 'x' | 'rednote' | 'wechat'

export interface Brand {
  id: 'phledger-marketing' | 'phledger-consulting'
  name: string
  site: string
  tagline: string
  audience: string[]
  pillars: string[] // content themes, rotated through the week
  channels: SocialChannel[] // most important first
  /** Where calls to action land (e.g. the enquiry form). */
  contactPath?: string
  /** Markets marketed together (default: Australia only). */
  markets?: MarketId[]
  /** Landing page per market, when it differs from contactPath. */
  marketPaths?: Partial<Record<MarketId, string>>
  pilotOffer: { name: string; what: string; price: string; cta: string }
  /** Paid steps from first contact to the biggest engagement, as priced on the brand's site. */
  ladder?: { name: string; price: string; path: string }[]
  crossLink: { to: Brand['id']; when: string }
  approvals: ApprovalPolicy
}

export const BRANDS: Record<Brand['id'], Brand> = {
  'phledger-marketing': {
    id: 'phledger-marketing',
    name: 'PhLedger Marketing',
    site: 'https://phledgermarketing.vercel.app', // live deployment (also used by the /geo pages)
    tagline: 'Marketing for any business — pay for results, never miss a lead.',
    audience: ['Local shops, cafés and venues', 'Tradies and home services', 'Chinese-Australian business owners'],
    pillars: ['Speed-to-lead and missed calls', 'Google Maps and reviews', 'Before/after results', 'Honest marketing tips', 'Behind the automation'],
    channels: ['google', 'facebook', 'instagram', 'linkedin', 'rednote', 'wechat'],
    pilotOffer: { name: 'Free Starter Month', what: 'Google profile fixes, free tools, auto-reply templates, 30-day before/after', price: 'Free for the first 100 businesses', cta: 'Book a free health check' },
    crossLink: { to: 'phledger-consulting', when: 'A client needs dashboards, data clean-up or a custom AI workflow' },
    approvals: { mode: 'zhi_li' },
  },
  'phledger-consulting': {
    id: 'phledger-consulting',
    name: 'PHledger',
    site: 'https://phledger.com',
    contactPath: '/#contact', // the brief questionnaire on phledger.com
    markets: ['au', 'ca'],
    marketPaths: { ca: '/canada' }, // Canadian landing page on phledger.com
    tagline: 'Forward-deployed engineers who train your team and ship the platform.',
    audience: [
      'Finance, data and operations leaders in mid-sized organisations',
      'Aged care, NDIS, health and community services',
      'Financial services, government and education',
      'Teams choosing or migrating a cloud or data platform (AWS, Azure, Google Cloud)',
      'Chinese-Australian and go-global businesses (出海)',
    ],
    pillars: [
      'Embedded, not outsourced: train while we build',
      'Foundations first: trusted data before AI',
      'AI recommends, your people decide',
      'Platform-neutral cloud and data decisions',
      'We run on what we build',
    ],
    channels: ['linkedin', 'google', 'facebook', 'instagram', 'x', 'wechat'],
    pilotOffer: {
      name: 'Decision sprint',
      what: 'Two weeks, fixed fee: target architecture, AWS/Azure/Google Cloud compared on your workloads, data management baseline, cost model, risk register and a decision memo your people sign off, plus a pilot plan with the success tests written first',
      price: 'A$18,000 fixed, 2 weeks (ex GST)',
      cta: 'Send PHledger a short brief',
    },
    ladder: [
      { name: 'Brief and first conversation', price: 'Free', path: '/#contact' },
      { name: 'Decision sprint', price: 'A$18,000 fixed, 2 weeks', path: '/cloud#pricing' },
      { name: 'Embedded FDE', price: 'A$26,000 per engineer per month, 3-month minimum', path: '/cloud#pricing' },
      { name: 'Fixed-scope build', price: 'From A$60,000, paid per tested milestone', path: '/cloud#pricing' },
    ],
    crossLink: { to: 'phledger-marketing', when: 'A consulting client wants more leads, reviews or social media handled' },
    approvals: { mode: 'zhi_li' },
  },
}

/** Tagged link so every visit is attributed to the channel and campaign. */
export function trackedLink(brand: Brand, channel: SocialChannel, campaign: string, path?: string, market?: MarketId): string {
  path = path ?? (market && brand.marketPaths?.[market]) ?? brand.contactPath ?? ''
  if (market) campaign = `${campaign}-${market}`
  const url = new URL(path || '/', brand.site.endsWith('/') ? brand.site : brand.site + '/')
  url.searchParams.set('utm_source', channel)
  url.searchParams.set('utm_medium', 'social')
  url.searchParams.set('utm_campaign', campaign)
  return url.toString()
}
