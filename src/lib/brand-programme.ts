// B2B brand programme: a year of brand marketing, automated.
//
// The way established B2B technology firms run brand (an annual content
// strategy, four quarterly campaign themes, thought leadership, events,
// partner marketing with vendor co-funding, PR, and quarterly reporting),
// turned into a plan the agent drafts and Zhi Li approves.
//
//   theme per quarter → planned assets with due dates, owners and approvals
//   → event run-sheets (invite → brief → follow-up → amplify → report)
//   → partner plans and co-funding (MDF) tracking
//   → social posts for the publisher → quarter report → next quarter's plan
//
// PHledger runs it first; B2B clients buy it as the Brand Programme add-on.
// Nothing is published or spent without the approvals in src/lib/approvals.ts.

import { decide, type ActionType, type ApprovalPolicy, type Route } from './approvals'
import type { MarketId } from './markets'
import type { PostIdea } from './social-publisher'
import { COSTS, MIN_MARGIN } from './economics'

export type AssetKind =
  | 'landing_page' | 'linkedin_campaign' | 'blog' | 'flagship' | 'newsletter' | 'case_study'
  | 'webinar' | 'roundtable' | 'executive_dinner' | 'partner_campaign' | 'press_release' | 'quarter_report'

export type Owner = 'ai_draft' | 'subject_expert' | 'zhi_li' | 'partner'

interface AssetSpec {
  name: string
  action: ActionType
  owner: Owner
  hours: number // Zhi Li's time per asset (the agent drafts first)
  week: number[] // week(s) of the 13-week quarter it is due
  checklist?: string[]
}

export const ASSET_SPECS: Record<AssetKind, AssetSpec> = {
  landing_page: { name: 'Campaign landing page', action: 'content_longform', owner: 'ai_draft', hours: 1, week: [1], checklist: ['One message, one call to action', 'Tracked links per channel and market', 'Form or brief link tested'] },
  linkedin_campaign: { name: 'LinkedIn campaign (organic, plus paid if budgeted)', action: 'post_social', owner: 'ai_draft', hours: 1, week: [1] },
  flagship: { name: 'Flagship asset (guide or whitepaper)', action: 'content_longform', owner: 'subject_expert', hours: 3, week: [3], checklist: ['Outline approved by the expert', 'Facts and sources checked', 'No invented numbers or clients', 'Gated or ungated decided'] },
  blog: { name: 'Blog / article', action: 'content_longform', owner: 'ai_draft', hours: 0.5, week: [2, 5, 9, 4, 7, 11] },
  newsletter: { name: 'Newsletter (consented subscribers only)', action: 'loyalty_message', owner: 'ai_draft', hours: 0.25, week: [4, 8, 12] },
  case_study: { name: 'Customer story', action: 'case_study_publish', owner: 'zhi_li', hours: 1.5, week: [6], checklist: ['Customer\'s written permission', 'Results measured, not estimated', 'Customer approves the final text'] },
  webinar: { name: 'Webinar', action: 'content_longform', owner: 'subject_expert', hours: 3, week: [7] },
  partner_campaign: { name: 'Joint partner campaign', action: 'content_longform', owner: 'partner', hours: 1, week: [7], checklist: ['Partner\'s brand rules followed', 'Co-funding approved in writing before spending', 'Proof of performance collected'] },
  roundtable: { name: 'Roundtable (8–12 leaders)', action: 'event_spend', owner: 'zhi_li', hours: 2, week: [10] },
  executive_dinner: { name: 'Executive dinner', action: 'event_spend', owner: 'zhi_li', hours: 3, week: [11] },
  press_release: { name: 'Press release', action: 'press_release', owner: 'zhi_li', hours: 1, week: [3] },
  quarter_report: { name: 'Quarter report and next quarter\'s plan', action: 'content_longform', owner: 'ai_draft', hours: 1, week: [13] },
}

