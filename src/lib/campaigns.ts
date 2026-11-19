// Launch campaigns for PhLedger's own brands. Real claims only: no invented
// clients, numbers or testimonials. Wording follows phledger.com; replace the
// case-note posts with real results (with the client's permission) as they come in.

import type { PostIdea } from './social-publisher'

const CAMPAIGN = 'fde-decision-sprint'

export const CONSULTING_LAUNCH: PostIdea[] = [
  {
    id: 'embedded-not-outsourced',
    pillar: 'Embedded, not outsourced: train while we build',
    campaign: CAMPAIGN,
    hook: 'Most consultancies hand over a black box. Forward-deployed engineers hand over a capability.',
    body: 'A PHledger engineer works inside your team, your tools and your stand-ups, ships to your production, and pairs with your people the whole way. When we leave, your team runs and extends the platform themselves.',
    hashtags: ['ForwardDeployedEngineering', 'DataEngineering', 'AI'],
  },
  {
    id: 'foundations-first',
    pillar: 'Foundations first: trusted data before AI',
    campaign: CAMPAIGN,
    path: '/cloud',
    hook: 'AI only works on data that is managed, current and delivered reliably.',
    body: 'Before we build AI, we start from the business goal, agree where each number comes from and who owns it, and put tested pipelines underneath. Then the AI has something worth reasoning over.',
    hashtags: ['DataGovernance', 'DataQuality', 'AI'],
  },
  {
    id: 'ai-recommends',
    pillar: 'AI recommends, your people decide',
    campaign: CAMPAIGN,
    hook: 'AI should recommend. People should decide.',
    body: 'Every PHledger decision memo sets out the options, risks, costs and an AI recommendation, and your leaders sign it off. Same rule in delivery: AI drafts, a person approves anything that matters, and the tests are written first.',
    hashtags: ['ResponsibleAI', 'DecisionMaking', 'Leadership'],
  },
  {
    id: 'platform-neutral',
    pillar: 'Platform-neutral cloud and data decisions',
    campaign: CAMPAIGN,
    path: '/cloud#pricing',
    hook: 'AWS, Azure or Google Cloud? Databricks or Snowflake? Decide on your workloads, not a sales pitch.',
    body: 'A two-week decision sprint compares the options on your own workloads and ends with a cost model, a risk register, an exit plan and a pilot plan with its success tests written first. Fixed fee, published on our site.',
    hashtags: ['Cloud', 'Databricks', 'Snowflake'],
  },
  {
    id: 'built-it-ourselves',
    pillar: 'We run on what we build',
    campaign: CAMPAIGN,
    hook: 'We run our own marketing business on the same automation we build for clients.',
    body: 'PhLedger Marketing replies to enquiries within a minute, triages reviews, paces daily ads and checks every quote for profit before it goes out: tested code, with a person approving anything that matters. That is the FDE way: build it, use it, prove it.',
    hashtags: ['AI', 'Automation', 'Marketing'],
  },
  {
    id: 'brief',
    pillar: 'Embedded, not outsourced: train while we build',
    campaign: CAMPAIGN,
    hook: 'What would you fix first if a senior data and AI engineer joined your team on Monday?',
    body: 'Tell us your stack and the problem: month-end reporting that takes too long, a platform choice you keep putting off, or an AI idea nobody has had time to test. Send a short brief and we will propose an engagement that delivers and trains at the same time.',
    hashtags: ['DataAnalytics', 'AI', 'Cloud'],
  },
  {
    id: 'embedded-zh',
    pillar: 'Embedded, not outsourced: train while we build',
    campaign: CAMPAIGN,
    language: 'zh',
    hook: '外包交付的是黑盒，前向部署工程师（FDE）留下的是能力。',
    body: 'PHledger 的资深数据、AI 与云工程师融入你的团队：先帮你做出平台决策，再以测试先行的方式交付到生产环境，同时边做边教。我们离开后，平台由你的团队自己运行和扩展。',
    cta: '给 PHledger 发一份简短需求',
    hashtags: ['数据工程', '人工智能', '云平台'],
  },
]

