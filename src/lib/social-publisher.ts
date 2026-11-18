// Social publishing engine for PhLedger's brands and its clients.
//
// One post idea → a version for each channel (length, links, hashtags,
// language) → a weekly schedule → an approval decision → a publisher.
// Publishing goes through connectors; until a connector is live, the
// dry-run publisher records exactly what would have been posted.
//
// Automation is limited by each platform's own rules (CHANNEL_SPECS):
// some channels can be posted to through an official API; others need a
// person or a native scheduler. Nothing is posted that a person hasn't
// approved, unless the brand's approval mode allows it.

import { decide, type ApprovalPolicy, type Route } from './approvals'
import { trackedLink, type Brand, type SocialChannel } from './brands'

export interface ChannelSpec {
  name: string
  maxChars: number
  clickableLinks: boolean // false: "link in bio" instead
  hashtags: number // recommended maximum
  postsPerWeek: number // recommended for a small brand
  bestDays: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[]
  automation: 'api' | 'native_scheduler' | 'person'
  how: string
}

export const CHANNEL_SPECS: Record<SocialChannel, ChannelSpec> = {
  linkedin: { name: 'LinkedIn', maxChars: 3000, clickableLinks: true, hashtags: 3, postsPerWeek: 3, bestDays: ['Tue', 'Wed', 'Thu'], automation: 'native_scheduler', how: 'LinkedIn\'s built-in scheduler (free); posting by API to a company page needs LinkedIn\'s approval for its Community Management API' },
  google: { name: 'Google Business Profile', maxChars: 1500, clickableLinks: true, hashtags: 0, postsPerWeek: 1, bestDays: ['Mon'], automation: 'api', how: 'Google Business Profile API (access must be requested); or post in the profile weekly' },
  facebook: { name: 'Facebook', maxChars: 2000, clickableLinks: true, hashtags: 3, postsPerWeek: 3, bestDays: ['Tue', 'Thu', 'Sat'], automation: 'api', how: 'Meta Business Suite scheduler (free) or Meta\'s official Pages API' },
  instagram: { name: 'Instagram', maxChars: 2200, clickableLinks: false, hashtags: 8, postsPerWeek: 3, bestDays: ['Wed', 'Fri', 'Sun'], automation: 'api', how: 'Meta Business Suite scheduler (free) or Meta\'s official content publishing API (professional account)' },
  x: { name: 'X', maxChars: 280, clickableLinks: true, hashtags: 2, postsPerWeek: 3, bestDays: ['Mon', 'Wed', 'Fri'], automation: 'native_scheduler', how: 'X\'s own scheduler; posting by API needs a paid API tier' },
  rednote: { name: 'RedNote (小红书)', maxChars: 1000, clickableLinks: false, hashtags: 10, postsPerWeek: 2, bestDays: ['Thu', 'Sun'], automation: 'person', how: 'No public posting API: AI drafts, a person posts' },
  wechat: { name: 'WeChat', maxChars: 1000, clickableLinks: true, hashtags: 0, postsPerWeek: 1, bestDays: ['Fri'], automation: 'person', how: 'Moments / Official Account articles posted by a person (verified Official Account for more)' },
}

export interface PostIdea {
  id: string
  pillar: string
  hook: string // first line
  body: string // the main message, plain words
  cta?: string // overrides the brand's pilot call to action
  hashtags?: string[]
  language?: 'en' | 'zh'
  campaign: string
}

export interface ChannelPost {
  ideaId: string
  channel: SocialChannel
  text: string
  link?: string
  date: string // YYYY-MM-DD
  route: Route // who must approve before it goes out
}

