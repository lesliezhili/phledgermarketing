// Pay-per-lead billing.
//
// A lead is a new customer reaching the client's business (email, form,
// message or phone call). It is charged when it arrives, whether or not it
// becomes a sale. These rules decide which leads are chargeable and what the
// client pays for a billing month. Prices and limits come from catalog.ts.

import { LEAD_RULES, leadPriceFor, type LeadType } from './catalog'
import { PLATFORM_SOURCES, isChargeableSource, type LeadSource } from './speed-to-lead'

export interface Lead {
  id: string
  type: LeadType
  contact: string // email address or phone number of the person
  receivedAt: string // ISO date-time
  callSeconds?: number // for calls
  spam?: boolean // spam, sales pitch, job seeker, wrong number
  existingCustomer?: boolean
  disputeUpheld?: boolean // client disputed it in time and we could not show it was genuine
  source?: LeadSource // where it came from; platform leads are never charged per lead
}

export type ChargeReason =
  | 'charged'
  | 'free lead'
  | 'monthly cap'
  | 'spam'
  | 'existing customer'
  | 'short call'
  | 'duplicate'
  | 'disputed'
  | 'platform lead'
  | 'untracked'

export interface LeadCharge {
  lead: Lead
  amount: number
  reason: ChargeReason
}

export interface BillOptions {
  monthlyCap?: number
  freeLeadsRemaining?: number
  history?: Lead[] // earlier leads (e.g. last month), used only to spot duplicates
}

export interface Bill {
  charges: LeadCharge[]
  total: number
  chargeable: number // leads that counted (charged, free or capped)
  freeLeadsUsed: number
  capReached: boolean
}

const DAY_MS = 864e5

/** Same person regardless of formatting: lower-case emails, digits-only phones. */
export function normaliseContact(contact: string): string {
  const c = contact.trim().toLowerCase()
  if (c.includes('@')) return c
  const digits = c.replace(/\D/g, '')
  // Treat +61 4xx and 04xx as the same Australian mobile.
  return digits.startsWith('61') && digits.length === 11 ? '0' + digits.slice(2) : digits
}

/** Why a lead is not chargeable at all, or null if it is a genuine new lead. */
function excludedReason(lead: Lead, seen: Map<string, number>): ChargeReason | null {
  if (lead.spam) return 'spam'
  // The client already pays hipages, Airtasker, Bark, ServiceSeeking or the
  // franchise for these; charging again would be double-charging.
  if (lead.source && PLATFORM_SOURCES.includes(lead.source)) return 'platform lead'
  // Only leads that came through a source PhLedger tracks can be charged.
  if (!isChargeableSource(lead.source)) return 'untracked'
  if (lead.existingCustomer) return 'existing customer'
  if (lead.type === 'call' && (lead.callSeconds ?? 0) < LEAD_RULES.minCallSeconds) return 'short call'
  const last = seen.get(normaliseContact(lead.contact))
  const at = Date.parse(lead.receivedAt)
  if (last !== undefined && at - last < LEAD_RULES.duplicateDays * DAY_MS) return 'duplicate'
  if (lead.disputeUpheld) return 'disputed'
  return null
}

/** Bill one month of leads. Leads are processed in the order they arrived. */
export function billLeads(leads: Lead[], opts: BillOptions = {}): Bill {
  const cap = opts.monthlyCap ?? LEAD_RULES.defaultMonthlyCap
  let freeLeft = opts.freeLeadsRemaining ?? 0
  const byTime = (a: Lead, b: Lead) => Date.parse(a.receivedAt) - Date.parse(b.receivedAt)

  // Last contact time per person, starting from earlier history.
  const seen = new Map<string, number>()
  for (const h of [...(opts.history ?? [])].sort(byTime)) {
    seen.set(normaliseContact(h.contact), Date.parse(h.receivedAt))
  }

  const charges: LeadCharge[] = []
  let total = 0
  let chargeable = 0
  let freeLeadsUsed = 0
  let capReached = false

  for (const lead of [...leads].sort(byTime)) {
    const reason = excludedReason(lead, seen)
    // Any contact (even an excluded one) restarts the duplicate window,
    // except spam, which is not a real person.
    if (!lead.spam) seen.set(normaliseContact(lead.contact), Date.parse(lead.receivedAt))
    if (reason) {
      charges.push({ lead, amount: 0, reason })
      continue
    }
    chargeable++
    if (freeLeft > 0) {
      freeLeft--
      freeLeadsUsed++
      charges.push({ lead, amount: 0, reason: 'free lead' })
      continue
    }
    const price = leadPriceFor(lead.type)
    const amount = Math.min(price, Math.max(0, cap - total))
    if (amount < price) capReached = true
    total += amount
    charges.push({ lead, amount, reason: amount < price ? 'monthly cap' : 'charged' })
  }

  return { charges, total: Math.round(total * 100) / 100, chargeable, freeLeadsUsed, capReached }
}

/**
 * ABN check-digit test (Australian Business Register algorithm): subtract 1
 * from the first digit, weight the 11 digits, and the sum must divide by 89.
 * Confirms the number is well formed; whether it is active is checked
 * separately on ABN Lookup.
 */
export function isValidAbn(abn: string): boolean {
  const digits = abn.replace(/\s/g, '')
  if (!/^\d{11}$/.test(digits)) return false
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
  const sum = digits.split('').reduce((s, d, i) => s + (Number(d) - (i === 0 ? 1 : 0)) * weights[i], 0)
  return sum % 89 === 0
}

/** Rough monthly estimate shown before a client signs up. */
export function estimateMonthly(counts: Partial<Record<LeadType, number>>, monthlyCap = LEAD_RULES.defaultMonthlyCap) {
  const raw = (Object.entries(counts) as [LeadType, number][])
    .reduce((sum, [type, n]) => sum + leadPriceFor(type) * Math.max(0, n || 0), 0)
  return Math.min(raw, monthlyCap)
}
