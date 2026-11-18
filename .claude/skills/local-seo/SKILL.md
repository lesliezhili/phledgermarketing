---
name: local-seo
description: Do local SEO on a client's website so it ranks with their Google Maps profile - LocalBusiness schema, page titles and descriptions, local keywords, and a check that name/address/phone match Google exactly. Use when setting up the SEO & Reputation add-on, after any change to store details, and in the monthly check.
---

# Website local SEO

Code: `src/lib/local-seo.ts` (tested in `tests/automation.spec.ts`).

## Setup (per store page)

1. Fill a `StoreSeo` record from the client profile: name, type (`Bakery`,
   `CafeOrCoffeeShop`, `Restaurant`), address, phone, hours, cuisine, menu
   items, and Instagram / Facebook / RedNote links (`sameAs`).
2. `napMismatches(site, google)` must return `[]`. Fix the website or the
   Google profile until name, address and phone match exactly.
3. Add `localBusinessJsonLd(store)` to the page head as
   `<script type="application/ld+json">`.
4. Use `metaTags(store, focus)` for the page title (≤ 60 characters) and meta
   description (≤ 155). Focus = what people search for, e.g. "Asian fusion
   brunch and whole cakes".
5. Use `keywordIdeas(store, extra)` to choose 5–10 phrases (e.g. "ube cake
   fitzroy", "brunch fitzroy") for page headings, image alt text and Google
   posts. Write for people; never stuff keywords.

If the client has no website, the tracked order page PhLedger builds becomes
the store page; put the schema and titles there.

## Monthly

Re-run `napMismatches`, check the pages still load fast on a phone, update
menu items and seasonal phrases, and report which phrases brought visits.
