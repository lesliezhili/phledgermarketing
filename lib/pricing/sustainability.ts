// lib/pricing/sustainability.ts -- sustainability scoring -> eco rebate.
import { OFFPEAK_HOURS, SUSTAINABILITY_REBATE_MAX } from './config'

export interface SustainabilityContext {
  providerTransport?: 'ev' | 'public' | 'bike' | 'walk' | 'car'
  distanceKm?: number
  remote?: boolean
  startHour?: number
  paperless?: boolean
}

export interface SustainabilityResult {
  score: number
  rebatePct: number
  reasons: string[]
}

export function scoreSustainability(ctx: SustainabilityContext = {}): SustainabilityResult {
  let score = 50
  const reasons: string[] = []
  const tt = ctx.providerTransport
  if (ctx.remote) {
    score += 30; reasons.push('remote/tele-service: no travel')
  } else if (tt === 'ev' || tt === 'public' || tt === 'bike' || tt === 'walk') {
    score += 20; reasons.push('low-emission travel: ' + tt)
  } else if (tt === 'car') {
    score -= 10; reasons.push('car travel')
  }
  if (typeof ctx.distanceKm === 'number') {
    if (ctx.distanceKm <= 5) { score += 10; reasons.push('local (<=5km)') }
    else if (ctx.distanceKm > 25) { score -= 10; reasons.push('long distance (>25km)') }
  }
  if (ctx.startHour != null && OFFPEAK_HOURS.includes(ctx.startHour)) {
    score += 8; reasons.push('off-peak slot')
  }
  if (ctx.paperless) { score += 5; reasons.push('paperless') }
  score = Math.max(0, Math.min(100, score))
  const rebatePct = Number((SUSTAINABILITY_REBATE_MAX * (score / 100)).toFixed(4))
  return { score, rebatePct, reasons }
}
