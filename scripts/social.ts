// npm run social -- phledger-consulting 2026-11-23
//
// Plans a week of posts for one of PhLedger's own brands across every
// channel, shows who must approve each one, and writes the plan to
// clients/out/social-<brand>-<week>.md. Nothing is published from here:
// approved posts go out through the scheduler or connector for each channel.
import { writeFileSync, mkdirSync } from 'node:fs'
import { BRANDS, type Brand } from '../src/lib/brands'
import { CONSULTING_LAUNCH } from '../src/lib/campaigns'
import { planWeek, CHANNEL_SPECS } from '../src/lib/social-publisher'

const [brandId = 'phledger-consulting', weekStart = new Date().toISOString().slice(0, 10)] = process.argv.slice(2)
const brand = BRANDS[brandId as Brand['id']]
if (!brand) {
  console.error(`Unknown brand ${brandId}. Use: ${Object.keys(BRANDS).join(', ')}`)
  process.exit(1)
}
const ideas = brand.id === 'phledger-consulting' ? CONSULTING_LAUNCH : []
if (!ideas.length) {
  console.error(`No campaign ideas yet for ${brand.name}: add them to src/lib/campaigns.ts`)
  process.exit(1)
}
const week = planWeek(brand, ideas, weekStart)
const md = [
  `# ${brand.name} — posts for the week of ${weekStart}`,
  '',
  ...week.flatMap(p => [
    `## ${p.date} · ${CHANNEL_SPECS[p.channel].name} · approval: ${p.route}`,
    '',
    '```',
    p.text,
    '```',
    `How it goes out: ${CHANNEL_SPECS[p.channel].how}`,
    '',
  ]),
].join('\n')
mkdirSync('clients/out', { recursive: true })
const out = `clients/out/social-${brand.id}-${weekStart}.md`
writeFileSync(out, md)
console.log(`${week.length} posts planned across ${brand.channels.length} channels · ${out}`)
