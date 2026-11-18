// Launch campaigns for PhLedger's own brands. Real claims only: no invented
// clients, numbers or testimonials. Replace the case-note posts with real
// results (with the client's permission) as they come in.

import type { PostIdea } from './social-publisher'

export const CONSULTING_LAUNCH: PostIdea[] = [
  {
    id: 'fde-what',
    pillar: 'FDE approach: embedded, shipping, measured',
    campaign: 'fde-pilot-launch',
    hook: 'Most data projects stall in meetings. Ours start with an engineer inside your business.',
    body: 'Forward-deployed engineering (FDE) means we sit with your team, work in your real systems, and ship something working in two weeks — a dashboard you use every morning or an AI workflow that saves real hours. Then we measure it.',
    hashtags: ['DataAnalytics', 'AI', 'SmallBusiness'],
  },
  {
    id: 'spreadsheet-to-dashboard',
    pillar: 'From spreadsheet to dashboard (BI)',
    campaign: 'fde-pilot-launch',
    hook: 'If your weekly numbers live in five spreadsheets, you are paying someone to copy and paste.',
    body: 'A first dashboard usually needs three things: one trusted source per number, a refresh that runs itself, and the 5–7 measures the owner actually decides with. That is a two-week job, not a six-month project.',
    hashtags: ['BusinessIntelligence', 'PowerBI', 'Dashboards'],
  },
  {
    id: 'practical-ai',
    pillar: 'Practical AI agents and automation',
    campaign: 'fde-pilot-launch',
    hook: 'The best first AI project is boring — and that is why it works.',
    body: 'Start with a task your team repeats every day: answering the same enquiry, sorting invoices, drafting the weekly report. Automate it with a person approving the output, measure the hours saved, then decide what is next.',
    hashtags: ['AI', 'Automation', 'Productivity'],
  },
  {
    id: 'built-it-ourselves',
    pillar: 'Case notes and lessons from real builds',
    campaign: 'fde-pilot-launch',
    hook: 'We run our own marketing business on the same automation we build for clients.',
    body: 'PhLedger Marketing replies to enquiries in under a minute, triages reviews, paces daily ads and checks every price for profit before a quote goes out — all tested code, with a person approving anything that matters. That is the FDE way: build it, use it, prove it.',
    hashtags: ['AI', 'Automation', 'Marketing'],
  },
  {
    id: 'data-trust',
    pillar: 'Data quality, governance and trust',
    campaign: 'fde-pilot-launch',
    hook: 'A dashboard nobody trusts is worse than no dashboard.',
    body: 'Before we chart anything, we agree where each number comes from, who owns it, and how it is checked. Customer data stays in your accounts. AI drafts; your people approve.',
    hashtags: ['DataGovernance', 'Privacy', 'AI'],
  },
  {
    id: 'pilot-offer',
    pillar: 'FDE approach: embedded, shipping, measured',
    campaign: 'fde-pilot-launch',
    hook: 'Free 60-minute data health check for small and mid-sized businesses.',
    body: 'Bring your spreadsheets, your reports and the question you can\'t answer quickly today. You leave with a one-page fix list and, if it makes sense, a two-week FDE pilot plan that ships one dashboard or one AI automation.',
    hashtags: ['SmallBusiness', 'DataAnalytics', 'AI'],
  },
  {
    id: 'fde-what-zh',
    pillar: 'FDE approach: embedded, shipping, measured',
    campaign: 'fde-pilot-launch',
    language: 'zh',
    hook: '数据项目最怕一直开会、迟迟落不了地。',
    body: '我们用「前线部署工程师（FDE）」的方式：工程师直接进到您的业务里，用您现有的系统，两周内交付一个每天真正在用的报表，或一个能省下真实工时的 AI 自动化流程，再用数字说话。',
    cta: '预约免费 60 分钟数据体检',
    hashtags: ['数据分析', '人工智能', '中小企业'],
  },
]
