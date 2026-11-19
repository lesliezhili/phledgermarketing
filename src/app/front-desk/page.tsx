'use client'

import { useState } from 'react'
import Link from 'next/link'
import { frontDeskOffer, estimate, FRONT_DESK, type FrontDeskTier, type Lang } from '@/lib/front-desk'

const COPY = {
  en: {
    eyebrow: 'AI Front Desk · Pay per order',
    title: 'Never lose an order to a missed call. Never leave a bad review unanswered.',
    lead: "When you can't pick up, the AI answers in English, Mandarin or Cantonese, takes down the order and texts it to you. When a Google review comes in, it logs it, works out what went wrong and drafts a reply for you to approve. No monthly fee: you pay only for each order it wins you.",
    how: [
      { title: 'Forward on no-answer', body: "Keep your number. Calls you don't answer in 3–4 rings, or after hours, go to the AI." },
      { title: 'Answer and take the order', body: 'Name, number, what they need, when and where. Callers are told it is an AI assistant and the call may be recorded.' },
      { title: 'Text you the summary', body: 'One screen on your phone, with the transcript. Anything about money, complaints or safety is flagged for you.' },
      { title: 'Catch hang-ups', body: "Callers who hang up get a text within 60 seconds: 'Sorry we missed you — how can we help?'" },
      { title: 'Every Google review handled', body: 'Logged, tagged (wait, attitude, price, quality) and a reply drafted. You approve; critical reviews come to you straight away.' },
    ],
    pricingTitle: 'One order captured, one fee. Nothing else.',
    perOrder: 'per order',
    included: 'Included at no extra cost',
    counts: 'What counts as one order',
    never: 'Never charged',
    cap: (n: number) => `Monthly cap: you choose a maximum (default $${n}). Once reached, the AI keeps working that month at no charge.`,
    pilot: (n: number) => `Pilot: your first ${n} orders are free.`,
    calcTitle: 'What missed calls cost you',
    missed: 'Missed calls per week', rate: 'Share that would have become an order (%)', value: 'Average order value ($)', tier: 'Type of business',
    orders: 'Orders recovered / month', revenue: 'Revenue recovered / month', fee: 'You pay / month', roi: 'Return per $1',
    estimateNote: 'Estimate only. Assumes 4.3 weeks a month.',
    applyTitle: 'Join the pilot', business: 'Business name', contact: 'Email or mobile', industry: 'Industry', consent: 'I agree to be contacted about the pilot',
    submit: 'Apply', sent: 'Application received. We will contact you within one business day.',
    also: 'Want the full inbox (website chat, email, social) and aftersales too?', alsoLink: 'See AI Customer Service',
  },
  zh: {
    eyebrow: 'AI 前台 · 按单收费',
    title: '漏接电话不再丢单，Google 差评不再没人回。',
    lead: '你没空接电话时，AI 用英语、普通话或粤语接听、记下订单，并马上短信发给你。Google 有新评价时，它自动记录、分析问题出在哪，并写好回复草稿等你批准。没有月费——接到一单，收一笔钱。',
    how: [
      { title: '无人接听自动转接', body: '号码不变。3–4 声没接或下班后的来电转给 AI。' },
      { title: '接听并记下订单', body: '姓名、电话、需求、时间和地点。会告知来电者这是 AI 助理，通话可能录音。' },
      { title: '短信发你摘要', body: '一屏看完，附文字记录。涉及钱、投诉或安全的事会标出来交给你。' },
      { title: '挂断也不漏', body: '没等接通就挂断的来电，60 秒内自动发短信：“抱歉错过您的电话，请问有什么可以帮您？”' },
      { title: '每条 Google 评价都处理', body: '自动记录、打标签（等待、态度、价格、品质）并写好回复草稿；你批准后发布，严重差评第一时间通知你。' },
    ],
    pricingTitle: '接到一单，收一笔钱。没有其他费用。',
    perOrder: '每单',
    included: '已包含，不另收费',
    counts: '怎样算一单',
    never: '永不收费',
    cap: (n: number) => `月度封顶：由你设定上限（默认 $${n}）。到达上限后，当月 AI 继续免费工作。`,
    pilot: (n: number) => `试点：前 ${n} 单免费。`,
    calcTitle: '漏接电话让你损失多少',
    missed: '每周漏接电话', rate: '本可成交的比例（%）', value: '平均客单价（$）', tier: '生意类型',
    orders: '每月挽回订单', revenue: '每月挽回营业额', fee: '每月费用', roi: '每 $1 回报',
    estimateNote: '仅为估算，按每月 4.3 周计算。',
    applyTitle: '申请试点', business: '店名', contact: '邮箱或手机', industry: '行业', consent: '我同意就试点事宜被联系',
    submit: '提交申请', sent: '已收到申请，我们会在 1 个工作日内联系您。',
    also: '还想要完整收件箱（网站聊天、邮件、社交媒体）和售后服务？', alsoLink: '了解 AI 客服',
  },
}

