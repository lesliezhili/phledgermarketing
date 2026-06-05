'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

const services = [
  { name: 'Google Business Profile Setup', desc: 'Complete GBP creation, verification, and optimization for local search dominance.', price: 'Free', icon: '📍' },
  { name: 'Local SEO & Map Pack Strategy', desc: 'Rank in the top 3 Google Maps results with proven local SEO techniques.', price: '$79/mo', icon: '🗺️' },
  { name: 'Review Generation & Management', desc: 'Automated review requests, response templates, and reputation monitoring.', price: '$49/mo', icon: '⭐' },
  { name: 'Google Posts & Updates', desc: 'Weekly Google Posts: offers, events, products, and faith-driven updates.', price: '$39/mo', icon: '📝' },
  { name: 'Multi-Location Management', desc: 'Manage multiple business locations, bulk updates, and location groups.', price: '$149/mo', icon: '🏪' },
  { name: 'Google Ads (Local Campaigns)', desc: 'Local search ads, call ads, and directions ads for foot traffic.', price: '$129/mo', icon: '📢' },
]

const stats = [
  { value: '46%', label: 'All Google searches are local' },
  { value: '88%', label: 'Visit or call within 24 hours' },
  { value: '76%', label: 'Visit a business same day' },
  { value: '5x', label: 'ROI from local SEO' },
]

export default function GoogleMapsPage() {
  const { t } = useI18n()

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">📍</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Google Maps Marketing</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto mb-8">
            Be found when it matters most. Dominate local search and Google Maps with faith-driven strategies that drive real foot traffic.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/booking" className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-green-50 transition-colors">
              Get Started Free
            </Link>
            <Link href="/pricing" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (<div key={i}><p className="text-3xl font-bold">{s.value}</p><p className="text-green-200 text-sm mt-1">{s.label}</p></div>))}
        </div>
      </section>

      {/* Services */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Google Maps & Local SEO Services</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Be a beacon in your community — help people find your business with integrity-driven local marketing.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{s.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{s.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-green-600 font-bold">{s.price}</span>
                <Link href="/booking" className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors">Book Now</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bible */}
      <section className="py-12 bg-green-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold text-green-900 mb-4">A Light to Your Community</h3>
          <p className="text-green-800 italic mb-4">&ldquo;You are the light of the world. A town built on a hill cannot be hidden.&rdquo;</p>
          <p className="text-green-700 font-semibold">— Matthew 5:14</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Dominate Local Search?</h2>
        <p className="text-gray-600 mb-8">Help your community find you with ethical, effective local marketing.</p>
        <Link href="/signup" className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors inline-block">
          Claim Your Listing
        </Link>
      </section>
    </div>
  )
}
