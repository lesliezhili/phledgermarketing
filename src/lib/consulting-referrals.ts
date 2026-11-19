// PhLedger Marketing → PHledger (phledger.com) FDE consulting.
//
// Marketing work shows who has a data, BI or AI problem worth an embedded
// engineer: several stores to compare, reports built by hand, a platform
// decision, an AI idea. This scores a marketing client or prospect for FDE
// fit, picks the right first step on phledger.com, and writes the hand-over
// brief in the same shape as phledger.com's questionnaire — so a referral
// arrives ready to talk about, and is attributed to PhLedger Marketing.
//
// Nothing is sent from here. Zhi Li reviews the brief, and the client agrees
// to the introduction before anything is shared (privacy: only what the
// client has agreed to pass on).

import { BRANDS } from './brands'

export interface ReferralInput {
  business: string
  contactName?: string
  industry?: string
  stores?: number
  staff?: number
  annualTurnover?: number // AUD, if known
  signals: Partial<Record<FdeSignal, boolean>>
  notes?: string
  language?: 'en' | 'zh'
}

export type FdeSignal =
  | 'manual_reporting' // weekly or month-end numbers copied between spreadsheets
  | 'multi_site_compare' // wants to compare stores, sites or teams
  | 'many_systems' // POS, accounting, bookings, ads… not joined up
  | 'platform_decision' // choosing or migrating a cloud, data platform or ERP
  | 'ai_idea' // wants AI for a specific task
  | 'compliance_data' // regulated reporting (aged care, NDIS, finance, health)
  | 'growth_plan' // opening sites, raising money, going global
  | 'in_house_team' // has staff who could own a platform after training

const SIGNALS: Record<FdeSignal, { weight: number; en: string; zh: string }> = {
  manual_reporting: { weight: 3, en: 'Numbers are copied between spreadsheets by hand', zh: '报表靠手工在表格之间复制' },
  multi_site_compare: { weight: 2, en: 'Wants to compare stores or sites side by side', zh: '想把各门店的数据放在一起比较' },
  many_systems: { weight: 2, en: 'Several systems that are not joined up', zh: '多个系统的数据没有打通' },
  platform_decision: { weight: 4, en: 'Choosing or migrating a cloud or data platform', zh: '正在选择或迁移云 / 数据平台' },
  ai_idea: { weight: 2, en: 'Has a specific task they want AI to do', zh: '有一项具体工作想交给 AI' },
  compliance_data: { weight: 3, en: 'Regulated reporting depends on the data', zh: '合规报送依赖这些数据' },
  growth_plan: { weight: 2, en: 'Opening sites, raising money or going global', zh: '准备开新店、融资或出海' },
  in_house_team: { weight: 2, en: 'Has people who could own a platform once trained', zh: '有人能在培训后接手平台' },
}

export type FdeStep = 'not_yet' | 'brief' | 'decision_sprint' | 'embedded_fde'

export interface ReferralAssessment {
  score: number
  reasons: string[]
  step: FdeStep
  /** Why this step and not a bigger one. */
  why: string
  link: string | null
  brief: string | null
}

/** Size gate: an embedded engineer only pays back for organisations of some size. */
function size(i: ReferralInput): 'tiny' | 'small' | 'mid' {
  const t = i.annualTurnover ?? 0
  const staff = i.staff ?? 0
  if (t >= 10_000_000 || staff >= 50) return 'mid'
  if (t >= 2_000_000 || staff >= 15 || (i.stores ?? 1) >= 3) return 'small'
  return 'tiny'
}

/** Referral link to phledger.com, attributed to PhLedger Marketing. */
export function referralLink(campaign: string, path = BRANDS['phledger-consulting'].contactPath ?? '/'): string {
  const url = new URL(path, BRANDS['phledger-consulting'].site + '/')
  url.searchParams.set('utm_source', 'phledger-marketing')
  url.searchParams.set('utm_medium', 'referral')
  url.searchParams.set('utm_campaign', campaign)
  return url.toString()
}

