---
name: speed-to-lead
description: Set up and run a client's instant replies to new enquiries and missed calls - the automated first message that asks the trade's qualifying questions and offers a quote time, then hands over to the owner. Use when onboarding a service business (mowing, cleaning, tree, gardening, trades), when tuning their replies, or when reviewing reply speed.
---

# Speed-to-lead replies

Owners on the tools can't answer the phone. Replying within 5 minutes makes a
lead far more likely to be qualified than replying within an hour, so every
enquiry and missed call gets an honest automated first reply within a minute.

The reply is code: `firstReply` in `src/lib/speed-to-lead.ts`, served by
`POST /api/leads/reply` and tested in `tests/speed-to-lead.spec.ts`. The
connector (SMS, email, Messenger, call tracking) calls the API and sends the
text.

## Setup for a client

1. Pick the trade (`mowing`, `cleaning`, `tree`, `gardening`, `general`).
   If none fits, add one to `QUALIFYING_QUESTIONS` with the 3 questions the
   owner always asks before quoting, and a test.
2. Booking link: the owner's calendar page for quote visits (https only).
3. Sources: give the client a tracked number and tracked form. Record each
   lead's `source`. Only PhLedger's tracked sources can be charged per lead;
   hipages, Airtasker, Bark, ServiceSeeking and franchise head-office leads
   still get the instant reply but are **never** charged per lead.
4. Missed calls: forward unanswered calls to call tracking, which posts
   `{ missedCall: true }` so the reply starts with an apology.
5. Test it: send one enquiry and one missed call, and check the reply arrives
   within 60 seconds (`metReplyTarget`).

## Rules (already in the code; don't remove)

- Say it is the business's automated assistant; the owner follows up personally.
- Every SMS names the business and says "Reply STOP to opt out" (Spam Act 2003).
- One reply only. No chasing sequences without the owner's approval.
- Never quote a price or promise a time the owner hasn't approved.

## Weekly

In `weekly-client-routine`, report: leads by source, median reply time,
share replied within 60 seconds, and leads the owner hasn't followed up after
24 hours.
