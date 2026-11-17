# PhLedger Marketing — automation skills

PhLedger Marketing is run by one person, Zhi Li. These skills let Claude do
the repeatable work so each client takes about 5.5 hours a week. They follow
the LLM → Agent → Skills → MCP layering:

| Layer | What it is here |
| --- | --- |
| **LLM** | Claude: writes copy, reads enquiries, reasons about results |
| **Agent** | `weekly-client-routine`: perceive (orders, leads, ad results) → plan → act (drafts for Zhi Li to approve) |
| **Skills** | The folders below: one per service, each giving the same quality every time |
| **MCP** | Connectors to the systems the work runs through (table below) |

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
| `lead-qualification` | Eligibility, logging and billing leads | Pay per lead (tiny businesses only) |
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
