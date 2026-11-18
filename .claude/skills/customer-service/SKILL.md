---
name: customer-service
description: Set up and run a client's AI Customer Service across presale (get customers - enquiries, prices, hours, bookings, orders) and aftersales (keep customers - order status, how-to, faults, complaints, refunds, cancellations, reorders, thank-yous), on the client's website (AI agent chat and enquiry email) and phone/mobile (calls and SMS), plus WhatsApp, Messenger, Instagram and WeChat. Use when onboarding the AI Customer Service add-on, when updating a client's approved facts or FAQs, for daily hand-overs, and for the monthly service measures.
---

# AI Customer Service (presale + aftersales)

Code: `src/lib/customer-service.ts` (`handleMessage`, `aftersalesPlan`,
`csMeasures`), API `POST /api/customer-service/reply`, demo `/customer-service`.
Price: `AI_CUSTOMER_SERVICE` in `src/lib/catalog.ts`; profit check
`aiCustomerServiceEconomics` (tested in `tests/customer-service.spec.ts`).

## Channels

| Channel | How it connects | Notes |
| --- | --- | --- |
| Website AI agent (`webchat`) | Chat widget on the client's site calling the API | PhLedger's own runs on phledger.com |
| Website email / form (`email`) | Enquiry form or inbox forwarding | Links stay clickable |
| Phone (`phone`) | Voice agent, or voicemail transcript; missed call → SMS | Disclosure and recording notice first; links never read aloud, texted after (`smsFollowUp`) |
| Mobile SMS (`sms`) | Tracked mobile number | Opt-out line on first contact |
| WhatsApp, Messenger, Instagram, WeChat | Meta / WhatsApp Business / WeChat Official Account | WeChat replies only inside its reply window |

## Setup (2 hours)

1. Collect the **approved facts** (`Knowledge`): hours, address, published
   prices, booking and order links, review link, returns policy in the
   owner's words, and 10–20 FAQs. The AI only says what is here.
2. Choose the approval mode (`zhi_li` by default). Hard rules hold in every mode.
3. Connect the website and phone first, then the social channels.
4. Test 10 real messages per stage with the owner before going live.

## Every day (in the daily routine)

- Hand-overs: complaints (Zhi Li approves the reply, within 4 h), refunds
  (owner and Zhi Li decide, within 1 business day), safety or legal
  (owner told now, call within 1 h), bookings and order status (owner/staff).
- Each how-to question the AI couldn't answer → draft an FAQ for the owner to approve.

## After every purchase (`aftersalesPlan`)

Thank-you → check-in → honest review request to **every** customer (never
filtered by happiness) → care tip for products → reorder reminder and
win-back **only with marketing consent**; any offer needs the owner's OK.

## Monthly (in the monthly report)

`csMeasures`: conversations (presale vs aftersales), share answered within
60 seconds, share answered by AI, hand-overs on time, complaints. Compare
with last month and with repeat purchases in the funnel.

## Never

Invent a price or fact; promise a refund, credit or discount; say "no
refunds" or anything that limits Australian Consumer Law rights; argue with
a customer; message anyone who said STOP.

## AI Front Desk (pay per order) and phledger.com

AI Front Desk moved here from phledger.com: missed calls (voice agent or
text-back within 60 seconds) and Google reviews, paid per order captured
($8 standard / $20 high value, no monthly or setup fee, owner's cap, first
20 orders free). Code `src/lib/front-desk.ts`; economics
`frontDeskEconomics`, `frontDeskMinOrders` (onboard only when the business
is likely to reach the minimum orders a month; otherwise offer a package);
page `/front-desk`.

phledger.com keeps its `/frontdesk` page and integrates through the API
(browser calls allowed from phledger.com only, `src/lib/integration.ts`):

| Endpoint | Use |
| --- | --- |
| `GET /api/front-desk/offer?lang=en\|zh` | Prices and terms (single source of truth) |
| `POST /api/front-desk/estimate` | Missed-call calculator |
| `POST /api/front-desk/apply` | Pilot application (Supabase `dm_front_desk_applications`; email fallback) |
| `POST /api/front-desk/call` | Telephony webhook: caller reply + owner summary (server to server) |

Check new applications daily; at month end run `billFrontDesk` and list every
order with its reason (charged, duplicate, spam, disputed, pilot, over cap).
