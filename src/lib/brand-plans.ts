// PHledger's own brand programme for 2027 (the first user of
// src/lib/brand-programme.ts). Themes follow phledger.com's positioning.
// Customer stories are left empty until a customer gives written permission.

import type { Partner, QuarterTheme } from './brand-programme'

export const PHLEDGER_2027: QuarterTheme[] = [
  {
    title: 'Data foundations before AI',
    narrative: 'AI only works on data that is managed, current and delivered reliably.',
    flagship: 'The data foundations checklist: 20 questions to answer before your first AI project',
    angles: [
      'Five signs your data isn\'t ready for AI yet',
      'One trusted number per measure: where reporting projects really start',
      'Who owns this number? A practical guide to data ownership',
    ],
    webinar: 'Is your data ready for AI? A one-hour self-assessment',
    partners: ['Databricks', 'Snowflake'],
    markets: ['au', 'ca'],
  },
  {
    title: 'Choosing your cloud and data platform',
    narrative: 'Decide on your own workloads, in your own region, not on a sales pitch.',
    flagship: 'The decision sprint playbook: AWS, Azure or Google Cloud on your own workloads',
    angles: [
      'Keeping data in-country: Australian and Canadian cloud regions compared',
      'Lakehouse or warehouse? How to choose without a six-month evaluation',
      'Writing the exit plan before you sign',
    ],
    webinar: 'AWS, Azure or Google Cloud? Running a two-week decision sprint',
    event: { kind: 'roundtable', city: 'Melbourne', topic: 'Platform decisions finance and technology leaders regret, and how to avoid them' },
    partners: ['AWS', 'Microsoft', 'Google Cloud'],
    markets: ['au', 'ca', 'qc'],
  },
  {
    title: 'AI agents in production, with people in charge',
    narrative: 'AI recommends; your people decide. Here is how we run our own business that way.',
    flagship: 'How we run a business on AI agents, and exactly where people stay in the loop',
    angles: [
      'The approval harness: which AI actions run alone and which wait for a person',
      'Rules first, AI second: why our chat agent answers prices without a language model',
      'Testing AI that talks to customers: evaluation sets and red-team prompts',
    ],
    webinar: 'From pilot to production: running AI agents safely in a small team',
    event: { kind: 'executive_dinner', city: 'Sydney', topic: 'AI in production: what boards should ask before saying yes' },
    partners: ['Anthropic'],
    markets: ['au', 'ca'],
  },
  {
    title: 'Train while we build: capability that stays',
    narrative: 'When the engineers leave, your team should be able to run and extend the platform.',
    flagship: 'An upskilling plan for data teams: what to learn by shipping real work',
    angles: [
      'Pairing, reviews and workshops: how skills actually transfer',
      'The handover checklist: runbooks, tests and on-call',
      'Mixing AI tutors to keep training costs low',
    ],
    webinar: 'Building lasting data and AI capability in your team',
    markets: ['au', 'ca', 'qc'],
  },
]

/** Cloud and data partner programs to join; co-funding (MDF) needs membership and each program's own eligibility. */
export const PHLEDGER_PARTNERS: Partner[] = [
  { name: 'AWS', program: 'AWS Partner Network', status: 'not_joined', coFunding: 'unknown' },
  { name: 'Microsoft', program: 'Microsoft AI Cloud Partner Program', status: 'not_joined', coFunding: 'unknown' },
  { name: 'Google Cloud', program: 'Google Cloud Partner Advantage', status: 'not_joined', coFunding: 'unknown' },
  { name: 'Databricks', program: 'Databricks partner program', status: 'not_joined', coFunding: 'unknown' },
  { name: 'Snowflake', program: 'Snowflake partner network', status: 'not_joined', coFunding: 'unknown' },
  { name: 'Anthropic', program: 'Anthropic partner program', status: 'not_joined', coFunding: 'unknown' },
]
