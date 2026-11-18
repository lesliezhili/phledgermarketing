---
name: monthly-report
description: Produce a client's one-page monthly marketing report - results against break-even, leads and sales by channel, ad spend and cost per lead, what worked, what changes next month, and the renew/upgrade/stop recommendation at day 90. Use at each month end for every client.
---

# Monthly report (one page)

The owner should know in 30 seconds whether marketing paid for itself.

## Inputs

Client profile (prices, margin), the month's sales or bookings, leads
(`dm_leads`; for pay-per-lead clients the bill from `lead-qualification`), ad
spend and results, Google Business Profile and social results, and last
month's report.

## Calculate

- **Cost this month** = our fee (package price, or the pay-per-lead bill) + ad spend
- **Gross profit from marketing** = extra sales × average sale × margin
  (extra = above the baseline in the profile; mark as estimate if sales data is partial)
- **Break-even sales** = cost ÷ (average sale × margin)
- **Cost per lead** = cost ÷ chargeable leads

## Funnel (the goal)

Run `funnel(...)` from `src/lib/funnel.ts` with leads, orders, customers,
repeat customers, Google rating and reply speed. Report the conversion and
repeat rates against `FUNNEL_TARGETS`, and make `focus` (the weakest step)
next month's first change.

## Write

```
# <Client> — <Month> report
Headline: <one sentence: paid for itself / not yet, with the numbers>
| Measure | This month | Last month | Target |
(sales, leads by type, cost per lead, Google reviews, followers)
What worked: <2–3 bullets with numbers>
What didn't: <1–2 bullets>
Next month: <3 changes>
<Day 90 only> Recommendation: renew / upgrade / move to pay per lead / stop, and why
```

Be honest when results are behind; say what will change. Never round in the
client's favour or hide a bad month. The report is generated automatically
from the data; Zhi Li reviews it before the monthly call.
