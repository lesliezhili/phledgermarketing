'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { packages, commitments, loyaltyPerks, leadPrices, leadNotCharged, paygPerks, LEAD_RULES, PAY_PER_LEAD_ID, SETUP_FEE, MIN_MONTHS } from '@/lib/catalog'

const faqs = [
  { q: 'Is there anything free?', a: 'Yes. The Marketing Health Check is free for any business, with no obligation. It tells you what to fix first and which channels suit you.' },
  { q: 'What does the setup fee cover?', a: `A one-off $${SETUP_FEE}: fixing what blocks sales (offer, prices, contact details, print and profiles), one page to buy or enquire with QR codes and tracking, and connecting your channels. It is waived when you pay 6 or 12 months up front.` },
  { q: 'What counts as a lead?', a: `A new customer reaching your business: an email, website form or social message asking to buy or book, or a phone call of ${LEAD_RULES.minCallSeconds} seconds or more to your tracked number. You pay when the lead arrives, whether or not it becomes a sale — you decide how to follow it up.` },
  { q: 'How do you know a lead came from you?', a: 'We give you a tracked phone number and tracked enquiry form or email, and log every lead with its date, channel and contact. You see each one in your dashboard and can dispute it within 7 days.' },
  { q: 'Pay per lead or a monthly package?', a: 'Pay per lead suits tiny businesses that want to pay only for results. A package suits businesses that want marketing run for them every month at a fixed price. Lead spend in the last 60 days comes off the setup fee when you move to a package.' },
  { q: 'Is ad spend included?', a: 'No. Ad spend is paid by you straight to the platform, so you see every dollar. A typical small-business budget is $300–$600 a month.' },
  { q: 'Can I change package or cancel?', a: `Yes. Move up or down any month. Monthly plans have a ${MIN_MONTHS}-month minimum, then 30 days' notice. Your price is locked while you stay.` },
  { q: 'How does PhLedgerTax integration work?', a: 'All billing, invoicing, and tax reporting is handled automatically through our PhLedgerTax agent. Prices exclude GST.' },
]

export default function PricingPage() {
  const { t } = useI18n()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('pricing.title')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">{t('pricing.subtitle')}</p>
      </div>

      {/* Free entry point */}
      <div className="max-w-3xl mx-auto mb-12 bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-green-900">🩺 Start free: Marketing Health Check</p>
          <p className="text-sm text-green-800">A free review of your offer, prices and channels — for any business, no obligation.</p>
        </div>
        <Link href="/booking?service=1" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors whitespace-nowrap">
          Book Free Check
        </Link>
      </div>

      {/* Pay as you go */}
      <section id="payg" className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Pay As You Go: Pay Per Lead</h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          For tiny and small businesses. We market your business; you pay only when a new customer emails, messages or calls you.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {leadPrices.map(l => (
            <div key={l.type} className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-2xl mb-2">{l.icon}</p>
              <h3 className="font-bold text-gray-900 mb-1">{l.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{l.desc}</p>
              <p>
                <span className="text-3xl font-bold text-gray-900">${l.price}</span>
                <span className="text-sm text-gray-500"> per lead</span>
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
          <div className="bg-green-50 rounded-xl p-5">
            <h3 className="font-bold text-green-900 mb-2">What you get</h3>
            <ul className="space-y-1 text-sm text-green-900">
              {paygPerks.map(perk => <li key={perk}>✓ {perk}</li>)}
            </ul>
          </div>
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-2">Never charged</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {leadNotCharged.map(rule => <li key={rule}>✕ {rule}</li>)}
            </ul>
          </div>
        </div>
        <div className="text-center">
          <Link href={`/booking?service=${PAY_PER_LEAD_ID}`}
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Start Pay Per Lead
          </Link>
        </div>
      </section>

      <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Monthly Packages</h2>
      <p className="text-center text-gray-600 mb-10">We run your marketing for you, every month.</p>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        {packages.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl p-8 border-2 flex flex-col ${
              plan.popular ? 'border-linkedin shadow-xl md:scale-105' : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linkedin text-white px-4 py-1 rounded-full text-xs font-bold">
                {t('pricing.popular')}
              </div>
            )}
            <h3 className="text-2xl font-bold text-gray-900">{plan.tier}</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
              <span className="text-gray-500 ml-1">{t('common.month')}</span>
            </div>
            <p className="text-gray-600 mt-2 text-sm">{plan.desc}</p>
            <ul className="mt-6 space-y-3 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start text-sm">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/signup?plan=${plan.id}`}
              className={`block mt-8 text-center py-3 rounded-lg font-semibold transition-colors ${
                plan.popular
                  ? 'bg-linkedin text-white hover:bg-linkedin-dark'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Choose {plan.tier}
            </Link>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-gray-500 mb-16">
        AUD, excluding GST. One-off setup fee ${SETUP_FEE}. Ad spend paid by you directly to the platform.
      </p>

      {/* Commitment options */}
      <section className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Stay Longer, Pay Less</h2>
        <p className="text-center text-gray-600 mb-6">Pay up front and we waive the setup fee.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left p-3">How you pay</th>
                {packages.map(p => <th key={p.id} className="text-right p-3">{p.tier}</th>)}
                <th className="text-left p-3">What you get</th>
              </tr>
            </thead>
            <tbody>
              {commitments.map(c => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="p-3 font-medium text-gray-900">{c.name}</td>
                  {packages.map(p => (
                    <td key={p.id} className="p-3 text-right text-gray-900">
                      ${Math.round(p.price * (1 - c.discount))}<span className="text-gray-500">/mo</span>
                    </td>
                  ))}
                  <td className="p-3 text-gray-600">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Loyalty */}
      <section className="mb-16 bg-amber-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Loyalty Rewards</h2>
        <p className="text-center text-gray-600 mb-8">Fair prices that reward clients who stay — and those who send us friends.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loyaltyPerks.map(perk => (
            <div key={perk.name} className="bg-white rounded-xl border border-amber-100 p-5">
              <p className="text-2xl mb-2">{perk.icon}</p>
              <h3 className="font-bold text-gray-900 mb-1">{perk.name}</h3>
              <p className="text-sm text-gray-600">{perk.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{t('pricing.faq')}</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900">{faq.q}</h4>
              <p className="text-gray-600 mt-2 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
