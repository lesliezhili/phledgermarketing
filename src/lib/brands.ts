// PhLedger's own brands — marketed with the same engine as clients
// ("PhLedger is its own first client").
//
// PhLedger Marketing  (this site)   — marketing automation for small businesses
// PhLedger Consulting (phledger.com) — data, BI and AI delivered the
//   forward-deployed-engineer (FDE) way: an engineer works inside the
//   client's business and ships something working in weeks.
//
// The two brands link to each other: marketing clients who outgrow
// spreadsheets are consulting leads, and consulting proves the automation
// behind the marketing. Edit the consulting details to match phledger.com.

import type { ApprovalPolicy } from './approvals'

export type SocialChannel = 'linkedin' | 'google' | 'facebook' | 'instagram' | 'x' | 'rednote' | 'wechat'

export interface Brand {
  id: 'phledger-marketing' | 'phledger-consulting'
  name: string
  site: string
  tagline: string
  audience: string[]
  pillars: string[] // content themes, rotated through the week
  channels: SocialChannel[] // most important first
  pilotOffer: { name: string; what: string; price: string; cta: string }
  crossLink: { to: Brand['id']; when: string }
  approvals: ApprovalPolicy
}

export const BRANDS: Record<Brand['id'], Brand> = {
  'phledger-marketing': {
    id: 'phledger-marketing',
    name: 'PhLedger Marketing',
    site: 'https://phledger.com/marketing', // [confirm the marketing site's live URL]
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
    name: 'PhLedger Consulting',
    site: 'https://phledger.com',
    tagline: 'Data, BI and AI that ship in weeks — a forward-deployed engineer inside your business.',
    audience: ['Small and mid-sized businesses running on spreadsheets', 'Finance and operations leaders', 'Non-profits and churches', 'Aged care and community services'],
    pillars: [
      'FDE approach: embedded, shipping, measured',
      'From spreadsheet to dashboard (BI)',
      'Practical AI agents and automation',
      'Case notes and lessons from real builds',
      'Data quality, governance and trust',
    ],
    channels: ['linkedin', 'google', 'facebook', 'instagram', 'x', 'wechat'],
    pilotOffer: {
      name: 'FDE Data & AI Pilot',
      what: 'A free 60-minute data health check, then a 2-week embedded sprint that ships one dashboard or one AI automation into production',
      price: '[Set the sprint price on phledger.com]',
      cta: 'Book a free data health check',
    },
    crossLink: { to: 'phledger-marketing', when: 'A consulting client wants more leads, reviews or social media handled' },
    approvals: { mode: 'zhi_li' },
  },
}

/** Tagged link so every visit is attributed to the channel and campaign. */
export function trackedLink(brand: Brand, channel: SocialChannel, campaign: string, path = ''): string {
  const url = new URL(path || '/', brand.site.endsWith('/') ? brand.site : brand.site + '/')
  url.searchParams.set('utm_source', channel)
  url.searchParams.set('utm_medium', 'social')
  url.searchParams.set('utm_campaign', campaign)
  return url.toString()
}
