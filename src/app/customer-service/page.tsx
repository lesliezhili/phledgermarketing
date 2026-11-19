'use client'

import { useState } from 'react'
import Link from 'next/link'
import { handleMessage, aftersalesPlan, type CsChannel, type CsResult, type Knowledge } from '@/lib/customer-service'
import { AI_CUSTOMER_SERVICE } from '@/lib/catalog'

const DEMO_BUSINESS = 'Demo Café'
const demoKnowledge: Knowledge = {
  hours: 'Tue–Sun 8am–4pm',
  address: '1 Example St, Melbourne',
  prices: [{ item: 'Cheesecake', price: '$68 (8 inch)' }, { item: 'Latte', price: '$5.50' }],
  orderLink: 'https://example.com/order',
  reviewLink: 'https://example.com/review',
  returnsPolicy: 'Tell us within 24 hours of pick-up.',
  faqs: [{ keywords: ['store', 'fridge', 'keep', '保存'], answer: 'Keep cakes in the fridge and enjoy within 3 days.' }],
}

const examples = [
  { stage: 'Get customers', text: 'How much is the cheesecake?' },
  { stage: 'Get customers', text: 'Are you open on Sunday?' },
  { stage: 'Get customers', text: 'I want to order 2 lattes for pickup at 9' },
  { stage: 'Get customers', text: '蛋糕多少钱？' },
  { stage: 'Keep customers', text: 'Where is my order?' },
  { stage: 'Keep customers', text: 'How should I store the cake?' },
  { stage: 'Keep customers', text: 'Very disappointed, my order was wrong' },
  { stage: 'Keep customers', text: 'I want a refund' },
  { stage: 'Keep customers', text: 'Thank you, it was delicious!' },
]

const channels: { id: CsChannel; name: string }[] = [
  { id: 'webchat', name: 'Website AI agent' }, { id: 'email', name: 'Website email / form' },
  { id: 'phone', name: 'Phone call' }, { id: 'sms', name: 'Mobile SMS' },
  { id: 'whatsapp', name: 'WhatsApp' }, { id: 'messenger', name: 'Messenger' }, { id: 'instagram', name: 'Instagram' }, { id: 'wechat', name: 'WeChat' },
]

const STAGE_LABEL = { presale: 'Presale: get customers', purchase: 'Purchase', aftersales: 'Aftersales: keep customers' }
const ROUTE_LABEL: Record<string, string> = {
  auto: 'sent automatically',
  zhi_li: 'Zhi Li approves the reply',
  zhi_li_then_client: 'Zhi Li and the owner decide',
  escalate_owner: 'owner told now',
  person_sends: 'a person sends',
}

const journey = aftersalesPlan({ purchaseDate: '2026-12-01', kind: 'food', repeatEveryDays: 30, marketingConsent: true, hasReviewLink: true })

