---
name: daily-maps-routine
description: Run a client's daily Google Maps routine - today's ad budget and alerts (daily 投流), new reviews triaged with drafted replies (bad reviews escalated), new enquiries and orders from every channel, and the 5-line daily WeChat/email summary for the owner. Use every morning for clients with daily ads, the SEO & Reputation add-on or Order Automation.
---

# Daily Google Maps routine

Ten minutes a day, mostly automated. Each step uses tested code; never
work numbers out by hand.

## 1. Ads (daily 投流) — `src/lib/daily-ads.ts`

Pull yesterday's results from the client's Google Ads account (spend,
clicks, calls, direction requests, tracked orders). Run
`planToday(plan, history, today)`:

- Set today's budget to `todayBudget` (never more than 2x the even daily rate).
- Alerts: `budget_used` → pause; `cost_too_high` → propose pausing the weakest
  ad and testing a new one; `no_results` → check ads, profile and tracked
  number; `underspending` → check ads are approved and running.
- Ads run in the client's own Google Ads account with location assets so they
  can show on Google Maps. Ad spend is paid by the client directly to Google.
  Any change beyond today's budget needs the owner's OK.

## 2. Reviews — `src/lib/review-response.ts` (`POST /api/reviews/reply`)

Triage every new review with `triageReview`:

- `positive` and `autoPublish: true` → publish the template reply.
- `neutral` / `negative` → send the draft to the owner; reply within 24 hours.
- `critical` (food safety, allergy, injury, discrimination, legal) → message
  the owner **now** (within 1 hour), never auto-publish, follow up privately.
- `possiblePolicyViolation` → don't reply in kind; consider reporting the
  review to Google under its review policies.

Never argue, never reveal customer details, never offer anything for changing
a review, and never ask only happy customers for reviews.

## 3. Enquiries and orders — `speed-to-lead` and `order-automation` skills

New enquiries get the instant reply; new orders are checked with
`checkOrder`. Orders with `needsPerson` (allergies) go to the store manager.

## 4. Daily summary to the owner — `dailySummary`

Send the 5-line summary (Chinese or English) by WeChat or email, plus any
critical review or allergy order. Nothing else needs the owner's time.

Weekly: one Google post (`google-business-profile`), SEO check (`local-seo`).
Monthly: `monthly-report`. Stay inside the client's hour budget.
