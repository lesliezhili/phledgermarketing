// POST /api/front-desk/apply — AI Front Desk pilot application, from this
// site or from phledger.com. Saved to Supabase when configured; otherwise the
// response says so and gives the email fallback, so no application is lost.
import { getSupabase } from '@/lib/supabase'
import { json, preflight, readJson } from '@/lib/integration'

const FALLBACK_EMAIL = 'zhili@phledger.com'

interface Application {
  business: string
  industry?: string
  contactName?: string
  contact: string // email or phone
  missedPerWeek?: number
  message?: string
  language?: 'en' | 'zh'
  source?: string // e.g. "phledger.com/frontdesk" or UTM tags
  consent: boolean // agreed to be contacted about the pilot
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(req: Request) {
  const b = await readJson<Application>(req)
  if (!b) return json(req, { error: 'invalid request body' }, 400)
  const app = {
    business: str(b.business, 120),
    industry: str(b.industry, 80),
    contact_name: str(b.contactName, 80),
    contact: str(b.contact, 120),
    missed_per_week: typeof b.missedPerWeek === 'number' && b.missedPerWeek >= 0 && b.missedPerWeek <= 1000 ? Math.round(b.missedPerWeek) : null,
    message: str(b.message, 1000),
    language: b.language === 'zh' ? 'zh' : 'en',
    source: str(b.source, 200) || (req.headers.get('origin') ?? 'direct'),
  }
  if (!app.business || !app.contact) return json(req, { error: 'business and contact are required' }, 400)
  if (b.consent !== true) return json(req, { error: 'consent to be contacted is required' }, 400)

  const subject = `AI Front Desk pilot: ${app.business}`
  const fallback = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    Object.entries(app).map(([k, v]) => `${k}: ${v ?? ''}`).join('\n'),
  )}`

  const db = getSupabase()
  if (!db) return json(req, { stored: false, fallback, message: 'Applications database not configured; send by email instead.' }, 503)
  const { error } = await db.from('dm_front_desk_applications').insert(app)
  if (error) return json(req, { stored: false, fallback, message: 'Could not save the application; send by email instead.' }, 502)
  return json(req, { stored: true, message: app.language === 'zh' ? '已收到申请，我们会在 1 个工作日内联系您。' : 'Application received. We will contact you within one business day.' }, 201)
}

export const OPTIONS = preflight
