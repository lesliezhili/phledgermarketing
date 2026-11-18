---
name: order-automation
description: Set up and run order automation for a client across Instagram, Facebook, RedNote (小红书), WeChat, phone and the website - every order checked the same way, confirmed, sent to the kitchen and followed up - plus the marketing posts that bring orders on each channel. Use when a client takes orders through social media or by phone, or buys the Order Automation add-on.
---

# Order automation across channels

Code: `src/lib/orders.ts` (`POST /api/orders/check`), tested in
`tests/automation.spec.ts`. Pricing: `ORDER_AUTOMATION` in `catalog.ts`.

## Setup

1. Menu: every product with sizes, prices and days of notice needed
   (`ProductOption`). Use the corrected names from `client-quote`.
2. Connect channels within each platform's rules (`CHANNEL_RULES`):
   - **Instagram / Facebook:** Meta's official messaging API on the business
     account and Page. Auto-replies are allowed; Meta limits replies to a
     window after the customer's last message.
   - **RedNote (小红书):** no public messaging API for this. AI drafts the
     reply and a person sends it. Put the order link in the profile and notes.
   - **WeChat:** verified Official Account / WeCom (see `speed-to-lead`).
   - **Phone:** missed calls get the speed-to-lead SMS with the order link;
     answered calls go into a 30-second staff form. No AI voice on calls unless
     the owner asks, and callers are always told it's automated.
   - **Website:** the tracked order page.
3. Staff see one kitchen ticket per order (`kitchenTicket`) and never retype.

## Each order

- `checkOrder` — product (misspellings matched), size, enough notice, date.
- Errors → reply asking for the missing detail. `needsPerson` (allergies,
  dietary notes) → a person confirms with the customer; never auto-confirm.
- `orderConfirmation` on the same channel, in the customer's language.
- `followUps`: confirmation, reminder the day before, thank-you with a review
  link the day after. Offers (e.g. next birthday) only with marketing consent.

## Marketing on each channel

Use `content-calendar` for posts. Instagram and Facebook posts can be
scheduled through Meta; RedNote notes are drafted (Chinese, note style, real
photos, order link in profile) and posted by a person. Influencer content is
reused only with the creator's permission.
