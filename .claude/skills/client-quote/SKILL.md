---
name: client-quote
description: Turn a prospect's details into a ready-to-send quote - the WeChat or email message (Chinese or English), the numbers, the meeting prep checklist and agenda, dated actions, and product-name fixes. Use after a health check or whenever a prospect says yes, asks for a price, or has several stores.
---

# Client quote (input → output → meeting and actions)

Every number comes from code (`buildQuote` in `src/lib/quote.ts`, which uses
`storeQuoteEconomics` in `src/lib/economics.ts`). Never type a price by hand.
A quote that would lose money, or a founding offer beyond the first 3
clients, is refused.

## 1. Input

Copy `clients/_template.json` to `clients/<client>.json` (not committed —
`clients/` is git-ignored) and fill in what you know from the conversation:

- business, contact name, `language` (`zh`/`en`), `channel` (`wechat`/`email`)
- `tier` (Grace = Google Maps focus), `commitment` (`monthly`, `6m`, `12m`,
  or `founding` with `foundingClientNumber`)
- stores (or `storeCount`), products (names as the client wrote them, prices
  if known), assets (Google account, profile exists, phone, website, same company)
- optional: next busy period, plan doc link, meeting date

Leave unknowns out — they become the meeting checklist. Don't guess.

## 2. Output

```bash
npm run quote -- clients/<client>.json
```

Prints the message to send and writes `clients/out/<client>-quote.md` with
the numbers (including internal profit), the message, product-name fixes,
checklist, agenda and dated actions. The same is available as
`POST /api/quote`.

Before sending, read the message once: right business and contact name,
right number of stores, product fixes make sense. Internal profit figures
are in the brief only, never in the message.

## 3. Meeting and actions

- Send the message (and share the plan doc first if there is a link).
- Use the generated checklist and 30-minute agenda for the meeting.
- After the meeting, update the JSON (store details, prices, meeting date,
  confirmed store count) and re-run to get a final quote and dates.
- Work starts only after the first invoice is paid through PhLedgerTax —
  this is what keeps every client profitable from day one.
- When they say yes, generate the service agreement (`business-ops`) and get it
  signed before paid work starts.
- Then hand over to `google-business-profile` for setup and
  `weekly-client-routine` for the weekly work.
