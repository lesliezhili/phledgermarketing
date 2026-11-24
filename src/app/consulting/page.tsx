'use client'

import Link from 'next/link'
import { BRANDS } from '@/lib/brands'
import { referralLink } from '@/lib/consulting-referrals'

const consulting = BRANDS['phledger-consulting']

const approach = [
  { name: 'Forward deployed', desc: 'Engineers work inside your team, your tools and your stand-ups, and ship to your production, not a black box.' },
  { name: 'Train while we build', desc: 'Every engagement transfers skills. When we leave, your team runs and extends the platform.' },
  { name: 'AI recommends, people decide', desc: 'Foundations first, tests written first, and your leaders sign off every decision.' },
]

const builds = [
  { icon: '🧭', name: 'Decision partnership', desc: 'Evidence-based choices on cloud, data and AI, then delivery driven to the end.' },
  { icon: '☁️', name: 'Cloud and data platforms', desc: 'AWS, Azure or Google Cloud; Databricks, Snowflake and dbt; pipelines and CI/CD for data. Open source first.' },
  { icon: '📊', name: 'Data & AI analytics', desc: 'KPI and finance-reporting automation, ML models and LLM applications on data you can trust.' },
]

export default function ConsultingPage() {
  const ladder = consulting.ladder ?? []
  return (
    <div>
      <section className="bg-gradient-to-br from-gray-900 via-slate-800 to-blue-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm uppercase tracking-wider text-blue-200 mb-3">PHledger · Forward Deployed Engineering · Melbourne</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{consulting.tagline}</h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
            When your marketing grows past spreadsheets, PhLedger Marketing&apos;s sister business embeds senior data, AI and cloud engineers in your team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={referralLink('consulting-page-hero')} target="_blank" rel="noopener noreferrer"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              {consulting.pilotOffer.cta}
            </a>
            <Link href="/services" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors">
              Marketing services
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Embedded, not outsourced</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {approach.map(a => (
            <div key={a.name} className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">{a.name}</h3>
              <p className="text-sm text-gray-600">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">What PHledger builds</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {builds.map(b => (
              <div key={b.name} className="bg-white border border-gray-200 rounded-xl p-6">
                <p className="text-3xl mb-2">{b.icon}</p>
                <h3 className="font-bold text-gray-900 mb-2">{b.name}</h3>
                <p className="text-sm text-gray-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">How to start</h2>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          Indicative prices from phledger.com, AUD excluding GST. Every engagement is confirmed in a written statement of work.
        </p>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ladder.map((step, i) => (
            <li key={step.name} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col">
              <h3 className="font-bold text-gray-900 mb-1">{i + 1}. {step.name}</h3>
              <p className="text-sm text-gray-600 flex-1">{step.price}</p>
              <a href={referralLink(`consulting-ladder-${i + 1}`, step.path)} target="_blank" rel="noopener noreferrer"
                className="text-linkedin underline text-sm mt-3">Details on phledger.com</a>
            </li>
          ))}
        </ol>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">We run on what we build</h2>
          <p className="text-gray-600 mb-6">
            PhLedger Marketing (instant replies, review triage, daily ad pacing and profit-checked quotes) is built the FDE way and used every day.
            The same engineering is available for your organisation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={referralLink('consulting-page-footer', '/')} target="_blank" rel="noopener noreferrer"
              className="bg-linkedin text-white px-6 py-3 rounded-lg font-semibold hover:bg-linkedin-dark transition-colors">
              Visit phledger.com
            </a>
            <Link href="/speed-to-lead" className="text-linkedin underline py-3">See the automation in action</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
