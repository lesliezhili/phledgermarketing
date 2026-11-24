// Markets PHledger sells into: Australia and Canada, marketed together.
// Québec is its own market: commercial advertising there must be in French
// (Charter of the French language, as amended by Bill 96), so Québec gets
// French posts and the French page; the rest of Canada gets English and Chinese.
//
// Same brand, same messages, same approval rules; what changes per market:
// currency and tax, time zones (posts go out at local business hours),
// spelling, data-residency regions, the privacy / anti-spam / consumer laws,
// and which channels make sense (a Google Business Profile needs a
// verifiable local address, so it is Australia only for now).

import type { SocialChannel } from './brands'

export type MarketId = 'au' | 'ca' | 'qc'
export type ContentLanguage = 'en' | 'zh' | 'fr'

export interface Market {
  id: MarketId
  name: string
  nameZh: string
  currency: 'AUD' | 'CAD'
  salesTax: string
  locale: string
  timeZone: string // where posts are timed
  alsoTimeZones: string[] // other big business time zones in the market
  cities: string[]
  channels: SocialChannel[]
  /** Local posting time (24h) per channel, in `timeZone`. */
  postTimes: Partial<Record<SocialChannel, string>>
  cloudRegions: string[] // keep data in-country
  law: { privacy: string; antiSpam: string; unsubscribeBusinessDays: number; consumer: string }
  languages: string[]
  /** Post languages for this market (an idea's `language`, default 'en'). */
  contentLanguages: ContentLanguage[]
  notes: string[]
}

const POST_TIMES: Partial<Record<SocialChannel, string>> = {
  linkedin: '08:30', google: '09:00', facebook: '12:00', instagram: '18:30', x: '08:00', wechat: '20:00', rednote: '20:30',
}

export const MARKETS: Record<MarketId, Market> = {
  au: {
    id: 'au',
    name: 'Australia',
    nameZh: '澳大利亚',
    currency: 'AUD',
    salesTax: 'GST 10%',
    locale: 'en-AU',
    timeZone: 'Australia/Melbourne',
    alsoTimeZones: ['Australia/Sydney', 'Australia/Brisbane', 'Australia/Perth'],
    cities: ['Melbourne', 'Sydney', 'Brisbane'],
    channels: ['linkedin', 'google', 'facebook', 'instagram', 'x', 'wechat'],
    postTimes: POST_TIMES,
    cloudRegions: ['AWS ap-southeast-2 (Sydney) / ap-southeast-4 (Melbourne)', 'Azure Australia East / Southeast', 'Google Cloud australia-southeast1 / 2'],
    law: { privacy: 'Privacy Act 1988 (Australian Privacy Principles)', antiSpam: 'Spam Act 2003', unsubscribeBusinessDays: 5, consumer: 'Australian Consumer Law' },
    languages: ['English', 'Simplified Chinese'],
    contentLanguages: ['en', 'zh'],
    notes: ['Home market: on-site work in Melbourne by arrangement.'],
  },
  ca: {
    id: 'ca',
    name: 'Canada',
    nameZh: '加拿大',
    currency: 'CAD',
    salesTax: 'GST/HST (5–15% by province)',
    locale: 'en-CA',
    timeZone: 'America/Toronto',
    alsoTimeZones: ['America/Vancouver', 'America/Edmonton', 'America/Montreal'],
    cities: ['Toronto', 'Vancouver', 'Calgary', 'Montréal'],
    channels: ['linkedin', 'facebook', 'instagram', 'x', 'wechat'], // no Google Business Profile without a Canadian address
    postTimes: POST_TIMES,
    cloudRegions: ['AWS ca-central-1 (Montréal) / ca-west-1 (Calgary)', 'Azure Canada Central / Canada East', 'Google Cloud northamerica-northeast1 / 2'],
    law: { privacy: 'PIPEDA (and Québec Law 25)', antiSpam: 'CASL (Canada\'s Anti-Spam Legislation)', unsubscribeBusinessDays: 10, consumer: 'provincial consumer protection law' },
    languages: ['English', 'Simplified Chinese'],
    contentLanguages: ['en', 'zh'],
    notes: [
      'Outside Québec. Use location targeting (paid posts, or LinkedIn page post targeting) so English posts reach the rest of Canada and French posts reach Québec.',
      'Remote-first delivery; Melbourne and Toronto overlap roughly 4–6 pm Toronto = 8–10 am Melbourne (next day).',
      'CASL needs express or implied consent before commercial email/SMS; replying to an enquiry is allowed (implied consent for 6 months).',
    ],
  },
  qc: {
    id: 'qc',
    name: 'Québec',
    nameZh: '魁北克',
    currency: 'CAD',
    salesTax: 'TPS/TVQ (GST 5% + QST 9.975%)',
    locale: 'fr-CA',
    timeZone: 'America/Toronto', // same clock as Montréal
    alsoTimeZones: ['America/Montreal'],
    cities: ['Montréal', 'Québec', 'Laval', 'Gatineau'],
    channels: ['linkedin', 'facebook', 'instagram', 'x'],
    postTimes: POST_TIMES,
    cloudRegions: ['AWS ca-central-1 (Montréal)', 'Azure Canada East (Québec) / Canada Central', 'Google Cloud northamerica-northeast1 (Montréal)'],
    law: { privacy: 'Loi 25 (Act respecting the protection of personal information in the private sector) and PIPEDA', antiSpam: 'CASL (LCAP)', unsubscribeBusinessDays: 10, consumer: 'Loi sur la protection du consommateur' },
    languages: ['Français'],
    contentLanguages: ['fr'],
    notes: [
      'Commercial advertising must be in French (Charter of the French language / Bill 96); English may appear only if French is at least as prominent.',
      'Contracts of adhesion (e.g. standard terms) must be offered in French first.',
      'French copy here was drafted in Canadian French; have a native Québec speaker review it before publishing.',
    ],
  },
}

