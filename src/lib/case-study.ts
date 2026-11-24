// Case study generator: baseline vs. results after the pilot (or any period),
// in English or Chinese, anonymised if the client prefers.
//
// Honest by design: only measured numbers are used, every number shows its
// source and period, falls are reported as falls, and nothing is published
// without the client's approval of the final text.

export interface CaseMetric {
  name: { en: string; zh: string }
  before: number
  after: number
  source: string // where the number came from, e.g. "Google Business Profile insights"
  higherIsBetter?: boolean // default true
}

export interface CaseStudyInput {
  business: string
  anonymousName?: { en: string; zh: string } // e.g. a "Fitzroy café" — used if anonymise is true
  anonymise: boolean
  industry: { en: string; zh: string }
  challenge: { en: string; zh: string }
  whatWeDid: { en: string; zh: string }[]
  periodDays: number
  periodEnd: string // YYYY-MM-DD
  metrics: CaseMetric[]
  quote?: { en: string; zh: string } // client's own words, only with permission
  clientApproved: boolean
}

export interface CaseStudyResult {
  changes: { name: string; before: number; after: number; change: number | null; improved: boolean }[]
  headline: string
  markdown: string
  publishable: boolean
}

const pctChange = (b: number, a: number) => (b === 0 ? null : Math.round(((a - b) / b) * 100))

export function buildCaseStudy(c: CaseStudyInput, language: 'en' | 'zh'): CaseStudyResult {
  const zh = language === 'zh'
  const name = c.anonymise ? (c.anonymousName ?? { en: 'A local business', zh: '一家本地商户' })[language] : c.business
  const changes = c.metrics.map(m => {
    const change = pctChange(m.before, m.after)
    const better = m.higherIsBetter ?? true
    return { name: m.name[language], before: m.before, after: m.after, change, improved: better ? m.after > m.before : m.after < m.before }
  })
  // Headline = the biggest improvement, stated plainly.
  const best = changes.filter(x => x.improved && x.change !== null).sort((a, b) => Math.abs(b.change!) - Math.abs(a.change!))[0]
  const headline = best
    ? zh
      ? `${name}：${c.periodDays} 天内${best.name}${best.change! >= 0 ? '增长' : '减少'} ${Math.abs(best.change!)}%`
      : `${name}: ${best.name} ${best.change! >= 0 ? 'up' : 'down'} ${Math.abs(best.change!)}% in ${c.periodDays} days`
    : zh ? `${name}：${c.periodDays} 天试点结果` : `${name}: ${c.periodDays}-day pilot results`

  const sources = Array.from(new Set(c.metrics.map(m => m.source)))
  const L: string[] = [`# ${headline}`, '']
  L.push(zh ? `**行业：** ${c.industry.zh}` : `**Business:** ${c.industry.en}`, '')
  L.push(zh ? '## 挑战' : '## The challenge', '', c.challenge[language], '')
  L.push(zh ? '## 我们做了什么' : '## What we did', '')
  for (const w of c.whatWeDid) L.push(`- ${w[language]}`)
  L.push('', zh ? `## 结果（截至 ${c.periodEnd} 的 ${c.periodDays} 天，对比之前 ${c.periodDays} 天）` : `## Results (${c.periodDays} days to ${c.periodEnd}, against the ${c.periodDays} days before)`, '')
  L.push(zh ? '| 指标 | 之前 | 之后 | 变化 |' : '| Measure | Before | After | Change |', '| --- | --- | --- | --- |')
  for (const x of changes) L.push(`| ${x.name} | ${x.before} | ${x.after} | ${x.change === null ? '—' : `${x.change > 0 ? '+' : ''}${x.change}%`} |`)
  L.push('', (zh ? '数据来源：' : 'Sources: ') + sources.join(zh ? '；' : '; ') + '.', '')
  if (c.quote) L.push(`> ${c.quote[language]}`, '')
  L.push(zh ? '_结果因店而异，不代表保证。_' : '_Results vary by business and are not a guarantee._', '')

  return { changes, headline, markdown: L.join('\n'), publishable: c.clientApproved }
}
