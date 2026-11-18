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