export default function FrontDeskPage() {
  const [lang, setLang] = useState<Lang>('en')
  const t = COPY[lang]
  const offer = frontDeskOffer(lang)
  const [missed, setMissed] = useState(10)
  const [rate, setRate] = useState(40)
  const [value, setValue] = useState(60)
  const [tier, setTier] = useState<FrontDeskTier>('standard')
  const est = estimate({ missedPerWeek: missed, conversionPct: rate, avgOrderValue: value, tier })

  const [form, setForm] = useState({ business: '', contact: '', industry: '', consent: false })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const apply = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/front-desk/apply', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, missedPerWeek: missed, language: lang, source: 'phledgermarketing/front-desk' }),
      })
      const data = await res.json()
      if (res.ok) { setStatus('sent'); setMessage(t.sent); return }
      if (data.fallback) { window.location.href = data.fallback; setStatus('sent'); setMessage(data.message); return }
      setStatus('error'); setMessage(data.error ?? 'Something went wrong')
    } catch {
      setStatus('error'); setMessage('Could not reach the server. Please try again.')
    }
  }

  const input = 'w-full border border-gray-300 rounded-lg px-3 py-2'
  return (
    <div lang={lang === 'zh' ? 'zh-CN' : 'en-AU'}>
      <section className="bg-gradient-to-br from-gray-900 to-linkedin text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm uppercase tracking-wider text-blue-200">{t.eyebrow}</p>
            <button type="button" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} className="text-sm border border-white/40 rounded px-3 py-1 hover:bg-white/10">
              {lang === 'en' ? '中文' : 'English'}
            </button>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 max-w-4xl">{t.title}</h1>
          <p className="text-lg text-blue-100 max-w-3xl">{t.lead}</p>
        </div>
      </section>

      <section className="py-14 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {t.how.map((s, i) => (
            <li key={s.title} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs text-gray-500 mb-1">{String(i + 1).padStart(2, '0')}</p>
              <h2 className="font-bold text-gray-900 mb-2">{s.title}</h2>
              <p className="text-sm text-gray-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="pricing" className="py-14 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">{t.pricingTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {offer.tiers.map(tr => (
              <div key={tr.id} className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900">{tr.name}</h3>
                <p className="text-3xl font-bold text-linkedin my-2">${tr.price} <span className="text-base font-normal text-gray-500">{t.perOrder}</span></p>
                <p className="text-sm text-gray-600 mb-2">{tr.body}</p>
                <p className="text-xs text-gray-500">{tr.examples.join(' · ')}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {[[t.included, offer.included], [t.counts, offer.counts], [t.never, offer.neverCharged]].map(([title, items]) => (
              <div key={title as string} className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-2">{title as string}</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">{(items as string[]).map(x => <li key={x}>{x}</li>)}</ul>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-6 text-center">{t.cap(offer.defaultCap)} {t.pilot(offer.pilotFreeOrders)} AUD, excluding GST.</p>
        </div>
      </section>

      <section className="py-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">{t.calcTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-sm">{t.missed}: <strong>{missed}</strong>
              <input type="range" min={0} max={60} value={missed} onChange={e => setMissed(Number(e.target.value))} className="w-full" />
            </label>
            <label className="block text-sm">{t.rate}: <strong>{rate}</strong>
              <input type="range" min={0} max={100} step={5} value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full" />
            </label>
            <label className="block text-sm">{t.value}: <strong>{value}</strong>
              <input type="range" min={10} max={2000} step={10} value={value} onChange={e => setValue(Number(e.target.value))} className="w-full" />
            </label>
            <label className="block text-sm">{t.tier}
              <select value={tier} onChange={e => setTier(e.target.value as FrontDeskTier)} className={input}>
                {offer.tiers.map(tr => <option key={tr.id} value={tr.id}>{tr.name} (${tr.price})</option>)}
              </select>
            </label>
          </div>
          <dl className="grid grid-cols-2 gap-3" data-testid="fd-estimate">
            {[[t.orders, String(est.ordersPerMonth)], [t.revenue, `$${est.revenuePerMonth.toLocaleString('en-AU')}`], [t.fee, `$${est.feePerMonth}`], [t.roi, `$${est.returnPerDollar}`]].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-lg p-4"><dt className="text-xs text-gray-500">{k}</dt><dd className="text-2xl font-bold text-gray-900">{v}</dd></div>
            ))}
            <p className="col-span-2 text-xs text-gray-500">{t.estimateNote}</p>
          </dl>
        </div>
      </section>

      <section id="pilot" className="py-14 bg-gray-50">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">{t.applyTitle}</h2>
          <form onSubmit={apply} className="space-y-3">
            <label className="block text-sm">{t.business}<input required value={form.business} onChange={e => setForm({ ...form, business: e.target.value })} className={input} /></label>
            <label className="block text-sm">{t.contact}<input required value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className={input} /></label>
            <label className="block text-sm">{t.industry}<input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className={input} /></label>
            <label className="flex gap-2 text-sm items-start"><input type="checkbox" required checked={form.consent} onChange={e => setForm({ ...form, consent: e.target.checked })} className="mt-1" />{t.consent}</label>
            <button type="submit" disabled={status === 'sending'} className="w-full bg-linkedin text-white py-3 rounded-lg font-semibold hover:bg-linkedin-dark disabled:opacity-60">{t.submit}</button>
            {message && <p role="status" className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-green-700'}`}>{message}</p>}
          </form>
          <p className="text-sm text-gray-600 text-center mt-8">
            {t.also} <Link href="/customer-service" className="text-linkedin underline">{t.alsoLink}</Link>
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">{FRONT_DESK.languages.join(' · ')}</p>
        </div>
      </section>
    </div>
  )
}
