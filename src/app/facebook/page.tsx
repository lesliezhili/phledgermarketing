'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

const services = [
  { name: 'Business Page Setup & Optimization', desc: 'Complete Facebook business page with faith-aligned branding, about section, and CTA buttons.', price: 'Free', icon: '🏢' },
  { name: 'Content Strategy & Scheduling', desc: 'Weekly content mix: videos, posts, events, and community engagement.', price: '$49/mo', icon: '📅' },
  { name: 'Facebook Groups Management', desc: 'Build and manage faith-driven communities around your brand.', price: '$69/mo', icon: '👥' },
  { name: 'Facebook Ads Campaigns', desc: 'Targeted ad campaigns for lead generation, retargeting, and conversions.', price: '$149/mo', icon: '🎯' },
  { name: 'Messenger & Chatbot Setup', desc: 'Automated responses, FAQ bots, and lead capture through Messenger.', price: '$99/mo', icon: '💬' },
  { name: 'Facebook Shop & Marketplace', desc: 'Set up your Facebook Shop, product catalog, and marketplace listings.', price: '$79/mo', icon: '🛒' },
]

const stats = [
  { value: '3B+', label: 'Monthly Active Users' },
  { value: '1.8B', label: 'Groups Members' },
  { value: '66%', label: 'Visit local business page weekly' },
  { value: '$28', label: 'Avg. CPC in marketing' },
]

export default function FacebookPage() {
  const { t } = useI18n()

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Facebook Marketing</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Build thriving communities and reach billions. Faith-driven Facebook marketing that connects, engages, and converts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/booking" className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors">
              Get Started Free
            </Link>
            <Link href="/pricing" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (<div key={i}><p className="text-3xl font-bold">{s.value}</p><p className="text-blue-200 text-sm mt-1">{s.label}</p></div>))}
        </div>
      </section>

      {/* Services */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Facebook Marketing Services</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Community-first marketing powered by Biblical principles of fellowship and service.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{s.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{s.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-bold">{s.price}</span>
                <Link href="/booking" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">Book Now</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bible */}
      <section className="py-12 bg-blue-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold text-blue-900 mb-4">Building Community with Purpose</h3>
          <p className="text-blue-800 italic mb-4">&ldquo;And let us consider how we may spur one another on toward love and good deeds.&rdquo;</p>
          <p className="text-blue-700 font-semibold">— Hebrews 10:24</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Build Your Facebook Community?</h2>
        <p className="text-gray-600 mb-8">Join faith-driven businesses thriving on the world&apos;s largest platform.</p>
        <Link href="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors inline-block">
          Start Building Today
        </Link>
      </section>
    </div>
  )
}
