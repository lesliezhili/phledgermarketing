// POST a new review, get its triage (severity, topics, escalate?) and a
// drafted reply. Critical reviews are never auto-published.
import { NextResponse } from 'next/server'
import { triageReview, type ReviewInput } from '@/lib/review-response'

export async function POST(req: Request) {
  let body: Partial<ReviewInput>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 })
  }
  const rating = Number(body.rating)
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: 'rating must be 1 to 5' }, { status: 400 })
  if (typeof body.text !== 'string' || body.text.length > 5000) return NextResponse.json({ error: 'text is required (max 5000 characters)' }, { status: 400 })
  if (!body.business || !body.contact) return NextResponse.json({ error: 'business and contact are required' }, { status: 400 })
  if (body.language && !['en', 'zh'].includes(body.language)) return NextResponse.json({ error: 'language must be en or zh' }, { status: 400 })
  return NextResponse.json(triageReview({ ...(body as ReviewInput), rating }))
}
