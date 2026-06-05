'use client'

import Link from 'next/link'
import BibleVerse from '@/components/BibleVerse'
import { useI18n } from '@/lib/i18n'

const platforms = [
  { name: 'LinkedIn', desc: 'Professional networking, B2B growth, thought leadership', icon: '💼', color: 'from-blue-600 to-blue-800', href: '/services' },
  { name: 'Instagram', desc: 'Visual storytelling, reels, community building', icon: '📸', color: 'from-purple-500 to-pink-500', href: '/instagram' },
  { name: 'Facebook', desc: 'Community groups, ads, marketplace, events', icon: '👥', color: 'from-blue-500 to-indigo-600', href: '/facebook' },
  { name: 'X (Twitter)', desc: 'Real-time engagement, threads, thought leadership', icon: '𝕏', color: 'from-gray-700 to-black', href: '/x-twitter' },
  { name: 'Google Maps', desc: 'Local SEO, reviews, foot traffic, business profile', icon: '📍', color: 'from-green-500 to-emerald-700', href: '/google-maps' },
]

export default function Home() {
  const { t } = useI18n()

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Faith-Driven <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Digital Marketing</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 mb-6">
            Grow Your Brand Across Every Platform
          </p>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
            LinkedIn, Instagram, Facebook, X, and Google Maps — all powered by Biblical principles. Part of the PhLedger ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              {t('home.hero.cta')}
            </Link>
            <Link href="/pricing" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors">
              {t('nav.pricing')}
            </Link>

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
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-lg px-4 py-2">
              <span className="text-sm text-gray-300">Region:</span>
              <select className="bg-transparent text-white border border-white/30 rounded px-3 py-1 text-sm focus:outline-none focus:border-white" defaultValue="AU">
                <option value="AU" className="text-gray-900">Australia</option>
                <option value="US" className="text-gray-900">United States</option>
                <option value="GB" className="text-gray-900">United Kingdom</option>
                <option value="CA" className="text-gray-900">Canada</option>
                <option value="NZ" className="text-gray-900">New Zealand</option>
                <option value="SG" className="text-gray-900">Singapore</option>
                <option value="IN" className="text-gray-900">India</option>
                <option value="PH" className="text-gray-900">Philippines</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-lg px-4 py-2">
              <span className="text-sm text-gray-300">Language:</span>
              <select className="bg-transparent text-white border border-white/30 rounded px-3 py-1 text-sm focus:outline-none focus:border-white" defaultValue="en">
                <option value="en" className="text-gray-900">English</option>
                <option value="zh" className="text-gray-900">Chinese</option>
                <option value="es" className="text-gray-900">Spanish</option>
                <option value="fr" className="text-gray-900">French</option>
                <option value="ko" className="text-gray-900">Korean</option>
                <option value="ja" className="text-gray-900">Japanese</option>
                <option value="hi" className="text-gray-900">Hindi</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">5 Platforms. One Faith-Driven Strategy.</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Every platform has unique strengths. We help you leverage each one with integrity and purpose.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((p) => (
              <Link key={p.name} href={p.href}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className={`h-2 bg-gradient-to-r ${p.color}`} />
                <div className="p-6">
                  <div className="text-4xl mb-3">{p.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-linkedin transition-colors">{p.name}</h3>
                  <p className="text-sm text-gray-600">{p.desc}</p>
                  <div className="mt-4 text-linkedin font-medium text-sm flex items-center">
                    Explore Services →
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
          
        {/* Investor Relations */}
        <section className="mt-16 mb-12">
          <div className="bg-gradient-to-r from-gray-900 to-purple-900 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Investor Relations</h2>
            <p className="text-gray-300 mb-4">Pitch decks, email templates, and investment body contacts for SilverConnect and GraceCovenant.</p>
            <div className="flex justify-center gap-4">
              <a href="/finance/silverconnect" className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-lg transition-colors">🤝 SilverConnect</a>
              <a href="/finance/gracecovenant" className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-lg transition-colors">⛪ GraceCovenant</a>
            </div>
          </div>
        </section>
        <BibleVerse />
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
          <Link href="/signup" className="bg-gradient-to-r from-linkedin to-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity inline-block">
            {t('home.hero.cta')}
          </Link>
        </div>
      </section>
    </div>
  )
}
