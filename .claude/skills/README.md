# PhLedger Marketing — automation skills

PhLedger Marketing is run by one person, Zhi Li. These skills let Claude do
the repeatable work so each client fits a strict hour budget — Grace 1 h,
Faithful 3 h, Abundant 7 h a month, pay per lead 15 minutes plus about 3
minutes a lead (`HOURS` in `src/lib/economics.ts`). Those budgets keep every
client profitable from day one; `tests/economics.spec.ts` fails if prices
or budgets stop adding up. They follow
the LLM → Agent → Skills → MCP layering:

| Layer | What it is here |
| --- | --- |
| **LLM** | Claude: writes copy, reads enquiries, reasons about results |
| **Agent** | `weekly-client-routine`: perceive (orders, leads, ad results) → plan → act (drafts for Zhi Li to approve) |
| **Skills** | The folders below: one per service, each giving the same quality every time |
| **MCP** | Connectors to the systems the work runs through (table below) |
| **Harness** | `src/lib/approvals.ts`: per-client approval mode (Zhi Li / Zhi Li + client / full automation for simple work) plus hard rules no mode can switch off; every action logged with `auditEntry` |

## Skills

| Skill | Use it for | Sold as |
| --- | --- | --- |
| `weekly-client-routine` | Running a client's week (the agent) | Every plan |
| `marketing-health-check` | Free review for any prospect; choosing their plan | Free |
| `offer-and-print` | Core offer, flyers, posters, menus, inserts | Setup; Offer & Brand Messaging |
| `content-calendar` | Social posts and short videos | Grace and up |
| `google-business-profile` | Google profile, posts, review replies | Grace and up |
| `ad-campaign` | Paid ads on Meta, Google, LinkedIn, TikTok | Faithful and up |
| `loyalty-emails` | Birthday, win-back, thank-you, referral emails | Faithful and up |
| `speed-to-lead` | Instant honest reply to every enquiry and missed call | Grace and up (AI Speed-to-Lead Replies) |
| `customer-service` | AI Customer Service: presale questions and aftersales (complaints, refunds, reorders) on the website and phone/mobile, plus the after-purchase journey | AI Customer Service add-on |
| `lead-qualification` | Eligibility, logging and billing leads | Pay per lead (tiny businesses only) |
| `daily-maps-routine` | Daily ads budget and alerts (投流), review replies and escalation, daily owner summary | Faithful + SEO & Reputation |
| `local-seo` | Website schema, titles, local keywords, name/address/phone match with Google | SEO & Reputation add-on |
| `order-automation` | Orders from Instagram, Facebook, RedNote, WeChat, phone and website | Order Automation add-on |
| `brand-autopilot` | PhLedger's own brands (Marketing + Consulting at phledger.com) on every social channel, cross-linked | PhLedger itself |
| `business-ops` | Service agreement, PhLedger's monthly scorecard (cash break-even first), case studies | PhLedger itself |
| `client-quote` | Quote, message, checklist, agenda and actions for a prospect | Every new client |
| `monthly-report` | One-page results against break-even | Every plan |

Prices, packages, lead prices and the tiny-business rule live in
`src/lib/catalog.ts`; lead billing is `src/lib/leads.ts` (tested in
`tests/leads.spec.ts`). Skills point there instead of copying numbers.

## MCP connectors (to set up)

| System | Used by | Status |
| --- | --- | --- |
| Supabase (`dm_profiles`, `dm_bookings`, `dm_leads`) | all skills | Database exists; connect via the Supabase MCP server |
| Email inbox and tracked enquiry form | `lead-qualification`, `loyalty-emails` | To set up |
| Call tracking (tracked numbers with call logs) | `lead-qualification` | To choose a provider |
| Meta (Facebook, Instagram) | `content-calendar`, `ad-campaign` | To connect |
| Google Business Profile and Google Ads | `google-business-profile`, `ad-campaign` | To connect |
| LinkedIn | `content-calendar`, `ad-campaign` | To connect |
| Canva | `offer-and-print`, `content-calendar` | To connect |
| PhLedgerTax (invoices for packages and lead bills) | `lead-qualification`, `monthly-report` | Needs a custom MCP server |

Until a connector exists, the skill works from exported data or what the
owner provides, and says what was missing. Nothing is published or sent
without Zhi Li's approval.
