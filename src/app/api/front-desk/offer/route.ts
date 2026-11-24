// GET /api/front-desk/offer?lang=en|zh — AI Front Desk prices and terms.
// phledger.com's /frontdesk page reads this so prices live in one place.
import { frontDeskOffer } from '@/lib/front-desk'
import { json, preflight } from '@/lib/integration'

export function GET(req: Request) {
  const lang = new URL(req.url).searchParams.get('lang') === 'zh' ? 'zh' : 'en'
  return json(req, frontDeskOffer(lang), 200, { 'Cache-Control': 'public, max-age=300, s-maxage=3600' })
}

export const OPTIONS = preflight
