---
name: lead-qualification
description: Decide whether an inbound email, form, message or phone call is a chargeable pay-per-lead lead, classify its type (enquiry, call, business) and channel, and produce the month's lead bill. Use when logging leads for a pay-per-lead client, when a client disputes a lead, or at month end.
---

# Lead qualification and billing

Pay per lead is PhLedger Marketing's pay-as-you-go plan for tiny and small
businesses. A **lead** is a new customer reaching the client's business. It is
charged when it arrives, **whether or not it becomes a sale**.

## Eligibility first: tiny businesses only

Pay per lead is only for businesses with **aggregated annual turnover under
$2 million** (`TINY_BUSINESS` in `src/lib/catalog.ts`) — the lowest
business-size threshold the ATO uses, the CGT small business entity test.
Aggregated turnover = the business's gross annual turnover plus that of its
affiliates and connected entities. Before logging any lead for a client:

1. The profile has a valid ABN (`isValidAbn` in `src/lib/leads.ts`) that is
   active on ABN Lookup, and `turnover_band = 'under2m'` with a dated
   declaration (`tiny_declared_at`).
2. If anything suggests turnover is $2 million or more (several sites, large
   staff, the owner says so), stop and recommend a monthly package instead.
3. Re-confirm the declaration every July, after the financial year ends.

## Billing rules

The rules are code, not judgement: `src/lib/leads.ts` (`billLeads`) applies
them and `tests/leads.spec.ts` proves them. Prices and limits are in
`LEAD_RULES` and `leadPrices` in `src/lib/catalog.ts`. This skill prepares the
inputs honestly; the code does the maths.

## For each inbound contact

1. **Is it a real potential customer?** Mark `spam: true` for spam, sales
   pitches, job seekers, suppliers, wrong numbers and robocalls. Quote the line
   that shows it.
2. **Is it an existing customer?** Check the client's customer list. If yes,
   `existingCustomer: true`.
3. **Type:**
   - `business` — a company asking about corporate orders, functions, contracts
     or wholesale (signature, company domain, or says so)
   - `call` — a phone call; record `callSeconds` from the call log
   - `enquiry` — anything else: email, website form, social message
4. **Channel:** where it came from (tracked number, form, QR code, "how did you
   hear about us?"). Use `unknown` rather than guess.
5. **Contact:** the email or phone exactly as received. The code normalises
   formats and spots repeats within 30 days, including from earlier months
   (pass last month's leads as `history`).

Write each lead as a row for `dm_leads` (see `supabase-schema.sql`).

## Disputes

A client may dispute a lead within 7 days. Uphold it (`disputeUpheld: true`)
unless the record shows a genuine new customer: their words asking to buy or
book, and a contact not already known to the client. When in doubt, uphold:
a happy client is worth more than $15.

## Month end

Run `billLeads(leads, { monthlyCap, freeLeadsRemaining, history })` and report:

```
Leads received: <n>   Chargeable: <n>   Free: <n>
Not charged: <n spam, n short calls, n repeats, n existing, n disputed>
Bill: $<total> (cap $<cap><, cap reached>)
By channel: <channel: n leads>
```

Then update the client's `free_leads_remaining` and pass the bill to
PhLedgerTax for the invoice.
