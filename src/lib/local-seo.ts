// Local SEO for a client's website: schema.org LocalBusiness markup, page
// titles and descriptions, local keyword ideas, and a check that the
// website's name/address/phone match Google Maps exactly (mismatches hurt
// local rankings and confuse customers).

export type BusinessType = 'Bakery' | 'CafeOrCoffeeShop' | 'Restaurant' | 'LocalBusiness'

export interface OpeningHours {
  days: ('Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su')[]
  opens: string // HH:MM
  closes: string // HH:MM
}

export interface StoreSeo {
  business: string
  type: BusinessType
  street: string
  suburb: string
  state: string
  postcode: string
  phone: string
  url?: string
  cuisine?: string[]
  priceRange?: string // e.g. "$$"
  hours?: OpeningHours[]
  products?: string[]
  sameAs?: string[] // Instagram, Facebook, RedNote profile links
}

const DAY_NAMES = { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' }

/** schema.org JSON-LD to put in the page <head> as <script type="application/ld+json">. */
export function localBusinessJsonLd(s: StoreSeo) {
  return {
    '@context': 'https://schema.org',
    '@type': s.type,
    name: s.business,
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.street,
      addressLocality: s.suburb,
      addressRegion: s.state,
      postalCode: s.postcode,
      addressCountry: 'AU',
    },
    telephone: s.phone,
    ...(s.url ? { url: s.url } : {}),
    ...(s.cuisine?.length ? { servesCuisine: s.cuisine } : {}),
    ...(s.priceRange ? { priceRange: s.priceRange } : {}),
    ...(s.hours?.length
      ? {
          openingHoursSpecification: s.hours.map(h => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: h.days.map(d => DAY_NAMES[d]),
            opens: h.opens,
            closes: h.closes,
          })),
        }
      : {}),
    ...(s.products?.length
      ? {
          hasMenu: {
            '@type': 'Menu',
            hasMenuSection: { '@type': 'MenuSection', name: 'Cakes', hasMenuItem: s.products.map(name => ({ '@type': 'MenuItem', name })) },
          },
        }
      : {}),
    ...(s.sameAs?.length ? { sameAs: s.sameAs } : {}),
  }
}

const clip = (text: string, max: number) => (text.length <= max ? text : text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…')

/** Title (≤ 60 chars) and meta description (≤ 155 chars) for a store page. */
export function metaTags(s: StoreSeo, focus: string) {
  const title = clip(`${s.business} | ${focus} in ${s.suburb}`, 60)
  const items = (s.products ?? []).slice(0, 3).join(', ')
  const description = clip(
    `${s.business}, ${s.street}, ${s.suburb}. ${focus}${items ? ` — ${items}` : ''}. Order or book: ${s.phone}.`,
    155,
  )
  return { title, description }
}

/** Local search phrases to target on the site and in Google posts. */
export function keywordIdeas(s: StoreSeo, extra: string[] = []): string[] {
  const subjects = [...(s.cuisine ?? []), ...extra, ...(s.products ?? [])]
  const places = [s.suburb, 'Melbourne'].filter((p, i, a) => a.indexOf(p) === i)
  const out = new Set<string>()
  for (const subject of subjects) for (const place of places) out.add(`${subject} ${place}`.toLowerCase())
  return Array.from(out)
}

const norm = (v: string) => v.toLowerCase().replace(/\bstreet\b/g, 'st').replace(/\broad\b/g, 'rd').replace(/[^a-z0-9]/g, '')
const normPhone = (p: string) => {
  const d = p.replace(/\D/g, '')
  return d.startsWith('61') ? '0' + d.slice(2) : d
}

/** Name/address/phone must match Google Maps exactly. Returns the fields that differ. */
export function napMismatches(site: Pick<StoreSeo, 'business' | 'street' | 'suburb' | 'phone'>, google: Pick<StoreSeo, 'business' | 'street' | 'suburb' | 'phone'>): string[] {
  const out: string[] = []
  if (norm(site.business) !== norm(google.business)) out.push('name')
  if (norm(site.street) !== norm(google.street) || norm(site.suburb) !== norm(google.suburb)) out.push('address')
  if (normPhone(site.phone) !== normPhone(google.phone)) out.push('phone')
  return out
}
