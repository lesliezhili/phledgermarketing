---
name: business-ops
description: Run PhLedger Marketing's own business - generate a client's service agreement, produce the monthly scorecard (cash break-even, closing, delivery, automation), and write a case study from measured before/after results. Use when a client accepts a quote or pilot, at each month end, and on a pilot's day 30.
---

# PhLedger business operations

One person runs PhLedger, so the business itself is run like a client:
from tested code, with break-even first.

## 1. Service agreement — when a client says yes

```bash
npm run agreement -- clients/<client>.json
```

Uses the same file as the quote (add `pilot`, `addOns`, `clientLegalName`,
`clientAbn`, `startDate`). Writes `clients/out/<client>-agreement.md`.
Chinese-speaking clients get a Chinese summary; English terms prevail.

- Fill PhLedger's ABN and email (`PROVIDER` in `src/lib/agreement.ts`) once.
- **Have an Australian lawyer review the template once before first use.**
- Break-even rules are in the agreement: payment in advance, work starts only
  after payment (the free pilot is the only exception, and it uses free tools),
  and ad spend is paid by the client directly.
- Both sign before any paid work starts. Invoice through PhLedgerTax.

## 2. Monthly scorecard — first working day of the month

Copy `clients/_scorecard-template.json` to `clients/scorecard-<YYYY-MM>.json`,
fill in the month (pipeline counts, each client's cash, hours and 0–10
satisfaction, cash costs, the approval audit log), then:

```bash
npm run scorecard -- clients/scorecard-<YYYY-MM>.json
```

Act on every flag before taking on new work. Break-even first: if cash is
short, no new unpaid work (pilots, free extras) until paying clients cover it.

## 3. Case study — a pilot's day 30 (or any 30/90-day review)

Record the baseline **before day 1** (Google profile insights for the previous
30 days, tracked orders, review count). On day 30, copy
`clients/_case-template.json`, fill in before/after numbers and sources, then:

```bash
npm run case-study -- clients/<client>-case.json zh   # or en
```

Only measured numbers; falls are shown as falls; the client's own words only
with permission. Publish only after `clientApproved` is true (the client has
approved the final text), anonymised if they prefer.
