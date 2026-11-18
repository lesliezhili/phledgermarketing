---
name: brand-autopilot
description: Market PhLedger's own brands - PhLedger Marketing and PHledger FDE consulting (phledger.com, data/AI/cloud with forward-deployed engineers) - across Google, LinkedIn, Facebook, Instagram, X, RedNote and WeChat with the same automation used for clients. Use weekly to plan, approve and publish PhLedger's own posts, and when adding new campaign ideas.
---

# Brand autopilot (PhLedger is its own first client)

Code: `src/lib/brands.ts` (both brands, cross-links, tracked links),
`src/lib/social-publisher.ts` (per-channel formatting, weekly plan,
approval routing, publishing), `src/lib/campaigns.ts` (post ideas).

## Weekly (Monday, about 30 minutes)

1. Add or refresh post ideas in `src/lib/campaigns.ts` — real claims only;
   case notes only with the client's permission.
2. `npm run social -- phledger-consulting <monday YYYY-MM-DD>` writes the
   week's posts for every channel to `clients/out/`.
3. Zhi Li approves the batch (approval mode `zhi_li`; hard rules still apply).
4. Publish:
   - **LinkedIn** (the main channel for consulting): LinkedIn's built-in
     scheduler; an API connector needs LinkedIn's Community Management API approval.
   - **Facebook and Instagram:** Meta Business Suite scheduler (free) or Meta's API.
   - **Google Business Profile:** one post a week, in the profile or by API once access is granted.
   - **X:** X's own scheduler (API posting needs a paid tier).
   - **RedNote and WeChat:** a person posts the drafted text.
   `publishWeek` with `DryRunPublisher` shows exactly what would go out; swap
   in a real connector per channel as each is approved.
5. Every link carries UTM tags, so GA4 on phledger.com shows which channel
   and campaign brought each visit and data health check booking.

## Cross-linking (more FDE work from marketing)

phledger.com is the repo `lesliezhili/phledger`; its offer ladder is mirrored
in `BRANDS['phledger-consulting'].ladder`: free brief → Decision sprint
(A$18,000, 2 weeks) → Embedded FDE (A$26,000 per engineer per month, 3-month
minimum) → Fixed-scope build (from A$60,000). Keep them in step when the site changes.

- In every monthly report and quarterly review, tick the client's FDE signals
  and run `assessFdeFit` (`src/lib/consulting-referrals.ts`). It picks the
  first step (not yet / brief / decision sprint / embedded FDE), writes the
  hand-over brief in phledger.com's questionnaire shape (en or zh) and a
  referral link tagged `utm_source=phledger-marketing`.
- Ask the client before introducing them; send nothing until they agree.
- Tiny businesses are never pushed to a fixed-fee sprint: they get the free
  brief, and small fixes stay inside their marketing plan.
- Marketing clients who need dashboards, data clean-up or custom AI → PHledger
  (`/consulting` page on this site links to phledger.com).
- Consulting clients who want more leads, reviews or social media → PhLedger Marketing.
- The "we run on what we build" story links the two: PhLedger Marketing's
  automation is the FDE showcase.

## Measure (monthly, in the scorecard)

Visits by channel (GA4 UTM), data health checks booked, FDE pilots sold,
and marketing clients referred to consulting and back.
