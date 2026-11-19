// npm run social -- phledger-consulting 2026-11-23            (Australia + Canada + Québec)
// npm run social -- phledger-consulting 2026-11-23 au         (one market)
// npm run social -- phledger-consulting 2026-11-23 launch     (original single-market launch)
//
// Plans a week of posts for one of PhLedger's own brands across every
// channel and market, shows who must approve each one and when it goes out
// (local time and UTC), and writes the plan to clients/out/. Nothing is
// published from here: approved posts go out through each channel's
// scheduler or connector.
import { writeFileSync, mkdirSync } from 'node:fs'
import { BRANDS, type Brand } from '../src/lib/brands'
import { CONSULTING_LAUNCH, AU_CA_LAUNCH, QC_LAUNCH } from '../src/lib/campaigns'
import { planWeek, planMarkets, CHANNEL_SPECS } from '../src/lib/social-publisher'
import { MARKETS, type MarketId } from '../src/lib/markets'

const [brandId = 'phledger-consulting', weekStart = new Date().toISOString().slice(0, 10), which = ''] = process.argv.slice(2)
const brand = BRANDS[brandId as Brand['id']]
if (!brand) {
  console.error(`Unknown brand ${brandId}. Use: ${Object.keys(BRANDS).join(', ')}`)
  process.exit(1)
}
if (brand.id !== 'phledger-consulting') {
  console.error(`No campaign ideas yet for ${brand.name}: add them to src/lib/campaigns.ts`)
  process.exit(1)
}

const single = which === 'launch'
const markets = (single ? [] : which ? which.split(',') : brand.markets ?? ['au']) as MarketId[]
for (const m of markets) if (!(m in MARKETS)) { console.error(`Unknown market ${m}. Use: ${Object.keys(MARKETS).join(', ')}`); process.exit(1) }

const week = single ? planWeek(brand, CONSULTING_LAUNCH, weekStart) : planMarkets(brand, [...AU_CA_LAUNCH, ...QC_LAUNCH], weekStart, markets)
const label = single ? 'launch' : markets.join('-')
const md = [
  `# ${brand.name} — posts for the week of ${weekStart} (${single ? 'launch' : markets.map(m => MARKETS[m].name).join(' + ')})`,
  '',
  ...week.flatMap(p => [
    `## ${p.market ? MARKETS[p.market].name + ' · ' : ''}${p.date}${p.localTime ? ' ' + p.localTime : ''} · ${CHANNEL_SPECS[p.channel].name} · approval: ${p.route}`,
    p.postAt ? `Schedule at ${p.postAt} (UTC)` : '',
    '',
    '```',
    p.text,
    '```',
    `How it goes out: ${CHANNEL_SPECS[p.channel].how}`,
    '',
  ]),
].join('\n')
mkdirSync('clients/out', { recursive: true })
const out = `clients/out/social-${brand.id}-${label}-${weekStart}.md`
writeFileSync(out, md)
const by = (m?: MarketId) => week.filter(p => p.market === m).length
console.log(`${week.length} posts planned${single ? '' : ' (' + markets.map(m => `${MARKETS[m].name} ${by(m)}`).join(', ') + ')'} · ${out}`)
