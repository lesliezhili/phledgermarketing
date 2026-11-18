'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import BibleVerse from '@/components/BibleVerse'
import { services, channels, serviceLabel } from '@/lib/catalog'

export default function ServicesPage() {
  const { t } = useI18n()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('services.title')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-2">{t('services.subtitle')}</p>
        <p className="text-gray-500 text-sm max-w-2xl mx-auto">{t('services.payment.note')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {services.map((service) => (
          <div key={service.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col">
            <div className="text-3xl mb-3">{service.icon}</div>
            <h3 className="font-bold text-gray-900 mb-1">{service.name}</h3>
            <p className="text-sm text-gray-600 mb-3 flex-1">{service.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-linkedin font-bold">{serviceLabel(service)}</span>
            </div>
            <Link
              href={`/booking?service=${service.id}`}
              className="block mt-4 text-center bg-linkedin text-white py-2 rounded-lg text-sm font-medium hover:bg-linkedin-dark transition-colors"
            >
              {t('services.book.btn')}
            </Link>
          </div>
        ))}
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
        <p className="font-bold text-gray-900">⚡ On the tools all day and missing calls?</p>
        <p className="text-sm text-gray-600 mb-3">See the instant reply we send your customers within 60 seconds.</p>
        <Link href="/speed-to-lead" className="inline-block bg-linkedin text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-linkedin-dark transition-colors">
          Try the Speed-to-Lead Demo
        </Link>
      </div>

      <div className="mb-12 bg-green-50 border border-green-200 rounded-xl p-5 text-center">
        <p className="font-bold text-gray-900">Not ready for a monthly package?</p>
        <p className="text-sm text-gray-600 mb-3">Tiny businesses (aggregated annual turnover under $2 million) can pay as you go: pay for each new customer enquiry or call, with a small start-up fee and monthly minimum. No contract.</p>
        <Link href="/pricing#payg" className="inline-block bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
          See Pay-Per-Lead Prices
        </Link>
      </div>

      <div className="mb-12 bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
        <p className="font-bold text-gray-900">Need dashboards, clean data or a custom AI workflow?</p>
        <p className="text-sm text-gray-600 mb-3">PHledger (phledger.com) embeds senior data, AI and cloud engineers in your team: they help you decide, build test-first and train your people.</p>
        <Link href="/consulting" className="inline-block bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-900 transition-colors">
          Data, BI &amp; AI Consulting
        </Link>
      </div>

      <div className="mb-12 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Delivered on the channels that fit your business</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {channels.map((c) => (
            <Link key={c.id} href={c.href} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm transition-colors">
              {c.icon} {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <BibleVerse />
      </div>
    </div>
  )
}
