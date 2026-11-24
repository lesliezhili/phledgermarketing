// PhLedger Marketing's own monthly scorecard — the one-person company's
// numbers, by stage of the SOP (content → closing → delivery → automation),
// with cash break-even first.
//
// Break-even rule: cash in must cover cash out (tools, tracked numbers, SMS,
// overhead) every month. Time is reported separately as an hourly rate, so
// it's clear whether the business pays Zhi Li a fair wage.

import { COSTS } from './economics'
import type { AuditEntry } from './approvals'

export interface ScorecardClient {
  name: string
  plan: string // e.g. "Faithful + 2 add-ons", "Pilot", "Pay per lead"
  cashIn: number // paid this month (excl. GST)
  hoursUsed: number
  hoursBudget: number
  satisfaction?: number // 0–10 "how likely are you to recommend us?"
}

export interface ScorecardInput {
  month: string // YYYY-MM
  pipeline: {
    healthChecks: number
    quotesSent: number
    pilotsStarted: number
    pilotsConverted: number
    newPaying: number
    churned: number
    referrals: number // new prospects referred by clients
  }
  clients: ScorecardClient[]
  cashOut: { tools: number; trackedNumbers: number; sms: number; other: number }
  overhead?: number
  audit?: AuditEntry[]
  correctedActions?: number // actions that had to be fixed or undone
  minutesSavedPerAutoAction?: number
  quoteReplyHours?: number[] // hours from first enquiry to quote sent, per prospect
}

export interface Scorecard {
  cash: { in: number; out: number; profit: number; breakEven: boolean }
  hours: { used: number; effectiveHourly: number | null; overBudget: string[] }
  closing: { quoteRate: number | null; pilotConversion: number | null; medianQuoteHours: number | null }
  delivery: { activeClients: number; churnRate: number | null; avgSatisfaction: number | null; promoterShare: number | null; referrals: number }
  automation: { actions: number; autoShare: number | null; hoursSaved: number; errorRate: number | null }
  flags: string[]
}

const r2 = (n: number) => Math.round(n * 100) / 100
const ratio = (a: number, b: number) => (b ? r2(a / b) : null)

export function buildScorecard(s: ScorecardInput): Scorecard {
  const cashIn = s.clients.reduce((t, c) => t + c.cashIn, 0)
  const overhead = s.overhead ?? COSTS.monthlyOverhead
  const cashOut = s.cashOut.tools + s.cashOut.trackedNumbers + s.cashOut.sms + s.cashOut.other + overhead
  const hoursUsed = s.clients.reduce((t, c) => t + c.hoursUsed, 0)
  const overBudget = s.clients.filter(c => c.hoursUsed > c.hoursBudget).map(c => c.name)

  const sat = s.clients.map(c => c.satisfaction).filter((x): x is number => x !== undefined)
  const audit = s.audit ?? []
  const auto = audit.filter(a => a.route === 'auto').length
  const minutes = s.minutesSavedPerAutoAction ?? 5
  const replies = [...(s.quoteReplyHours ?? [])].sort((a, b) => a - b)
  const median = replies.length ? replies[Math.floor((replies.length - 1) / 2)] : null

  const card: Scorecard = {
    cash: { in: r2(cashIn), out: r2(cashOut), profit: r2(cashIn - cashOut), breakEven: cashIn >= cashOut },
    hours: { used: r2(hoursUsed), effectiveHourly: hoursUsed ? r2((cashIn - cashOut) / hoursUsed) : null, overBudget },
    closing: {
      quoteRate: ratio(s.pipeline.quotesSent, s.pipeline.healthChecks),
      pilotConversion: ratio(s.pipeline.pilotsConverted, s.pipeline.pilotsStarted),
      medianQuoteHours: median,
    },
    delivery: {
      activeClients: s.clients.length,
      churnRate: ratio(s.pipeline.churned, s.clients.length + s.pipeline.churned),
      avgSatisfaction: sat.length ? r2(sat.reduce((a, b) => a + b, 0) / sat.length) : null,
      promoterShare: sat.length ? r2(sat.filter(x => x >= 9).length / sat.length) : null,
      referrals: s.pipeline.referrals,
    },
    automation: {
      actions: audit.length,
      autoShare: ratio(auto, audit.length),
      hoursSaved: r2((auto * minutes) / 60),
      errorRate: ratio(s.correctedActions ?? 0, audit.length),
    },
    flags: [],
  }

  const f = card.flags
  if (!card.cash.breakEven) f.push(`Cash short by $${r2(cashOut - cashIn)}: no new unpaid work until paying clients cover costs`)
  if (overBudget.length) f.push(`Over hour budget: ${overBudget.join(', ')} — quote extra work or move them up a package`)
  if (card.hours.effectiveHourly !== null && card.hours.effectiveHourly < COSTS.hourlyCost) f.push(`Earning $${card.hours.effectiveHourly}/hour, below the $${COSTS.hourlyCost} target`)
  if (median !== null && median > 24) f.push(`Quotes take ${median} hours (median): aim for same day`)
  if (card.closing.pilotConversion !== null && card.closing.pilotConversion < 0.5) f.push('Under half of pilots convert: tighten who gets a pilot')
  if (card.delivery.avgSatisfaction !== null && card.delivery.avgSatisfaction < 8) f.push('Client satisfaction under 8/10: call each client this week')
  if (card.automation.errorRate !== null && card.automation.errorRate > 0.02) f.push('More than 2% of actions needed fixing: switch affected clients back to Zhi Li approval')
  return card
}

const pct = (n: number | null) => (n === null ? '—' : `${Math.round(n * 100)}%`)
const val = (n: number | null, unit = '') => (n === null ? '—' : `${n}${unit}`)

export function scorecardMarkdown(month: string, c: Scorecard): string {
  return [
    `# PhLedger Marketing — scorecard ${month}`,
    '',
    `**Cash:** in $${c.cash.in} · out $${c.cash.out} (incl. overhead) · ${c.cash.profit >= 0 ? 'profit' : 'loss'} $${Math.abs(c.cash.profit)} · ${c.cash.breakEven ? '✅ break-even' : '❌ below break-even'}`,
    `**Time:** ${c.hours.used} hours · $${val(c.hours.effectiveHourly)} per hour after costs`,
    '',
    '| Stage | Measure | This month |',
    '| --- | --- | --- |',
    `| Closing | Health checks → quotes | ${pct(c.closing.quoteRate)} |`,
    `| Closing | Pilots → paying | ${pct(c.closing.pilotConversion)} |`,
    `| Closing | Median hours to quote | ${val(c.closing.medianQuoteHours)} |`,
    `| Delivery | Active clients | ${c.delivery.activeClients} |`,
    `| Delivery | Churn | ${pct(c.delivery.churnRate)} |`,
    `| Delivery | Satisfaction (0–10) | ${val(c.delivery.avgSatisfaction)} |`,
    `| Delivery | Promoters (9–10) | ${pct(c.delivery.promoterShare)} |`,
    `| Delivery | Referrals | ${c.delivery.referrals} |`,
    `| Automation | Actions run | ${c.automation.actions} |`,
    `| Automation | Done automatically | ${pct(c.automation.autoShare)} |`,
    `| Automation | Hours saved | ${c.automation.hoursSaved} |`,
    `| Automation | Error rate | ${pct(c.automation.errorRate)} |`,
    '',
    c.flags.length ? '## Act on' : '## All on track',
    ...c.flags.map(x => `- ${x}`),
    '',
  ].join('\n')
}
