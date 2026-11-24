# Client quote inputs

One JSON file per client, copied from `_template.json`. Real client files and
the generated briefs in `out/` are **not committed** (see `.gitignore`):
they hold client contact details.

```bash
cp clients/_template.json clients/my-client.json   # fill it in
npm run quote -- clients/my-client.json            # prints the message, writes clients/out/my-client-quote.md
```

| Field | Values | Notes |
| --- | --- | --- |
| `business`, `contactName` | text | Used in the message |
| `language` | `zh` \| `en` | Message language |
| `channel` | `wechat` \| `email` | Where it will be sent |
| `tier` | `Grace` \| `Faithful` \| `Abundant` | Grace = Google Maps focus |
| `commitment` | `monthly` \| `6m` \| `12m` \| `founding` | `founding` needs `foundingClientNumber` 1–3 |
| `stores` / `storeCount` | list / number | First store = main store; missing details go on the checklist |
| `products` | `{ name, price? }` | Names are spell-checked; missing prices go on the checklist |
| `assets` | Google account, profile exists, phone, website, same company | Unknowns go on the checklist |
| `nextBusyPeriod` | `{ en, zh }` | Optional: what the first push aims at |
| `docLink`, `meetingDate` | link, `YYYY-MM-DD` | Optional |
| `approvals` | `{ mode, clientApproves, maxDailyAdBudget }` | `mode`: `zhi_li` (default), `zhi_li_and_client`, or `auto_simple` (full automation for simple ads and thank-you replies). Hard safety rules apply in every mode — see `src/lib/approvals.ts` |

Unknown fields can be left out; the quote asks for them in the checklist. A
quote that would lose money is refused (exit code 2).
