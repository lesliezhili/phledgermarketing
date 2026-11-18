// Daily Google Maps ads ("daily 投流"): pace a monthly budget day by day and
// raise alerts, then write a 5-line daily summary for the owner.
//
// Ads run in the client's own Google Ads account (with location assets so
// they can appear on Google Maps); ad spend is paid by the client directly to
// Google. This module decides today's budget and flags problems — a person
// approves any change the alerts suggest.

export interface AdsPlan {
  monthlyBudget: number // the client's ad budget for the month
  month: string // YYYY-MM
  targetCostPerAction: number // max cost per call, direction request or order
  minDaily?: number
}

export interface AdDay {
  date: string // YYYY-MM-DD
  spend: number
  clicks: number
  calls: number
  directions: number
  orders?: number // tracked online orders from the ad
}

export type AdsAlert =
  | 'budget_used' // month's budget is spent: pause until next month
  | 'cost_too_high' // last 3 days cost per action over 1.5x target
  | 'no_results' // spent 3 days' budget with no calls, directions or orders
  | 'underspending' // well behind pace: check ads are approved and running

export interface DailyPlan {
  todayBudget: number
  spentToDate: number
  expectedToDate: number
  actionsToDate: number
  costPerAction: number | null
  alerts: AdsAlert[]
}

const r2 = (n: number) => Math.round(n * 100) / 100
const actions = (d: AdDay) => d.calls + d.directions + (d.orders ?? 0)

function daysInMonth(month: string) {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

/** Today's budget and alerts from the month so far (days before `today`). */
export function planToday(plan: AdsPlan, history: AdDay[], today: string): DailyPlan {
  const days = daysInMonth(plan.month)
  const dayOfMonth = Number(today.slice(8, 10))
  const monthDays = history.filter(d => d.date.startsWith(plan.month) && d.date < today)
  const spentToDate = monthDays.reduce((s, d) => s + d.spend, 0)
  const actionsToDate = monthDays.reduce((s, d) => s + actions(d), 0)
  const remainingDays = days - dayOfMonth + 1
  const remaining = Math.max(0, plan.monthlyBudget - spentToDate)
  const even = plan.monthlyBudget / days
  const expectedToDate = even * (dayOfMonth - 1)

  const alerts: AdsAlert[] = []
  let todayBudget = remaining / remainingDays
  // Never more than double the even daily budget, so one day can't blow the month.
  todayBudget = Math.min(todayBudget, even * 2)
  if (plan.minDaily) todayBudget = Math.max(todayBudget, Math.min(plan.minDaily, remaining))
  if (remaining <= 0) {
    alerts.push('budget_used')
    todayBudget = 0
  }

  const last3 = monthDays.slice(-3)
  const last3Spend = last3.reduce((s, d) => s + d.spend, 0)
  const last3Actions = last3.reduce((s, d) => s + actions(d), 0)
  if (last3.length === 3 && last3Actions === 0 && last3Spend >= even * 2) alerts.push('no_results')
  else if (last3.length === 3 && last3Actions > 0 && last3Spend / last3Actions > plan.targetCostPerAction * 1.5) alerts.push('cost_too_high')
  if (dayOfMonth > 5 && spentToDate < expectedToDate * 0.6) alerts.push('underspending')

  return {
    todayBudget: r2(todayBudget),
    spentToDate: r2(spentToDate),
    expectedToDate: r2(expectedToDate),
    actionsToDate,
    costPerAction: actionsToDate ? r2(spentToDate / actionsToDate) : null,
    alerts,
  }
}

const ALERT_TEXT: Record<AdsAlert, { en: string; zh: string }> = {
  budget_used: { en: 'Monthly budget used — ads paused until next month.', zh: '本月预算已用完，广告暂停到下个月。' },
  cost_too_high: { en: 'Cost per result is too high — I\'ll pause the weakest ad and test a new one (needs your OK).', zh: '每个结果的成本偏高——我建议暂停效果最差的广告、换一条新的（需要您同意）。' },
  no_results: { en: 'No calls or directions for 3 days — I\'m checking the ads and the Google profile.', zh: '连续 3 天没有来电或导航——我正在检查广告和谷歌档案。' },
  underspending: { en: 'Ads are spending slowly — I\'m checking they are approved and running.', zh: '广告花费偏慢——我正在检查广告是否通过审核、正常投放。' },
}

/** The 5-line daily WeChat/email summary for the owner. */
export function dailySummary(plan: AdsPlan, yesterday: AdDay | undefined, p: DailyPlan, language: 'en' | 'zh'): string {
  const y = yesterday ?? { date: '', spend: 0, clicks: 0, calls: 0, directions: 0, orders: 0 }
  const lines = language === 'zh'
    ? [
        `昨天：花费 $${r2(y.spend)}，来电 ${y.calls}，导航 ${y.directions}${y.orders ? `，订单 ${y.orders}` : ''}`,
        `本月至今：$${p.spentToDate} / 预算 $${plan.monthlyBudget}，共 ${p.actionsToDate} 个结果${p.costPerAction ? `，每个 $${p.costPerAction}` : ''}`,
        `今天预算：$${p.todayBudget}`,
        ...p.alerts.map(a => `⚠️ ${ALERT_TEXT[a].zh}`),
      ]
    : [
        `Yesterday: $${r2(y.spend)} spent, ${y.calls} calls, ${y.directions} directions${y.orders ? `, ${y.orders} orders` : ''}`,
        `Month to date: $${p.spentToDate} of $${plan.monthlyBudget}, ${p.actionsToDate} results${p.costPerAction ? ` at $${p.costPerAction} each` : ''}`,
        `Today's budget: $${p.todayBudget}`,
        ...p.alerts.map(a => `⚠️ ${ALERT_TEXT[a].en}`),
      ]
  if (!p.alerts.length) lines.push(language === 'zh' ? '✅ 一切正常' : '✅ All on track')
  return lines.join('\n')
}
