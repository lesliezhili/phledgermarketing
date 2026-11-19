// npm run scorecard -- clients/scorecard-2026-12.json
// npm run case-study -- clients/<client>-case.json [en|zh]
//
// Writes the Markdown to clients/out/ (git-ignored) and prints a summary.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { buildScorecard, scorecardMarkdown, type ScorecardInput } from '../src/lib/scorecard'
import { buildCaseStudy, type CaseStudyInput } from '../src/lib/case-study'

const [kind, file, lang] = process.argv.slice(2)
if (!file || (kind !== 'scorecard' && kind !== 'case-study')) {
  console.error('Usage: npm run scorecard -- <file.json>   |   npm run case-study -- <file.json> [en|zh]')
  process.exit(1)
}
const outDir = join(dirname(file), 'out')
mkdirSync(outDir, { recursive: true })
const outFile = join(outDir, basename(file).replace(/\.json$/, '') + '.md')

if (kind === 'scorecard') {
  const input = JSON.parse(readFileSync(file, 'utf8')) as ScorecardInput
  const card = buildScorecard(input)
  writeFileSync(outFile, scorecardMarkdown(input.month, card))
  console.log(`${card.cash.breakEven ? 'Break-even ✅' : 'Below break-even ❌'} · cash profit $${card.cash.profit} · ${card.flags.length} flag(s) · ${outFile}`)
} else {
  const input = JSON.parse(readFileSync(file, 'utf8')) as CaseStudyInput
  const result = buildCaseStudy(input, lang === 'zh' ? 'zh' : 'en')
  writeFileSync(outFile, result.markdown)
  console.log(`${result.headline} · ${result.publishable ? 'approved by client' : 'NOT approved yet — do not publish'} · ${outFile}`)
}