const truncate = (s: string, max: number) => (s.length <= max ? s : s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…')

/** One idea → the text for one channel. */
export function formatForChannel(idea: PostIdea, brand: Brand, channel: SocialChannel): { text: string; link?: string } {
  const spec = CHANNEL_SPECS[channel]
  const link = trackedLink(brand, channel, idea.campaign)
  const cta = idea.cta ?? brand.pilotOffer.cta
  const tags = (idea.hashtags ?? []).slice(0, spec.hashtags).map(t => '#' + t.replace(/^#/, '').replace(/\s+/g, ''))
  const linkLine = spec.clickableLinks ? `${cta}: ${link}` : `${cta} — link in bio`
  if (channel === 'x') {
    // Short form: hook + link only.
    const tail = ` ${link}`
    return { text: truncate(idea.hook, spec.maxChars - tail.length) + tail, link }
  }
  const parts = [idea.hook, '', idea.body, '', linkLine]
  if (tags.length) parts.push('', tags.join(' '))
  const text = parts.join('\n')
  return { text: truncate(text, spec.maxChars), link: spec.clickableLinks ? link : undefined }
}

const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

function datesForWeek(weekStart: string, days: ChannelSpec['bestDays'], count: number): string[] {
  const start = new Date(weekStart + 'T00:00:00Z')
  const out: string[] = []
  for (const d of days.slice(0, count)) {
    const offset = (DAY_INDEX[d] - start.getUTCDay() + 7) % 7
    const dt = new Date(start)
    dt.setUTCDate(start.getUTCDate() + offset)
    out.push(dt.toISOString().slice(0, 10))
  }
  return out.sort()
}

/**
 * A week's schedule: ideas are rotated across each channel's posting slots,
 * at that channel's recommended pace, and each post gets its approval route.
 */
export function planWeek(brand: Brand, ideas: PostIdea[], weekStart: string, policy: ApprovalPolicy = brand.approvals): ChannelPost[] {
  if (!ideas.length) return []
  const posts: ChannelPost[] = []
  for (const channel of brand.channels) {
    const spec = CHANNEL_SPECS[channel]
    const dates = datesForWeek(weekStart, spec.bestDays, spec.postsPerWeek)
    dates.forEach((date, i) => {
      const idea = ideas[i % ideas.length]
      const { text, link } = formatForChannel(idea, brand, channel)
      const type = channel === 'rednote' ? 'post_rednote' : channel === 'google' ? 'post_google' : 'post_social'
      posts.push({ ideaId: idea.id, channel, text, link, date, route: decide({ type }, policy).route })
    })
  }
  return posts.sort((a, b) => a.date.localeCompare(b.date) || a.channel.localeCompare(b.channel))
}

export interface PublishResult { channel: SocialChannel; date: string; status: 'published' | 'queued_for_person' | 'needs_approval' | 'dry_run'; detail: string }

export interface Publisher {
  publish(post: ChannelPost): Promise<PublishResult>
}

/** Records what would be posted. The default until each connector is live. */
export class DryRunPublisher implements Publisher {
  readonly outbox: ChannelPost[] = []
  async publish(post: ChannelPost): Promise<PublishResult> {
    this.outbox.push(post)
    return { channel: post.channel, date: post.date, status: 'dry_run', detail: `${CHANNEL_SPECS[post.channel].name}: ${post.text.length} characters` }
  }
}

/**
 * Publish a week's approved posts. Posts that still need approval are held;
 * channels without an API go to a person's queue; the rest go to the
 * publisher (dry run until a real connector is plugged in).
 */
export async function publishWeek(posts: ChannelPost[], approvedIds: Set<string>, publisher: Publisher): Promise<PublishResult[]> {
  const out: PublishResult[] = []
  for (const p of posts) {
    const key = `${p.ideaId}:${p.channel}:${p.date}`
    const approved = p.route === 'auto' || approvedIds.has(key)
    if (CHANNEL_SPECS[p.channel].automation === 'person' || p.route === 'person_sends') {
      out.push({ channel: p.channel, date: p.date, status: 'queued_for_person', detail: CHANNEL_SPECS[p.channel].how })
    } else if (!approved) {
      out.push({ channel: p.channel, date: p.date, status: 'needs_approval', detail: `Waiting for ${p.route}` })
    } else {
      out.push(await publisher.publish(p))
    }
  }
  return out
}

export const postKey = (p: ChannelPost) => `${p.ideaId}:${p.channel}:${p.date}`