// Australia + Canada, marketed together. Shared posts run in both markets
// (spelled for each: "organisation" in Australia, "organization" in Canada);
// market-only posts carry `markets`. Facts only: cloud regions and laws are
// public; no invented clients or results.
const AUCA = 'fde-au-ca'

export const AU_CA_LAUNCH: PostIdea[] = [
  {
    id: 'au-ca-embedded',
    pillar: 'Embedded, not outsourced: train while we build',
    campaign: AUCA,
    hook: 'Forward-deployed engineers for data, AI and cloud — now working with teams in Australia and Canada.',
    body: 'A senior PHledger engineer joins your team, helps your organisation make the platform decision, builds test-first on AWS, Azure or Google Cloud, and trains your people as we go. Same approach in Melbourne or Toronto: you keep the capability, not just the code.',
    hashtags: ['ForwardDeployedEngineering', 'DataEngineering', 'AI'],
  },
  {
    id: 'au-data-home',
    pillar: 'Foundations first: trusted data before AI',
    campaign: AUCA,
    markets: ['au'],
    hook: 'Your data can stay in Australia. Your AI can too.',
    body: 'We build in your own cloud accounts, in Australian regions (Sydney and Melbourne on AWS, Australia East and Southeast on Azure, australia-southeast on Google Cloud), with access and retention designed around the Australian Privacy Principles from day one.',
    hashtags: ['DataSovereignty', 'Privacy', 'Cloud'],
  },
  {
    id: 'ca-data-home',
    pillar: 'Foundations first: trusted data before AI',
    campaign: AUCA,
    markets: ['ca'],
    hook: 'Your data can stay in Canada. Your AI can too.',
    body: 'We build in your own cloud accounts, in Canadian regions (Montréal and Calgary on AWS, Canada Central and East on Azure, northamerica-northeast on Google Cloud), with access and retention designed around PIPEDA, and Québec\'s Law 25 where it applies, from day one.',
    hashtags: ['DataSovereignty', 'PIPEDA', 'Cloud'],
  },
  {
    id: 'ca-time-zones',
    pillar: 'Embedded, not outsourced: train while we build',
    campaign: AUCA,
    markets: ['ca'],
    hook: 'A Melbourne-based engineering partner for a Canadian team? The time zones work in your favour.',
    body: 'Late afternoon in Toronto is early morning in Melbourne, so we meet in that overlap, then the work moves forward while you sleep. You start the next day with a written update, and decisions stay with your people.',
    hashtags: ['RemoteWork', 'DataEngineering', 'Canada'],
  },
  {
    id: 'au-ca-decision',
    pillar: 'Platform-neutral cloud and data decisions',
    campaign: AUCA,
    path: '/cloud#pricing',
    hook: 'AWS, Azure or Google Cloud? Databricks or Snowflake? Decide on your own workloads, in your own region.',
    body: 'A two-week decision sprint compares the options on your workloads, checks where the data must live, and ends with a cost model, a risk register, an exit plan and a pilot plan with its success tests written first.',
    hashtags: ['Cloud', 'Databricks', 'Snowflake'],
  },
  {
    id: 'au-ca-books',
    pillar: 'We run on what we build',
    campaign: AUCA,
    path: 'https://phledgerfinance.vercel.app/books',
    cta: 'See PHLedger Books',
    hook: 'Running a small business in Australia or Canada? Let AI keep the books.',
    body: 'PHLedger Books is AI bookkeeping for small businesses, with BAS and GST in Australia and GST/HST in Canada, built by the same engineers.',
    hashtags: ['SmallBusiness', 'Bookkeeping', 'AI'],
  },
  {
    id: 'au-ca-zh',
    pillar: 'Embedded, not outsourced: train while we build',
    campaign: AUCA,
    language: 'zh',
    hook: '澳大利亚和加拿大的企业：数据、AI 与云，找前向部署工程师（FDE）。',
    body: 'PHledger 的资深工程师融入你的团队：帮你选平台，在 AWS、Azure 或谷歌云上以测试先行的方式交付，数据可留在本国云区域，并边做边教，让团队自己接手。',
    cta: '给 PHledger 发一份简短需求',
    hashtags: ['数据工程', '人工智能', '加拿大'],
  },
]