export default function CustomerServicePage() {
  const [text, setText] = useState(examples[0].text)
  const [channel, setChannel] = useState<CsChannel>('webchat')
  const [result, setResult] = useState<CsResult | null>(null)

  const run = (e?: React.FormEvent, t = text) => {
    e?.preventDefault()
    if (!t.trim()) return
    setResult(handleMessage({ business: DEMO_BUSINESS, text: t, channel, knowledge: demoKnowledge, policy: { mode: 'zhi_li' } }))
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-linkedin to-blue-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm uppercase tracking-wider text-blue-200 mb-3">AI Customer Service</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get customers before the sale. Keep them after it.</h1>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto">
            On your website (an AI agent chat and your enquiry email) and on your phone and mobile (calls answered or texted back, SMS), plus WhatsApp, Messenger, Instagram and WeChat. It answers in under a minute from facts you approve, in English or Chinese, and hands anything about money, blame or safety to a person.
          </p>
        </div>
      </section>

      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Presale: get customers</h2>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>Every enquiry and missed call answered within 60 seconds</li>
              <li>Prices, hours, address and booking or order links from your approved facts only</li>
              <li>Service businesses: the questions you need to quote</li>
              <li>Orders captured and confirmed (with Order Automation)</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Aftersales: keep customers</h2>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>Order status, how-to and care questions answered</li>
              <li>Complaints: instant apology, then a person replies the same day</li>
              <li>Refunds and faults decided by you, with your consumer-law rights stated</li>
              <li>Thank-you, check-in, an honest review request and a reminder to come back</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-14 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Try it</h2>
          <p className="text-center text-gray-600 mb-8">Send a message to {DEMO_BUSINESS}, an example business. Nothing is sent anywhere.</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {examples.map(ex => (
              <button key={ex.text} type="button" onClick={() => { setText(ex.text); run(undefined, ex.text) }}
                className="bg-white border border-gray-300 hover:border-linkedin text-sm px-3 py-1.5 rounded-full">
                {ex.text}
              </button>
            ))}
          </div>
          <form onSubmit={run} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 max-w-3xl mx-auto mb-8">
            <label htmlFor="cs-text" className="sr-only">Customer message</label>
            <input id="cs-text" value={text} onChange={e => setText(e.target.value)} maxLength={500}
              className="border border-gray-300 rounded-lg px-4 py-2" placeholder="Type a customer message" />
            <label htmlFor="cs-channel" className="sr-only">Channel</label>
            <select id="cs-channel" value={channel} onChange={e => setChannel(e.target.value as CsChannel)} className="border border-gray-300 rounded-lg px-3 py-2">
              {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="submit" className="bg-linkedin text-white px-6 py-2 rounded-lg font-semibold hover:bg-linkedin-dark">Send</button>
          </form>

          {result && (
            <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl p-6" data-testid="cs-result">
              <p className="text-sm text-gray-500 mb-1">{STAGE_LABEL[result.stage]} · {result.intent.replace('_', ' ')}</p>
              <p className="text-xs text-gray-500 mb-3">Instant {channel === 'phone' ? 'spoken reply' : 'reply'} ({ROUTE_LABEL[result.replyDecision.route]})</p>
              <div className="bg-blue-50 rounded-lg p-4 whitespace-pre-line text-gray-900 mb-4">{result.reply}</div>
              {result.smsFollowUp && <p className="text-sm text-gray-700 mb-3"><strong>Texted after the call:</strong> {result.smsFollowUp}</p>}
              {result.handover ? (
                <p className="text-sm text-gray-700"><strong>Handed to a person:</strong> {ROUTE_LABEL[result.handover.decision.route]}, within {result.handover.withinHours} h. {result.handover.note.split('\n')[0]}</p>
              ) : (
                <p className="text-sm text-green-700"><strong>Answered by AI</strong>: no one needed.</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-14 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">After every purchase</h2>
        <ol className="space-y-2">
          {journey.map(t => (
            <li key={t.type} className="flex gap-3 bg-white border border-gray-200 rounded-lg p-3 text-sm">
              <span className="font-mono text-gray-500 shrink-0">{t.date.slice(5)}</span>
              <span className="text-gray-800">{t.purpose}{t.marketing && <span className="text-gray-500"> (only with the customer&apos;s consent)</span>}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="py-14 bg-gray-50 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Add it to any plan</h2>
          <p className="text-gray-600 mb-6">
            ${AI_CUSTOMER_SERVICE.monthly} a month, {AI_CUSTOMER_SERVICE.includedConversations} conversations included, then ${AI_CUSTOMER_SERVICE.perExtraConversation.toFixed(2)} each; ${AI_CUSTOMER_SERVICE.perExtraStore} per extra store; ${AI_CUSTOMER_SERVICE.setup} one-off setup. AUD, excluding GST.
          </p>
          <Link href="/booking?service=12" className="inline-block bg-linkedin text-white px-6 py-3 rounded-lg font-semibold hover:bg-linkedin-dark">Book AI Customer Service</Link>
        </div>
      </section>
    </div>
  )
}
