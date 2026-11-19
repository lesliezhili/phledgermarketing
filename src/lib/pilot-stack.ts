// The free tool stack for pilots (and the cheapest start for any client).
//
// Rule: a pilot costs PhLedger no cash. Every need is met with a free tool or
// the client's own existing account. Paid upgrades wait until the client is
// paying, and each one must be covered by that client's fees
// (tests/pilot-stack.spec.ts).
//
// Check each tool's current terms and free-plan limits when setting it up;
// they change.

export interface StackItem {
  need: string
  freeTool: string
  how: string
  limit: string // what the free option can't do
  paidUpgrade?: { tool: string; monthlyCost: number; when: string }
}

export const PILOT_STACK: StackItem[] = [
  {
    need: 'Google Maps profile, posts, review replies, insights',
    freeTool: 'Google Business Profile (client owns it; PhLedger added as manager)',
    how: 'Fix details and products, weekly posts, reply to reviews; Performance insights give calls, directions and website clicks for the baseline',
    limit: 'Insights are totals, not per-customer tracking',
  },
  {
    need: 'Daily Google Maps ads (投流)',
    freeTool: 'Google Ads account in the client\'s name (free to open; the client pays ad spend directly)',
    how: 'Small test budget set by the client; location assets so ads can show on Maps; call reporting for ad calls',
    limit: 'Ad spend is the client\'s cost, never PhLedger\'s',
  },
  {
    need: 'Website SEO and traffic measurement',
    freeTool: 'Google Search Console + Google Analytics 4',
    how: 'SEO health check on the client\'s existing site; UTM-tagged links (free Campaign URL Builder) on Google, Instagram and QR codes',
    limit: 'Needs access to the client\'s website; no new website in the pilot',
  },
  {
    need: 'Order and enquiry page',
    freeTool: 'Google Forms + Google Sheets (client\'s Google account)',
    how: 'One form for whole cakes and functions, linked from Google Maps, Instagram bio and the QR code; responses land in a Sheet the store manager can see',
    limit: 'Basic look; no online payment',
    paidUpgrade: { tool: 'PhLedger order page with payments and order automation', monthlyCost: 0, when: 'With the Order Automation add-on' },
  },
  {
    need: 'QR codes for counter card and cake boxes',
    freeTool: 'Static QR code from Google Chrome ("Create QR code")',
    how: 'Static codes never expire; point them at the UTM-tagged form link',
    limit: 'Can\'t change the destination after printing — use a stable link',
  },
  {
    need: 'Review card and post designs',
    freeTool: 'Canva free plan',
    how: 'Card and post templates; printed on the store\'s own printer',
    limit: 'Some templates and features are paid only',
  },
  {
    need: 'Instant replies on Instagram and Facebook',
    freeTool: 'Meta Business Suite (instant replies, away messages, FAQs, post scheduling)',
    how: 'Instant reply with the qualifying questions and the order form link; schedule Instagram and Facebook posts',
    limit: 'Template replies, not the full speed-to-lead logic',
  },
  {
    need: 'Instant replies on WhatsApp and email',
    freeTool: 'WhatsApp Business app (greeting and away messages) + Gmail auto-reply and templates',
    how: 'Speed-to-lead text from `firstReply` pasted in as the greeting and auto-reply, with the automated-assistant line',
    limit: 'Same reply every time; no per-trade logic',
  },
  {
    need: 'Missed calls',
    freeTool: 'The store phone\'s voicemail greeting',
    how: 'Greeting says the team may be busy baking, gives the hours, and invites callers to message this number on WhatsApp/WeChat or order via the business on Google Maps; staff call back',
    limit: 'No automatic text-back to missed callers',
    paidUpgrade: { tool: 'SMS provider + tracked number for missed-call text-back and lead billing', monthlyCost: 15, when: 'When the client pays (package or pay per lead)' },
  },
  {
    need: 'WeChat replies',
    freeTool: 'The store\'s existing WeChat (personal/business) with saved quick replies',
    how: 'AI drafts in Chinese (`firstReply` with language zh); a person sends',
    limit: 'No automation without a verified Official Account',
    paidUpgrade: { tool: 'Verified WeChat Official Account / WeCom', monthlyCost: 0, when: 'After the pilot, if WeChat orders justify the verification fee (client pays)' },
  },
  {
    need: 'RedNote (小红书) notes',
    freeTool: 'The store\'s RedNote account',
    how: 'AI drafts notes in Chinese; a person posts (no public API)',
    limit: 'Manual posting',
  },
  {
    need: 'Records: leads, orders, approvals, baseline',
    freeTool: 'Google Sheets + this repo\'s scripts (quote, agreement, scorecard, case study)',
    how: 'One Sheet per client for leads/orders; daily summary drafted with `dailySummary` and sent on WeChat',
    limit: 'Manual copy between tools',
    paidUpgrade: { tool: 'Supabase project for the PhLedger platform', monthlyCost: 0, when: 'When several clients are live; start on the free tier' },
  },
]

/** Cash PhLedger spends per month on a pilot: must be zero. */
export const pilotCashCost = () => 0

/** Cash per month once all paid upgrades for a client are switched on. */
export const upgradesMonthlyCost = () => PILOT_STACK.reduce((s, i) => s + (i.paidUpgrade?.monthlyCost ?? 0), 0)

/** The stack as a Markdown table for the client plan or a skill. */
export function pilotStackMarkdown(): string {
  return [
    '| Need | Free tool | Limit | Paid upgrade (only once the client pays) |',
    '| --- | --- | --- | --- |',
    ...PILOT_STACK.map(i => `| ${i.need} | ${i.freeTool} | ${i.limit} | ${i.paidUpgrade ? `${i.paidUpgrade.tool} — ${i.paidUpgrade.when}` : '—'} |`),
  ].join('\n')
}
