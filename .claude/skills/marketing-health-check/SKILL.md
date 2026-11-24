---
name: marketing-health-check
description: Run PhLedger Marketing's free Marketing Health Check for any business - review its offer, prices, flyers, profiles and channels, then produce a prioritised fix list, a channel recommendation and a plan choice (pay per lead or a package). Use for every new prospect and for the 30-minute intake call.
---

# Marketing Health Check (free, any business)

Budget: 30 minutes, mostly drafted by this skill. Offer at most 4 a week so
free work stays a small marketing cost. Only recommend pay per lead when the
business's tracked channels can realistically produce leads — otherwise
PhLedger does the work and earns only the monthly minimum.

This is step 1 of the method (Diagnose) and the way new clients find us. It
must be genuinely useful even if the business never buys.

## Inputs

Whatever the owner shares: photos of flyers and signs, website and social
links, Google Business Profile, menu or price list, and answers to the intake
questions (offers, prices, margins, capacity, customers, busy periods,
today's numbers, budget). Fill `weekly-client-routine/client-profile.md`.

## Review — check each, quote what you saw

| Area | Pass when |
| --- | --- |
| Identity | Business name, logo and address on every flyer, sign and profile |
| Offer | One clear main offer per piece, in plain words |
| Price | Prices or "from $X" shown; lead times for orders |
| Way to buy | Phone, link or QR code on everything; one page to buy or enquire |
| Trust | Real photos, Google reviews, a domain email rather than a free mailbox |
| Spelling | No typos in product names or prices |
| Cross-selling | Related offers mention each other (e.g. cakes and functions) |
| Tracking | "How did you hear about us?" asked on every order |
| Channels | Profiles exist and match the business type (see `businessTypes` in `src/lib/catalog.ts`) |

## Output

1. **Top 5 fixes**, most money first, each with the exact change.
2. **Channels:** the 2–4 to use and why, from the business type.
3. **Break-even:** (monthly fee + ad spend) ÷ (average sale × margin), for the
   plan you recommend. Mark any assumed number "to confirm".
4. **Recommended plan:**
   - **Pay per lead** only for tiny businesses — aggregated annual turnover
     under $2 million (ATO test; `TINY_BUSINESS` in `src/lib/catalog.ts`) —
     that want to pay only for results. Ask for the ABN and turnover band.
   - **Grace / Faithful / Abundant** when they want marketing run for them
     every month and can handle the extra sales.
5. **Timing:** the next busy period to aim the first push at.

Keep it to one page. Never pressure; end with the free next step.
