---
name: daily-maps-routine
description: Run a client's daily Google Maps routine - today's ad budget and alerts (daily 投流), new reviews triaged with drafted replies (bad reviews escalated), new enquiries and orders from every channel, and the 5-line daily WeChat/email summary for the owner. Use every morning for clients with daily ads, the SEO & Reputation add-on or Order Automation.
---

# Daily Google Maps routine

Ten minutes a day, mostly automated. Each step uses tested code; never
work numbers out by hand.

## Who approves (check before every action)

Run `decide(action, client.approvals)` from `src/lib/approvals.ts` before
anything is published, sent or spent, and log it with `auditEntry`:

- `auto` — do it now (replies, confirmations, budget within plan, pausing ads;
  in `auto_simple` mode also thank-you replies, Google posts, loyalty messages).
- `zhi_li` — put it in Zhi Li's approval batch.
- `zhi_li_then_client` — Zhi Li, then the client (prices, offers, extra ad
  spend, and anything the client asked to see).
- `person_sends` — RedNote: draft only, a person posts.
- `escalate_owner` — critical review or allergy order: tell the owner now.

The goal behind every action: more leads, more purchases, loyal customers,
by beating expectations on price and quality — never by cutting corners.

## Pilot mode (free tools only)

During a pilot there is no SMS or tracked number: replies go through Meta
Business Suite, WhatsApp Business, Gmail and the store's WeChat (drafted with
`firstReply`, sent by the tool or a person); orders come in on the Google Form;
results come from Google Business Profile insights and GA4. See
`src/lib/pilot-stack.ts`.

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
