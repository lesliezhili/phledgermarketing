'use client'

import { useI18n } from '@/lib/i18n'

const values = [
  { name: 'Faith First', desc: 'Every decision guided by Biblical principles and prayer.', icon: '✝' },
  { name: 'Ethical Marketing', desc: 'Honest, transparent, and value-driven marketing practices.', icon: '⚖️' },
  { name: 'Service Excellence', desc: 'Going above and beyond for every client we serve.', icon: '🌟' },
  { name: 'Community', desc: 'Building genuine relationships, not just connections.', icon: '🤝' },
  { name: 'Stewardship', desc: 'Responsible use of resources and transparent pricing.', icon: '💎' },
]

export default function AboutPage() {
  const { t } = useI18n()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('about.who')}</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          PhLedger LinkedIn Marketing is a faith-driven professional growth platform. 
          We help businesses and professionals grow their LinkedIn presence through 
          ethical, Bible-inspired marketing strategies.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">{t('about.mission')}</h2>
          <p className="text-blue-800">
            To empower professionals and businesses with faith-driven marketing tools 
            that honor God, serve communities, and deliver measurable results on LinkedIn.
          </p>
        </div>
        <div className="bg-amber-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">{t('about.vision')}</h2>
          <p className="text-amber-800">
            A world where professional marketing and Biblical values work together — 
            where every LinkedIn profile tells a story of purpose, integrity, and service.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{t('about.values')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {values.map((v, i) => (
            <div key={i} className="text-center p-6 bg-white border border-gray-200 rounded-xl">
              <div className="text-3xl mb-3">{v.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{v.name}</h3>
              <p className="text-sm text-gray-600">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ecosystem */}
      <section className="mb-16 bg-gray-900 text-white rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8">{t('about.ecosystem')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 border border-gray-700 rounded-xl">
            <h3 className="text-xl font-bold text-blue-400 mb-2">SilverConnect</h3>
            <p className="text-gray-400 text-sm">Free-tier architecture powering all PhLedger platforms with transparent pricing and seamless signup.</p>
          </div>
          <div className="text-center p-6 border border-linkedin rounded-xl bg-blue-900/30">
            <h3 className="text-xl font-bold text-linkedin mb-2">LinkedIn Marketing</h3>
            <p className="text-gray-300 text-sm">Faith-driven professional growth, content strategy, and audience engagement on LinkedIn.</p>
          </div>
          <div className="text-center p-6 border border-gray-700 rounded-xl">
            <h3 className="text-xl font-bold text-green-400 mb-2">PhLedgerTax</h3>
            <p className="text-gray-400 text-sm">Payment processing, invoicing, tax compliance, and accounting across all platforms.</p>
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('about.connect')}</h2>
        <p className="text-gray-600 mb-6">{t('about.built.under.god')}</p>
        <a
          href="https://www.linkedin.com/company/phledger/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-linkedin text-white px-6 py-3 rounded-lg font-semibold hover:bg-linkedin-dark transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.47 2H3.53a1.45 1.45 0 0 0-1.47 1.43v17.14A1.45 1.45 0 0 0 3.53 22h16.94a1.45 1.45 0 0 0 1.47-1.43V3.43A1.45 1.45 0 0 0 20.47 2ZM8.09 18.74h-3v-9h3v9ZM6.59 8.48a1.56 1.56 0 1 1 0-3.12 1.56 1.56 0 1 1 0 3.12Zm12.32 10.26h-3v-4.83c0-1.21-.43-2-1.52-2A1.65 1.65 0 0 0 12.85 13a2 2 0 0 0-.1.73v5h-3v-9h3v1.2a3 3 0 0 1 2.71-1.5c2 0 3.45 1.29 3.45 4.06v5.25Z"/>
          </svg>
          PhLedger on LinkedIn
        </a>
      </section>
    </div>
  )
}
