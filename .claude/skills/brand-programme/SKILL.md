---
name: brand-programme
description: Run a B2B brand programme for PHledger or a client - four quarterly campaign themes a year, each with a flagship guide or whitepaper, articles, a LinkedIn campaign, a webinar, a roundtable or executive event, partner campaigns with vendor co-funding (MDF), a press release and a quarter report. Use at the start of each quarter (plan and brief), weekly (keep content flowing), around every event (run-sheet), and at quarter end (report and next plan).
---

# B2B brand programme

Code: `src/lib/brand-programme.ts` (planner, event run-sheets, co-funding
tracker, quarter report, social posts, economics), PHledger's 2027 themes and
partners in `src/lib/brand-plans.ts`. Sold as the B2B Brand Programme add-on
(Lean $690 / Standard $990 / Full $1,490 a month + $490 setup; tested for
margin in `tests/brand-programme.spec.ts`).

## Start of each quarter (about 2 hours)

1. Confirm the theme: title, the one idea it argues, the flagship, three
   article angles, the webinar, the event and the partners.
2. `npm run brand-plan -- <first Monday> <lean|standard|full>` writes every
   asset with due date, owner and approval route, plus event run-sheets and
   the social posts backing the quarter (`clients/out/`).
3. Clear the ⚠️ items: no customer story without written permission; no
   partner campaign or co-funding until the partner program accepts you.
4. Brief the experts; book the event (event spend is the client's approval).

## Weekly

Keep content flowing in the order planned: landing page and LinkedIn
campaign first, flagship in week 3, articles, newsletter to consented
subscribers only, customer story, webinar in week 7, event in weeks 10–11.
Add the quarter's posts (`themePostIdeas`) to the weekly social run.

## Every event (`eventRunSheet`)

Budget approval at 6 weeks → page and invitations at 5 → reminders at 3 →
speaker briefing pack at 2 → final numbers → thank-you and recording the day
after → follow-ups at 1 week → recap and clips at 2 weeks → event report at 30 days.

## Partner co-funding (`coFundingStatus`)

Never spend before written approval; send proof of performance before it is
due; report pipeline per co-funded dollar. Check each program's own rules.

## Quarter end (`quarterReport`)

Followers, engagement, flagship downloads, webinar and event attendance,
leads, pipeline and spend, against last quarter, with the changes to make.
Feed the changes into the next quarter's theme and plan.

## Approvals (hard rules)

Case studies (name a customer), press releases and event spending always
need the client's sign-off; long-form content is never published automatically.
No invented numbers, clients or results anywhere.