/** How much a programme does each quarter. */
export const TIERS = {
  lean: { name: 'Lean', monthly: 690, mix: { landing_page: 1, linkedin_campaign: 1, flagship: 1, blog: 3, newsletter: 3, webinar: 1, quarter_report: 1 } },
  standard: { name: 'Standard', monthly: 990, mix: { landing_page: 1, linkedin_campaign: 1, flagship: 1, blog: 3, newsletter: 3, case_study: 1, webinar: 1, partner_campaign: 1, roundtable: 1, press_release: 1, quarter_report: 1 } },
  full: { name: 'Full', monthly: 1490, mix: { landing_page: 1, linkedin_campaign: 1, flagship: 1, blog: 6, newsletter: 3, case_study: 1, webinar: 1, partner_campaign: 1, roundtable: 1, executive_dinner: 1, press_release: 1, quarter_report: 1 } },
} satisfies Record<string, { name: string; monthly: number; mix: Partial<Record<AssetKind, number>> }>
export type TierId = keyof typeof TIERS

export const BRAND_PROGRAMME = { setup: 490, setupHours: 6, minMonths: 3 }

export interface QuarterTheme {
  title: string
  narrative: string // the one idea the quarter argues
  flagship: string // title of the flagship asset
  angles: string[] // blog topics, used in order
  webinar: string
  event?: { kind: 'roundtable' | 'executive_dinner'; city: string; topic: string }
  partners?: string[] // partner names joined in this quarter's campaign
  markets?: MarketId[]
  customerStory?: string // only with the customer's written permission
}

export interface Partner {
  name: string
  program: string
  status: 'not_joined' | 'applied' | 'member'
  coFunding: 'unknown' | 'eligible' | 'not_eligible' // MDF: check each program's rules
}

export interface PlannedAsset {
  kind: AssetKind
  title: string
  due: string // YYYY-MM-DD (Monday of the due week)
  owner: Owner
  route: Route
  hours: number
  checklist: string[]
  blocked?: string // why it can't go ahead yet
}

export interface PlannedQuarter {
  index: number // 1–4 in the programme
  start: string
  end: string
  theme: QuarterTheme
  assets: PlannedAsset[]
  hours: number
}

