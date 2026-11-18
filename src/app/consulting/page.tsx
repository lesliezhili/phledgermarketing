'use client'

import Link from 'next/link'
import { BRANDS } from '@/lib/brands'

const consulting = BRANDS['phledger-consulting']
// Visits from this site to phledger.com are tagged as referrals from PhLedger Marketing.
const toConsulting = (campaign: string) => {
  const url = new URL(consulting.site)
  url.searchParams.set('utm_source', 'phledger-marketing')
  url.searchParams.set('utm_medium', 'referral')
  url.searchParams.set('utm_campaign', campaign)
  return url.toString()
}

const steps = [
  { when: 'Week 0', name: 'Free data health check', desc: '60 minutes with your spreadsheets and reports. You leave with a one-page fix list.' },
  { when: 'Days 1–10', name: 'Engineer inside your business', desc: 'We work in your real systems with your team, and ship one thing you will use every day.' },
  { when: 'Day 10', name: 'Hand over and measure', desc: 'You own everything. We measure hours saved or decisions made faster, then plan what is next.' },
]

const builds = [
  { icon: '📊', name: 'Dashboards and BI', desc: 'One trusted number per measure, refreshed automatically: sales, stock, staffing, cash.' },
  { icon: '🤖', name: 'AI automation', desc: 'Enquiry replies, invoice sorting, weekly reports — AI drafts, your people approve.' },
  { icon: '🧱', name: 'Data foundations', desc: 'Clean sources, clear owners and checks, so every report agrees with the others.' },
]

export default function ConsultingPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-gray-900 via-slate-800 to-blue-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm uppercase tracking-wider text-blue-200 mb-3">PhLedger Consulting</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Data, BI and AI that ship in weeks</h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">{consulting.tagline}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={toConsulting('consulting-page-hero')} target="_blank" rel="noopener noreferrer"
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
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">The FDE pilot</h2>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          Forward-deployed engineering: an engineer works inside your business and ships something real, fast.
        </p>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <li key={s.name} className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-xs text-gray-500 mb-1">{s.when}</p>
              <h3 className="font-bold text-gray-900 mb-2">{i + 1}. {s.name}</h3>
              <p className="text-sm text-gray-600">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">What we build</h2>
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

      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">We run on what we build</h2>
        <p className="text-gray-600 mb-6">
          PhLedger Marketing — instant replies, review triage, daily ad pacing and profit-checked quotes — is built the FDE way and used every day.
          The same engineering is available for your business.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href={toConsulting('consulting-page-footer')} target="_blank" rel="noopener noreferrer"
            className="bg-linkedin text-white px-6 py-3 rounded-lg font-semibold hover:bg-linkedin-dark transition-colors">
            Visit phledger.com
          </a>
          <Link href="/speed-to-lead" className="text-linkedin underline py-3">See the automation in action</Link>
        </div>
      </section>
    </div>
  )
}
