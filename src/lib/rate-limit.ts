// Best-effort per-visitor limit for public endpoints that cost money (the
// chat agent calls Claude). In memory, so it resets when a server instance
// restarts and isn't shared between instances; it stops casual abuse, not a
// determined attacker. Use a shared store (e.g. Supabase or Redis) if abused.

const hits = new Map<string, number[]>()

export function allow(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter(t => now - t < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 10_000) hits.clear() // keep memory bounded
  return true
}

export function visitorKey(req: Request): string {
  return (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown'
}
