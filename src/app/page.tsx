'use client'

import Link from 'next/link'
import BibleVerse from '@/components/BibleVerse'
import { useI18n } from '@/lib/i18n'
import { businessTypes, channels, methodSteps, paygJobs } from '@/lib/catalog'

const channelName = (id: string) => channels.find(c => c.id === id)?.name ?? id

export default function Home() {
  const { t } = useI18n()

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {t('home.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 mb-6">
            {t('home.hero.subtitle')}
          </p>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
            {t('home.hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/booking?service=1" className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              {t('home.hero.cta')}
            </Link>
            <Link href="/services" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors">
              {t('home.hero.services')}
            </Link>
          </div>

          {/* Country & Language Selection */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-lg px-4 py-2">
              <span className="text-sm text-gray-300">🌐 Region:</span>
              <select className="bg-transparent text-white border border-white/30 rounded px-3 py-1 text-sm focus:outline-none focus:border-white cursor-pointer"
                onChange={(e) => { localStorage.setItem('phledger_country', e.target.value) }}
                defaultValue="AU">
                <option value="AU" className="text-gray-900">🇦🇺 Australia</option>
                <option value="US" className="text-gray-900">🇺🇸 United States</option>
                <option value="GB" className="text-gray-900">🇬🇧 United Kingdom</option>
                <option value="CA" className="text-gray-900">🇨🇦 Canada</option>
                <option value="NZ" className="text-gray-900">🇳🇿 New Zealand</option>
                <option value="SG" className="text-gray-900">🇸🇬 Singapore</option>
                <option value="IN" className="text-gray-900">🇮🇳 India</option>
                <option value="PH" className="text-gray-900">🇵🇭 Philippines</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-lg px-4 py-2">
              <span className="text-sm text-gray-300">🗣️ Language:</span>
              <select className="bg-transparent text-white border border-white/30 rounded px-3 py-1 text-sm focus:outline-none focus:border-white cursor-pointer"
                onChange={(e) => { localStorage.setItem('phledger_locale', e.target.value); window.location.reload() }}
                defaultValue="en">
                <option value="en" className="text-gray-900">English</option>
                <option value="zh" className="text-gray-900">中文 (Chinese)</option>
                <option value="es" className="text-gray-900">Español (Spanish)</option>
                <option value="fr" className="text-gray-900">Français (French)</option>
                <option value="ko" className="text-gray-900">한국어 (Korean)</option>
                <option value="ja" className="text-gray-900">日本語 (Japanese)</option>
                <option value="hi" className="text-gray-900">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Who we help */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Whatever You Sell, One Proven Method</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">We pick the channels that reach your buyers. You don&apos;t need to know which ones — that&apos;s our job.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {businessTypes.map((b) => (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="text-3xl mb-2">{b.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{b.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{b.examples}</p>
                <p className="text-xs text-gray-700"><span className="font-semibold">Usually:</span> {b.channels.map(channelName).join(', ')}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white border border-green-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-gray-900">Tiny or small business? Pay as you go.</p>
              <p className="text-sm text-gray-600">One-off jobs from ${Math.min(...paygJobs.map(j => j.price))} — a flyer refresh, a Google profile tune-up, a starter pack of posts. No setup fee, no contract.</p>
            </div>
            <Link href="/pricing#payg" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors whitespace-nowrap">
              See PAYG Prices
            </Link>
          </div>
        </div>
      </section>

      {/* Method */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">The Same 5 Steps in 90 Days</h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">Only the channels and the timing change from business to business.</p>
          <ol className="space-y-3">
            {methodSteps.map((s, i) => (
              <li key={s.name} className={`flex items-start gap-4 rounded-xl border p-4 ${i === 1 ? 'border-linkedin bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <span className="bg-linkedin text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-bold text-gray-900">{s.name}</h3>
                    <span className="text-xs text-gray-500">{s.when}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Channels */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Channels We Run</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Every channel has unique strengths. We use the 2–4 that fit your business, with integrity and purpose.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map((p) => (
              <Link key={p.id} href={p.href}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className={`h-2 bg-gradient-to-r ${p.color}`} />
                <div className="p-6">
                  <div className="text-4xl mb-3">{p.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-linkedin transition-colors">{p.name}</h3>
                  <p className="text-sm text-gray-600">{p.desc}</p>
                  <div className="mt-4 text-linkedin font-medium text-sm flex items-center">
                    Explore →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why PhLedger */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t('home.why.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✝</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Faith-First Approach</h3>
              <p className="text-gray-600 text-sm">Every strategy rooted in Biblical principles of integrity, service, and stewardship.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('home.why.silverconnect')}</h3>
              <p className="text-gray-600 text-sm">{t('home.why.silverconnect.desc')}</p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('home.why.phledgertax')}</h3>
              <p className="text-gray-600 text-sm">{t('home.why.phledgertax.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Inspiration */}
      <section className="py-12 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">{t('home.inspiration')}</h2>
          <BibleVerse />

          {/* Investor Relations */}
          <div className="mt-12 bg-gradient-to-r from-gray-900 to-purple-900 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Investor Relations</h2>
            <p className="text-gray-300 mb-4">Pitch decks, email templates, and investment body contacts for SilverConnect and GraceCovenant.</p>
            <div className="flex justify-center gap-4">
              <a href="/finance/silverconnect" className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-lg transition-colors">🤝 SilverConnect</a>
              <a href="/finance/gracecovenant" className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-lg transition-colors">⛪ GraceCovenant</a>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-16 bg-gradient-to-r from-linkedin to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">{t('home.metrics')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div><p className="text-4xl font-bold">5,000+</p><p className="text-blue-200 mt-1">{t('home.metrics.users')}</p></div>
            <div><p className="text-4xl font-bold">25,000+</p><p className="text-blue-200 mt-1">{t('home.metrics.campaigns')}</p></div>
            <div><p className="text-4xl font-bold">420%</p><p className="text-blue-200 mt-1">{t('home.metrics.engagement')}</p></div>
            <div><p className="text-4xl font-bold">98%</p><p className="text-blue-200 mt-1">{t('home.metrics.satisfaction')}</p></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">{t('home.cta.title')}</h2>
          <p className="text-gray-300 mb-8">{t('home.cta.subtitle')}</p>
          <Link href="/booking?service=1" className="bg-gradient-to-r from-linkedin to-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity inline-block">
            {t('home.hero.cta')}
          </Link>
        </div>
      </section>
    </div>
  )
}