export const MARKET_IDS = Object.keys(MARKETS) as MarketId[]

/** Offset of `timeZone` from UTC, in minutes, at a given instant. */
function offsetMinutes(timeZone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(at)
  const get = (t: string) => Number(parts.find(p => p.type === t)!.value)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
  return Math.round((asUtc - at.getTime()) / 60000)
}

/** A local date and time in a time zone → the UTC instant (ISO), daylight saving included. */
export function localToUtc(date: string, time: string, timeZone: string): string {
  const naive = new Date(`${date}T${time}:00Z`)
  let utc = naive.getTime() - offsetMinutes(timeZone, naive) * 60000
  utc = naive.getTime() - offsetMinutes(timeZone, new Date(utc)) * 60000 // second pass for DST edges
  return new Date(utc).toISOString()
}

// Canadian English keeps British spellings like "colour" and "centre" but uses -ize.
const IZE: [RegExp, string][] = [
  [/\borganis(e|es|ed|ing|ation|ations)\b/g, 'organiz$1'],
  [/\bOrganis(e|es|ed|ing|ation|ations)\b/g, 'Organiz$1'],
  [/\bmodernis(e|es|ed|ing|ation)\b/g, 'moderniz$1'],
  [/\bModernis(e|es|ed|ing|ation)\b/g, 'Moderniz$1'],
  [/\boptimis(e|es|ed|ing|ation)\b/g, 'optimiz$1'],
  [/\bprioritis(e|es|ed|ing)\b/g, 'prioritiz$1'],
  [/\bspecialis(e|es|ed|ing|t|ts)\b/g, 'specializ$1'],
  [/\bstandardis(e|es|ed|ing|ation)\b/g, 'standardiz$1'],
  [/\bcustomis(e|es|ed|ing|ation)\b/g, 'customiz$1'],
  [/\bcentralis(e|es|ed|ing|ation)\b/g, 'centraliz$1'],
  [/\banalys(e|ed|ing)\b/g, 'analyz$1'], // not "analyses" (plural noun)
]

/** Spell English text for the market (Australian copy is the source). */
export function localise(text: string, market: MarketId): string {
  if (market !== 'ca') return text
  return IZE.reduce((t, [re, to]) => t.replace(re, to), text)
}
