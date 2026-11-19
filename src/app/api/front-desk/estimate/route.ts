// POST /api/front-desk/estimate — what missed calls cost and what AI Front Desk would charge.
import { estimate, type EstimateInput } from '@/lib/front-desk'
import { json, preflight, readJson } from '@/lib/integration'

const inRange = (v: unknown, min: number, max: number) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max

export async function POST(req: Request) {
  const b = await readJson<EstimateInput>(req)
  if (!b) return json(req, { error: 'invalid request body' }, 400)
  if (!inRange(b.missedPerWeek, 0, 1000)) return json(req, { error: 'missedPerWeek must be 0 to 1000' }, 400)
  if (!inRange(b.conversionPct, 0, 100)) return json(req, { error: 'conversionPct must be 0 to 100' }, 400)
  if (!inRange(b.avgOrderValue, 0, 100000)) return json(req, { error: 'avgOrderValue must be 0 to 100000' }, 400)
  if (b.tier !== 'standard' && b.tier !== 'high_value') return json(req, { error: 'tier must be standard or high_value' }, 400)
  if (b.cap !== undefined && !inRange(b.cap, 0, 100000)) return json(req, { error: 'cap must be 0 to 100000' }, 400)
  return json(req, estimate(b as EstimateInput))
}

export const OPTIONS = preflight
