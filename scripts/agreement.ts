// npm run agreement -- clients/<client>.json
//
// Builds the service agreement from the client's file (same inputs and price
// list as the quote) and writes clients/out/<file>-agreement.md.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { buildAgreement, type AgreementInput } from '../src/lib/agreement'
import { money } from '../src/lib/quote'

const file = process.argv[2]
if (!file) {
  console.error('Usage: npm run agreement -- clients/<client>.json')
  process.exit(1)
}
const input = JSON.parse(readFileSync(file, 'utf8')) as AgreementInput
input.today ??= new Date().toISOString().slice(0, 10)

try {
  const out = buildAgreement(input)
  const outDir = join(dirname(file), 'out')
  mkdirSync(outDir, { recursive: true })
  const outFile = join(outDir, basename(file).replace(/\.json$/, '') + '-agreement.md')
  writeFileSync(outFile, out.markdown)
  console.log(`Monthly ${money(out.monthlyTotal)} · first payment ${money(out.firstPayment)} · written to ${outFile}`)
} catch (e) {
  console.error(`Agreement refused: ${(e as Error).message}`)
  process.exit(2)
}
