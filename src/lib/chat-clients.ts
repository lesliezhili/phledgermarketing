// Websites that embed the AI chat agent, and the facts each one has
// approved. Facts live here, on the server, so a page can't change what the
// agent is allowed to say. The first is PHledger's own site, phledger.com;
// its wording and prices follow phledger.com (src/content/*.ts in
// lesliezhili/phledger) — keep them in step when the site changes.

import type { Knowledge } from './customer-service'
import { FRONT_DESK } from './front-desk'

export type ChatClientId = 'phledger'
type Lang = 'en' | 'zh'

export interface ChatClient {
  id: ChatClientId
  business: string
  origins: string[] // sites allowed to call the chat API for this client
  contactEmail: string
  knowledge: Record<Lang, Knowledge>
  /** Plain-language facts for the AI's grounded answers (same facts as `knowledge`). */
  facts: Record<Lang, string>
}

const BRIEF = 'https://phledger.com/#contact'
const PRICING = 'https://phledger.com/cloud#pricing'
const FD = `A$${FRONT_DESK.prices.standard} / A$${FRONT_DESK.prices.high_value}`

export const CHAT_CLIENTS: Record<ChatClientId, ChatClient> = {
  phledger: {
    id: 'phledger',
    business: 'PHledger',
    origins: ['https://phledger.com', 'https://www.phledger.com', 'http://localhost:3000'],
    contactEmail: 'zhili@phledger.com',
    knowledge: {
      en: {
        professional: true,
        address: 'Kew East, Melbourne, Victoria. Our engineers work inside client teams, on site or remotely.',
        bookingLink: BRIEF,
        prices: [
          { item: 'Decision sprint', price: 'A$18,000 fixed, 2 weeks' },
          { item: 'Embedded FDE', price: 'A$26,000 per engineer per month, 3-month minimum' },
          { item: 'Fixed-scope build', price: 'from A$60,000, paid per tested milestone' },
          { item: 'AI Front Desk', price: `${FD} per order captured, no monthly fee` },
        ],
        faqs: [
          { keywords: ['fde', 'forward deployed', 'forward-deployed', 'what do you do', 'embedded'], answer: 'PHledger is a Forward Deployed Engineering partner for data, AI and cloud. A senior engineer works inside your team, helps you make the platform decisions, builds test-first on your cloud, and trains your people as we go, so you keep the capability, not just the code.' },
          { keywords: ['aws', 'azure', 'google cloud', 'gcp', 'cloud', 'migration', 'migrate'], answer: 'We implement on AWS, Azure and Google Cloud: cloud selection, landing zones, migration and modernisation, FinOps, security and governance, with Terraform or OpenTofu, inside your own accounts. A two-week decision sprint compares the options on your workloads first.' },
          { keywords: ['databricks', 'snowflake', 'dbt', 'kafka', 'spark', 'lakehouse', 'warehouse', 'pipeline', 'coalesce'], answer: 'We build lakehouses and warehouses on Databricks, Snowflake, dbt and Coalesce, modernise Spark, Kafka and Hadoop, and set up end-to-end pipelines with CI/CD for data. Open source first.' },
          { keywords: ['training', 'train', 'upskill', 'course', 'learn'], answer: 'FDE Training is hands-on: your team learns Databricks, Snowflake, dbt, Kafka, Terraform, AI-ready data and LLM engineering by shipping real work next to our engineers.' },
          { keywords: ['dashboard', 'report', 'kpi', 'bi', 'analytics', 'month-end', 'finance'], answer: 'Our Data & AI Analytics work covers decision analytics, KPI and finance-reporting automation, ML models and LLM applications built on data you can trust.' },
          { keywords: ['industry', 'industries', 'aged care', 'ndis', 'health', 'government', 'financial services'], answer: 'We work across every industry, with deep roots in aged care and NDIS, health and community services, financial services, government, education, retail, manufacturing, energy, property and professional services.' },
          { keywords: ['front desk', 'missed call', 'google review', 'small business'], answer: `For small businesses, the AI Front Desk answers missed calls and drafts Google review replies for ${FD} per order captured, with no monthly fee. It is run by PhLedger Marketing: https://phledgermarketing.vercel.app/front-desk` },
          { keywords: ['security', 'privacy', 'data stay', 'our data', 'confidential'], answer: 'We work inside your own cloud accounts, so your data stays with you. AI recommends; your people decide and sign off, and tests are written before anything ships.' },
          { keywords: ['canada', 'canadian', 'toronto', 'vancouver', 'calgary', 'montreal', 'montréal', 'cad', 'pipeda'], answer: 'Yes, we work with organisations in Canada as well as Australia. Engineers work remotely with your team, meeting in the overlap (late afternoon Toronto, early morning Melbourne), and we can build in Canadian cloud regions with PIPEDA (and Québec\'s Law 25 where it applies) in mind. Prices on our site are in Australian dollars; your statement of work sets the currency. More: https://phledger.com/canada' },
          { keywords: ['how long', 'timeline', 'start', 'when can'], answer: 'A decision sprint takes two weeks. Embedded engagements run by the sprint or month, with a three-month minimum. Every engagement is confirmed in a written statement of work before it starts.' },
        ],
        enquiryFallback: `Thanks for your question. The quickest way to get a proper answer is a short brief: tell us your stack and the problem you want solved, and an engineer will reply. ${BRIEF}`,
      },
      zh: {
        professional: true,
        address: '墨尔本 Kew East（维多利亚州）。工程师融入客户团队，现场或远程工作。',
        bookingLink: BRIEF,
        prices: [
          { item: '决策冲刺', price: 'A$18,000 固定费用，2 周' },
          { item: '融入式 FDE', price: '每名工程师每月 A$26,000，至少 3 个月' },
          { item: '固定范围交付', price: 'A$60,000 起，按通过测试的里程碑付款' },
          { item: 'AI 前台', price: `每单 ${FD}，无月费` },
        ],
        faqs: [
          { keywords: ['fde', '前向部署', '你们做什么', '融入'], answer: 'PHledger 是数据、AI 与云的前向部署工程（FDE）伙伴：资深工程师融入你的团队，帮你做平台决策，在你的云上以测试先行的方式交付，并边做边教。你留下的是能力，而不只是代码。' },
          { keywords: ['aws', 'azure', '谷歌云', '云', '迁移'], answer: '我们在 AWS、Azure 和谷歌云上实施：云选型、着陆区、迁移与现代化、FinOps、安全与治理，用 Terraform 或 OpenTofu 在你自己的账号内交付。先用两周的决策冲刺在你的工作负载上比较各方案。' },
          { keywords: ['databricks', 'snowflake', 'dbt', 'kafka', 'spark', '湖仓', '数仓', '数据管道'], answer: '我们基于 Databricks、Snowflake、dbt 与 Coalesce 建设湖仓和数仓，现代化改造 Spark、Kafka 与 Hadoop，并搭建端到端数据管道和数据 CI/CD。开源优先。' },
          { keywords: ['培训', '学习', '课程'], answer: 'FDE 培训是实操式的：你的团队在与我们一起交付真实项目的过程中学习 Databricks、Snowflake、dbt、Kafka、Terraform、AI 就绪数据与大模型工程。' },
          { keywords: ['报表', '看板', 'kpi', '分析', '财务'], answer: '数据与 AI 分析包括决策分析、KPI 与财务报表自动化、机器学习模型，以及构建在可信数据之上的大模型应用。' },
          { keywords: ['行业', '养老', 'ndis', '医疗', '政府', '金融'], answer: '我们覆盖所有行业，在养老与 NDIS、健康与社区服务、金融、政府、教育、零售、制造、能源、地产和专业服务领域有积累。' },
          { keywords: ['前台', '漏接', '差评', '小店', '小生意'], answer: `小商家可以用 AI 前台：接漏接电话、写 Google 评价回复草稿，每单 ${FD}，无月费。由 PhLedger Marketing 提供：https://phledgermarketing.vercel.app/front-desk` },
          { keywords: ['安全', '隐私', '数据'], answer: '我们在你自己的云账号内工作，数据留在你手里。AI 给建议，由你的团队决定并签字确认；上线前先写好测试。' },
          { keywords: ['加拿大', '多伦多', '温哥华', '卡尔加里', '蒙特利尔', '加元'], answer: '是的，除了澳大利亚，我们也服务加拿大的机构。工程师远程融入你的团队，利用两地重叠时段开会（多伦多下午晚些时候 = 墨尔本清晨），并可在加拿大本地云区域建设，按 PIPEDA（以及适用时魁北克 Law 25）设计。网站价格以澳元标示，币种以工作说明书为准。详情：https://phledger.com/canada' },
          { keywords: ['多久', '周期', '什么时候开始'], answer: '决策冲刺两周。融入式合作按迭代或按月，至少三个月。每次合作开始前都会以书面工作说明书确认。' },
        ],
        enquiryFallback: `谢谢您的提问。最快得到准确答复的方式是发一份简短需求：告诉我们您的技术栈和想解决的问题，会有工程师回复您。${BRIEF}`,
      },
    },
    facts: {
      en: [
        'PHledger (Property Health Ledger) is a Melbourne-based (Kew East) Forward Deployed Engineering partner for data, AI and cloud, across all industries, working with organisations in Australia and Canada.',
        'Canada: engineers work remotely with Canadian teams, meeting in the time-zone overlap (late afternoon Toronto = early morning Melbourne); builds can stay in Canadian cloud regions (AWS ca-central-1 / ca-west-1, Azure Canada Central / East, Google Cloud northamerica-northeast1 / 2), designed around PIPEDA and Québec Law 25 where it applies. Site prices are in AUD; the statement of work sets the currency. Canadian page: https://phledger.com/canada',
        'Services: FDE Decision Partnership; Cloud Implementation on AWS, Azure and Google Cloud (Terraform/OpenTofu, inside the client\'s accounts); Platform Implementation (Databricks, Snowflake, dbt, Coalesce, Spark, Kafka, Hadoop modernisation, data CI/CD; open source first); FDE Training (hands-on, learning by shipping); Data & AI Analytics (KPI and finance-reporting automation, ML, LLM applications).',
        'Approach: engineers embedded in the client team; train while we build; AI recommends, people decide; tests written first; foundations (TOGAF-aligned architecture, DAMA-DMBOK data management) before AI.',
        `Prices (AUD, ex GST, indicative; confirmed in a written statement of work): Decision sprint A$18,000 fixed for 2 weeks; Embedded FDE A$26,000 per engineer per month, 3-month minimum; Fixed-scope build from A$60,000 paid per tested milestone; first brief and conversation free. Details: ${PRICING}`,
        `Small businesses: AI Front Desk (missed calls and Google reviews), ${FD} per order, no monthly fee, run by PhLedger Marketing.`,
        `To start: send a short brief at ${BRIEF} or email zhili@phledger.com. LinkedIn: https://www.linkedin.com/company/phledger/`,
      ].join('\n'),
      zh: '', // filled below from the English facts; the agent answers in the visitor's language
    },
  },
}
CHAT_CLIENTS.phledger.facts.zh = CHAT_CLIENTS.phledger.facts.en

export function chatClientFor(id: unknown): ChatClient | null {
  return typeof id === 'string' && Object.prototype.hasOwnProperty.call(CHAT_CLIENTS, id) ? CHAT_CLIENTS[id as ChatClientId] : null
}
