// npm run brand-plan -- 2027-01-04 standard
//
// Plans PHledger's brand programme for the year from its four quarterly
// themes: every asset with due date, owner and who approves it, event
// run-sheets, partner status, and the social posts that back each quarter.
// Writes clients/out/brand-plan-<start>.md. Nothing is published or spent.
import { writeFileSync, mkdirSync } from 'node:fs'
import { planProgramme, eventRunSheet, themePostIdeas, programmeEconomics, TIERS, ASSET_SPECS, type TierId } from '../src/lib/brand-programme'
import { PHLEDGER_2027, PHLEDGER_PARTNERS } from '../src/lib/brand-plans'

const [start = '2027-01-04', tierArg = 'standard'] = process.argv.slice(2)
const tier = tierArg as TierId
if (!(tier in TIERS)) {
  console.error(`Unknown tier ${tierArg}. Use: ${Object.keys(TIERS).join(', ')}`)
  process.exit(1)
}
const policy = { mode: 'zhi_li' as const }
const quarters = planProgramme(start, PHLEDGER_2027, tier, policy, PHLEDGER_PARTNERS)
const e = programmeEconomics(tier)

const OWNER = { ai_draft: 'AI drafts, Zhi Li edits', subject_expert: 'Expert (Zhi Li) with AI draft', zhi_li: 'Zhi Li', partner: 'Partner + Zhi Li' }
const md: string[] = [
  `# PHledger brand programme from ${start} (${TIERS[tier].name})`,
  '',
  `About ${e.hoursMonthly} hours a month of Zhi Li's time. Ad, event and travel spend is separate and needs approval.`,
  '',
  '## Partner programs',
  '',
  ...PHLEDGER_PARTNERS.map(p => `- ${p.name}: ${p.program} — ${p.status.replace('_', ' ')}; co-funding ${p.coFunding}`),
  '',
]
for (const q of quarters) {
  md.push(`## Q${q.index}: ${q.theme.title} (${q.start} to ${q.end})`, '', `> ${q.theme.narrative}`, '', `Markets: ${(q.theme.markets ?? ['au']).join(', ')} · ${q.hours} hours`, '')
  md.push('| Due | Asset | Title | Owner | Approval |', '| --- | --- | --- | --- | --- |')
  for (const a of q.assets) md.push(`| ${a.due} | ${ASSET_SPECS[a.kind].name} | ${a.title}${a.blocked ? ` ⚠️ ${a.blocked}` : ''} | ${OWNER[a.owner]} | ${a.route} |`)
  const ev = q.assets.find(a => a.kind === 'webinar')
  if (ev) {
    md.push('', `### Webinar run-sheet (${ev.due})`, '')
    for (const s of eventRunSheet(ev.due, 'webinar', policy)) md.push(`- ${s.due}: ${s.step}${s.route ? ` (approval: ${s.route})` : ''}`)
  }
  const live = q.assets.find(a => a.kind === 'roundtable' || a.kind === 'executive_dinner')
  if (live) {
    md.push('', `### ${q.theme.event?.kind === 'executive_dinner' ? 'Executive dinner' : 'Roundtable'} run-sheet (${live.due})`, '')
    for (const s of eventRunSheet(live.due, q.theme.event?.kind ?? 'roundtable', policy)) md.push(`- ${s.due}: ${s.step}${s.route ? ` (approval: ${s.route})` : ''}`)
  }
  md.push('', '### Social posts backing the quarter', '')
  for (const p of themePostIdeas(q, `brand-q${q.index}`)) md.push(`- ${p.hook}`)
  md.push('')
}
mkdirSync('clients/out', { recursive: true })
const out = `clients/out/brand-plan-${start}.md`
writeFileSync(out, md.join('\n'))
console.log(`${quarters.length} quarters, ${quarters.reduce((s, q) => s + q.assets.length, 0)} assets planned · ${out}`)