export function assessFdeFit(input: ReferralInput): ReferralAssessment {
  const lang = input.language ?? 'en'
  const on = (Object.keys(SIGNALS) as FdeSignal[]).filter(s => input.signals[s])
  const score = on.reduce((n, s) => n + SIGNALS[s].weight, 0)
  const reasons = on.map(s => SIGNALS[s][lang])
  const sz = size(input)

  let step: FdeStep
  let why: string
  if (score < 4) {
    step = 'not_yet'
    why = 'Not enough data or AI need yet; keep serving them with marketing and look again at the quarterly review.'
  } else if (sz === 'tiny') {
    step = 'brief'
    why = 'Real need, but a fixed-fee sprint is large for a business this size: start with a free brief and conversation, and solve small items inside the marketing plan.'
  } else if (input.signals.platform_decision || (sz === 'mid' && score >= 7)) {
    step = sz === 'mid' && input.signals.in_house_team && score >= 9 ? 'embedded_fde' : 'decision_sprint'
    why = step === 'embedded_fde'
      ? 'Large enough, a team to train and several needs at once: an embedded engineer delivers and trains together.'
      : 'A platform or architecture decision is due: a two-week fixed-fee decision sprint settles it with a signed-off memo and a tested pilot plan.'
  } else {
    step = 'brief'
    why = 'Clear need: send the brief, then agree the first engagement on a call.'
  }

  const campaign = `referral-${step}`
  const path = step === 'decision_sprint' || step === 'embedded_fde' ? '/cloud#pricing' : undefined
  const link = step === 'not_yet' ? null : referralLink(campaign, path)
  const brief = step === 'not_yet' ? null : referralBrief(input, reasons, step, lang)
  return { score, reasons, step, why, link, brief }
}

const STEP_NAME: Record<Exclude<FdeStep, 'not_yet'>, { en: string; zh: string }> = {
  brief: { en: 'Brief and first conversation (free)', zh: '需求简报与首次沟通（免费）' },
  decision_sprint: { en: 'Decision sprint (2 weeks, fixed fee)', zh: '决策冲刺（2 周，固定费用）' },
  embedded_fde: { en: 'Embedded FDE (3-month minimum)', zh: '融入式 FDE（至少 3 个月）' },
}

/** Hand-over brief, using the same headings as phledger.com's questionnaire. */
function referralBrief(i: ReferralInput, reasons: string[], step: Exclude<FdeStep, 'not_yet'>, lang: 'en' | 'zh'): string {
  const zh = lang === 'zh'
  const lines = zh
    ? [
        `PHledger 转介（来自 PhLedger Marketing）`,
        `客户：${i.business}${i.contactName ? `（${i.contactName}）` : ''}`,
        i.industry ? `行业：${i.industry}` : '',
        i.stores ? `门店数：${i.stores}` : '',
        `看到的需求：`,
        ...reasons.map(r => `- ${r}`),
        i.notes ? `备注：${i.notes}` : '',
        `建议第一步：${STEP_NAME[step].zh}`,
        `客户已同意转介：[ 是 / 否 ]（未同意前不得发送）`,
      ]
    : [
        `PHledger referral (from PhLedger Marketing)`,
        `Organisation: ${i.business}${i.contactName ? ` (${i.contactName})` : ''}`,
        i.industry ? `Industry: ${i.industry}` : '',
        i.stores ? `Sites: ${i.stores}` : '',
        `Business goal or problem seen:`,
        ...reasons.map(r => `- ${r}`),
        i.notes ? `Notes: ${i.notes}` : '',
        `Suggested first step: ${STEP_NAME[step].en}`,
        `Client agreed to the introduction: [ yes / no ] (do not send until yes)`,
      ]
  return lines.filter(Boolean).join('\n')
}