const addDays = (date: string, n: number) => {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
/** The Monday on or after a date. */
const monday = (date: string) => {
  const d = new Date(date + 'T00:00:00Z')
  return addDays(date, (8 - d.getUTCDay()) % 7)
}

function titleFor(kind: AssetKind, theme: QuarterTheme, n: number): string {
  switch (kind) {
    case 'landing_page': return `${theme.title} — campaign page`
    case 'linkedin_campaign': return `${theme.title}: ${theme.narrative}`
    case 'flagship': return theme.flagship
    case 'blog': return theme.angles[n % Math.max(1, theme.angles.length)] ?? `${theme.title} (article ${n + 1})`
    case 'newsletter': return `${theme.title} — newsletter ${n + 1}`
    case 'case_study': return theme.customerStory ?? `Customer story for "${theme.title}" (needs a customer's permission)`
    case 'webinar': return theme.webinar
    case 'partner_campaign': return `${theme.title} with ${(theme.partners ?? ['a partner']).join(' and ')}`
    case 'roundtable':
    case 'executive_dinner': return theme.event ? `${theme.event.topic} (${theme.event.city})` : `${theme.title} roundtable`
    case 'press_release': return `Announcing: ${theme.flagship}`
    case 'quarter_report': return `Report: ${theme.title}, and the plan for next quarter`
  }
}

/** A year (or any number of quarters) of brand marketing, from quarterly themes. */
export function planProgramme(start: string, themes: QuarterTheme[], tier: TierId, policy: ApprovalPolicy, partners: Partner[] = []): PlannedQuarter[] {
  return themes.map((theme, qi) => {
    const qStart = monday(addDays(start, qi * 91))
    const assets: PlannedAsset[] = []
    for (const [kind, count] of Object.entries(TIERS[tier].mix) as [AssetKind, number][]) {
      const spec = ASSET_SPECS[kind]
      for (let n = 0; n < count; n++) {
        const week = spec.week[n % spec.week.length]
        const a: PlannedAsset = {
          kind, title: titleFor(kind, theme, n), due: addDays(qStart, (week - 1) * 7), owner: spec.owner,
          route: decide({ type: spec.action }, policy).route, hours: spec.hours, checklist: spec.checklist ?? [],
        }
        if (kind === 'case_study' && !theme.customerStory) a.blocked = 'No customer has given permission yet: swap for a "how we work" story until one does'
        if (kind === 'partner_campaign') {
          const joined = (theme.partners ?? []).filter(p => partners.find(x => x.name === p)?.status === 'member')
          if (!joined.length) a.blocked = 'Join the partner program first; co-funding needs membership'
        }
        assets.push(a)
      }
    }
    if (theme.event?.kind === 'executive_dinner' && !('executive_dinner' in TIERS[tier].mix)) {
      // the theme asks for a dinner but the tier only has a roundtable slot: run it as the roundtable
      const r = assets.find(a => a.kind === 'roundtable')
      if (r) r.title = titleFor('executive_dinner', theme, 0)
    }
    assets.sort((a, b) => a.due.localeCompare(b.due) || a.kind.localeCompare(b.kind))
    return { index: qi + 1, start: qStart, end: addDays(qStart, 90), theme, assets, hours: assets.reduce((s, a) => s + a.hours, 0) }
  })
}

// ---------------------------------------------------------------- events

export interface RunSheetStep { due: string; step: string; action?: ActionType; route?: Route }

/** From approval to amplification, so every event keeps working after the room empties. */
export function eventRunSheet(eventDate: string, kind: 'webinar' | 'roundtable' | 'executive_dinner', policy: ApprovalPolicy): RunSheetStep[] {
  const inPerson = kind !== 'webinar'
  const steps: [number, string, ActionType?][] = [
    [-42, inPerson ? 'Approve budget: venue, catering, any sponsorship' : 'Confirm platform, speakers and topic', inPerson ? 'event_spend' : undefined],
    [-35, 'Landing page and registration form live; invitations to consented contacts and LinkedIn', 'content_longform'],
    [-21, 'Reminder to invitees; speakers\' LinkedIn posts', 'post_social'],
    [-14, 'Briefing pack to speakers and hosts: who is coming, the questions, the one message'],
    [-7, inPerson ? 'Final numbers to venue; dietary needs; seating plan' : 'Tech rehearsal; recording on'],
    [-1, 'Reminder to registrants with joining details'],
    [1, 'Thank-you to attendees with the recording or summary; "sorry we missed you" to no-shows', 'loyalty_message'],
    [7, 'Follow-up to attendees who asked for it: brief or a call', 'loyalty_message'],
    [14, 'Amplify: recap article, short clips, quotes (speakers approve their quotes)', 'content_longform'],
    [30, 'Event report: registrations, attendance rate, leads, pipeline, cost per attendee'],
  ]
  return steps.map(([offset, step, action]) => ({ due: addDays(eventDate, offset), step, action, route: action ? decide({ type: action }, policy).route : undefined }))
}

// ---------------------------------------------------------------- partners

export interface CoFundingClaim { partner: string; activity: string; requested: number; approved: number; spent: number; proofDue?: string; proofSent?: boolean; pipeline?: number }

/** Vendor co-funding (MDF) tracker: never spend before approval; send proof on time. */
export function coFundingStatus(claims: CoFundingClaim[], today: string) {
  const approved = claims.reduce((s, c) => s + c.approved, 0)
  const pipeline = claims.reduce((s, c) => s + (c.pipeline ?? 0), 0)
  return {
    requested: claims.reduce((s, c) => s + c.requested, 0),
    approved,
    spent: claims.reduce((s, c) => s + c.spent, 0),
    overspent: claims.filter(c => c.spent > c.approved).map(c => `${c.partner}: ${c.activity}`),
    proofOverdue: claims.filter(c => c.proofDue && !c.proofSent && c.proofDue < today).map(c => `${c.partner}: ${c.activity}`),
    pipelinePerDollar: approved > 0 ? Math.round((pipeline / approved) * 10) / 10 : 0,
  }
}

// ---------------------------------------------------------------- reporting

export interface QuarterMetrics {
  followers: number
  engagementRate: number // 0–1
  flagshipDownloads: number
  webinarRegistrations: number
  webinarAttendees: number
  eventInvites: number
  eventAttendees: number
  leads: number
  pipeline: number // value of opportunities, AUD
  spend: number // programme + events + ads, AUD
}

const pct = (n: number) => `${Math.round(n * 100)}%`

/** End-of-quarter report and what to change next quarter. */
export function quarterReport(now: QuarterMetrics, before?: QuarterMetrics) {
  const change = (k: keyof QuarterMetrics) => (before && before[k] ? (now[k] - before[k]) / before[k] : null)
  const attendance = now.webinarRegistrations ? now.webinarAttendees / now.webinarRegistrations : 0
  const eventRate = now.eventInvites ? now.eventAttendees / now.eventInvites : 0
  const lines = [
    `Followers: ${now.followers}${change('followers') !== null ? ` (${change('followers')! >= 0 ? '+' : ''}${pct(change('followers')!)})` : ''}`,
    `Engagement rate: ${pct(now.engagementRate)}`,
    `Flagship downloads: ${now.flagshipDownloads}`,
    `Webinar: ${now.webinarRegistrations} registered, ${now.webinarAttendees} attended (${pct(attendance)})`,
    `Events: ${now.eventAttendees} of ${now.eventInvites} invited attended (${pct(eventRate)})`,
    `Leads: ${now.leads}; pipeline $${Math.round(now.pipeline).toLocaleString('en-AU')}; spend $${Math.round(now.spend).toLocaleString('en-AU')}`,
    `Pipeline per $1 spent: ${now.spend ? Math.round((now.pipeline / now.spend) * 10) / 10 : 0}`,
  ]
  const next: string[] = []
  if (now.webinarRegistrations && attendance < 0.35) next.push('Webinar attendance is low: send the reminder the day before and an hour before, and offer the recording to everyone who registers.')
  if (now.flagshipDownloads < 25) next.push('The flagship reached few people: put it in front of partners and speakers\' networks, and test a shorter version.')
  if (now.engagementRate < 0.02) next.push('Engagement is under 2%: lead with a question or a lesson learned, not an announcement; have the experts post from their own profiles.')
  if (now.eventInvites && eventRate < 0.2) next.push('Few invitees came: invite fewer, better-matched people personally, 6 weeks ahead.')
  if (now.leads > 0 && now.pipeline / Math.max(1, now.spend) < 3) next.push('Pipeline is under 3× spend: move budget from the lowest-converting activity to the one that produced most leads.')
  if (!next.length) next.push('On track: keep the cadence, raise the bar on the flagship, and add one more partner.')
  return { lines, next }
}

// ---------------------------------------------------------------- social

/** The quarter's social posts that back the campaign (no invented numbers). */
export function themePostIdeas(q: PlannedQuarter, campaign: string, path = '/#contact'): PostIdea[] {
  const t = q.theme
  return [
    { id: `q${q.index}-launch`, pillar: t.title, campaign, path, markets: t.markets, hook: t.narrative, body: `This quarter we're sharing what we've learned about ${t.title.toLowerCase()}. First up: ${t.flagship}.`, hashtags: ['DataEngineering', 'AI', 'Cloud'] },
    { id: `q${q.index}-webinar`, pillar: t.title, campaign, path, markets: t.markets, hook: `Webinar: ${t.webinar}`, body: `A practical session for data, finance and technology leaders. Bring your questions; the recording goes to everyone who registers.`, hashtags: ['Webinar', 'DataEngineering', 'AI'] },
    ...t.angles.slice(0, 2).map((a, i) => ({ id: `q${q.index}-angle-${i + 1}`, pillar: t.title, campaign, path, markets: t.markets, hook: a, body: `Part of our ${t.title.toLowerCase()} series. The full article is on our site.`, hashtags: ['DataEngineering', 'AI'] })),
  ]
}

// ---------------------------------------------------------------- economics

/** Monthly hours a tier really needs (from the plan), and whether its price clears the minimum margin. */
export function programmeEconomics(tier: TierId) {
  const perQuarter = (Object.entries(TIERS[tier].mix) as [AssetKind, number][]).reduce((s, [k, n]) => s + ASSET_SPECS[k].hours * n, 0)
  const hoursMonthly = Math.round((perQuarter / 3) * 100) / 100
  const fee = TIERS[tier].monthly
  const cost = hoursMonthly * COSTS.hourlyCost + COSTS.toolsPerPackageClient
  const worstFee = fee * 0.9 // deepest loyalty discount
  const setupCost = BRAND_PROGRAMME.setupHours * COSTS.hourlyCost
  return {
    hoursMonthly,
    monthlyFee: fee,
    monthlyCost: Math.round(cost * 100) / 100,
    margin: Math.round(((worstFee - cost) / worstFee) * 100) / 100,
    dayOneProfit: Math.round((BRAND_PROGRAMME.setup + fee - setupCost - cost) * 100) / 100,
    meetsMinimum: (worstFee - cost) / worstFee >= MIN_MARGIN,
  }
}
