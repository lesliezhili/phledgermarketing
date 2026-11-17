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

export interface Service {
  id: number
  name: string
  desc: string
  price: number // AUD per month; 0 = free
  tier: Tier
  icon: string
}

// Ids are stable: /booking?service=<id> links depend on them.
export const services: Service[] = [
  { id: 1, name: 'Marketing Health Check', desc: 'A review of your offer, prices, profiles and print, with a fix list. Works for any business.', price: 0, tier: 'Grace', icon: '🩺' },
  { id: 2, name: 'Offer & Brand Messaging', desc: 'One clear offer, one price, one call to action, used on every channel.', price: 0, tier: 'Grace', icon: '🎯' },
  { id: 3, name: 'Content Strategy & Calendar', desc: '30-day content plan for the channels that fit your business.', price: 49, tier: 'Faithful', icon: '📝' },
  { id: 4, name: 'Social Media Management', desc: 'Posts, short videos and replies on 2–3 channels, scheduled and tracked.', price: 49, tier: 'Faithful', icon: '📱' },
  { id: 5, name: 'Local & Google Visibility', desc: 'Google Business Profile, reviews and local search for walk-in and nearby customers.', price: 49, tier: 'Faithful', icon: '📍' },
  { id: 6, name: 'Paid Ads Management', desc: 'Ethical ad campaigns on Meta, Google, LinkedIn or TikTok — whichever reaches your buyers.', price: 199, tier: 'Abundant', icon: '🚀' },
  { id: 7, name: 'Outreach & Partnerships', desc: 'Direct outreach to businesses, creators and community partners who can send you customers.', price: 199, tier: 'Abundant', icon: '🤝' },
  { id: 8, name: 'Analytics & Reporting', desc: 'Monthly results against break-even: what sold, which channel, what to change.', price: 199, tier: 'Abundant', icon: '📊' },
]

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
