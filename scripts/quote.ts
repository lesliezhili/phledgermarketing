// npm run quote -- clients/<client>.json
//
// Reads a client's quote inputs, builds the quote (refusing unprofitable
// ones), writes clients/out/<file>-quote.md and prints the message to send.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { buildQuote, money, type QuoteInput } from '../src/lib/quote'

const file = process.argv[2]
if (!file) {
  console.error('Usage: npm run quote -- clients/<client>.json')
  process.exit(1)
}

const input = JSON.parse(readFileSync(file, 'utf8')) as QuoteInput
input.today ??= new Date().toISOString().slice(0, 10)

try {
  const out = buildQuote(input)
  const outDir = join(dirname(file), 'out')
  mkdirSync(outDir, { recursive: true })
  const outFile = join(outDir, basename(file).replace(/\.json$/, '') + '-quote.md')
  writeFileSync(outFile, out.markdown)
  console.log(out.message)
  console.log(`\nDue on acceptance: ${money(out.numbers.dueToday)}  ·  brief written to ${outFile}`)
} catch (e) {
  console.error(`Quote refused: ${(e as Error).message}`)
  process.exit(2)
}
