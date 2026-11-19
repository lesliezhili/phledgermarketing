---
name: weekly-client-routine
description: Run one PhLedger Marketing client's weekly routine as the agent - perceive (orders, leads, ad results), plan (this week's posts, ads, outreach), act (draft everything for Zhi Li to approve). Use every Monday per client, or when asked to "run the week" for a client.
---

# Weekly client routine (the Agent layer)

PhLedger Marketing is a one-person company. This routine is how Zhi Li serves
each client inside a strict monthly hour budget (Grace 1 h, Faithful 3 h,
Abundant 7 h; pay per lead 15 minutes plus about 3 minutes a lead — see
`HOURS` in `src/lib/economics.ts`): the agent prepares everything, Zhi Li
approves, the scheduler and connectors publish.


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

## Inputs

- The client profile (`client-profile.md` in this folder shows the fields).
  Read it first; never guess prices, margins or capacity.
- Last week's data, from connectors where available (see `.claude/skills/README.md`):
  bookings and leads (Supabase `dm_bookings`, `dm_leads`), ad results, Google
  Business Profile views and reviews, social post results.
- The client's package or pay-per-lead plan (`src/lib/catalog.ts`).

## Steps

1. **Perceive.** Summarise last week in five lines: sales or bookings, leads by
   type and channel, ad spend and cost per lead, new reviews, best and worst post.
   If a data source is missing, say so; do not invent numbers.
2. **Check the basics.** Is the offer, price and way to buy still clear on every
   channel? If not, plan a fix with the `offer-and-print` skill before anything else.
3. **Plan.** Pick this week's focus from the client's calendar (busy periods,
   launches, holidays) and the method step they are in (Diagnose, Fix the
   basics, Launch push, Grow and retain, Report and decide).
4. **Act - draft, don't publish.** Use the matching skills:
   - posts and short videos: `content-calendar`
   - Google posts and review replies: `google-business-profile`
   - ad changes: `ad-campaign`
   - customer emails: `loyalty-emails`
   - new leads to bill (pay-per-lead clients): `lead-qualification`
5. **Hand over for approval.** One message for Zhi Li with: the 5-line summary,
   the plan, every draft, and the decisions needed (budget moves, offers).

## Output

```
## <Client> — week of <date>
Last week: <5 lines>
This week's focus: <1 line>
Drafts for approval: <numbered list, each ready to schedule>
Decisions for Zhi Li: <bulleted, each with a recommendation>
Data gaps: <what was missing>
```

## Rules

- Stay inside the client's hour budget. If a request needs more, quote it as
  extra work or recommend the next package; never absorb it unpaid.
- Batch approvals across clients (one sitting for all drafts) and let the
  client send photos from their phone instead of on-site content days.

- Package clients get the volume their package includes (posts, channels,
  outreach contacts); do not over-deliver one week and under-deliver the next.
- Pay-per-lead clients: focus on actions that bring enquiries and calls, and
  keep the monthly lead bill under their cap.
- Faith-driven, honest marketing: no fake scarcity, fake reviews or invented
  claims. Every number in a post must come from the client.
