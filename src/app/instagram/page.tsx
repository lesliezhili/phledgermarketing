'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import BibleVerse from '@/components/BibleVerse'

const services = [
  { name: 'Profile & Bio Optimization', desc: 'Craft a compelling bio, highlights, and aesthetic that attracts your target audience.', price: 'Free', icon: '✨' },
  { name: 'Content Calendar & Reels Strategy', desc: '30-day content plan with Reels, Stories, and carousel templates aligned with your brand.', price: '$59/mo', icon: '🎬' },
  { name: 'Hashtag & SEO Research', desc: 'Data-driven hashtag sets and SEO captions for maximum discoverability.', price: '$39/mo', icon: '#️⃣' },
  { name: 'Engagement & Community Growth', desc: 'Authentic engagement strategy, comment templates, and DM funnels.', price: '$79/mo', icon: '💬' },
  { name: 'Instagram Ads Management', desc: 'Story ads, reel ads, and carousel campaigns with faith-aligned messaging.', price: '$149/mo', icon: '📢' },
  { name: 'Influencer Collaboration', desc: 'Connect with faith-aligned micro-influencers for brand partnerships.', price: '$199/mo', icon: '🤝' },
]

const stats = [
  { value: '2B+', label: 'Monthly Active Users' },
  { value: '90%', label: 'Follow at least one business' },
  { value: '50%', label: 'More interested after seeing ads' },
  { value: '4x', label: 'Engagement vs Facebook' },
]

export default function InstagramPage() {
  const { t } = useI18n()

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">📸</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Instagram Marketing</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Visual storytelling with purpose. Grow your brand on Instagram through authentic, faith-driven content that connects and converts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/booking" className="bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-purple-50 transition-colors">
              Get Started Free
            </Link>
            <Link href="/pricing" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-purple-200 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Instagram Marketing Services</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Faith-driven visual marketing that builds community and drives results.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{s.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{s.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-purple-600 font-bold">{s.price}</span>
                <Link href="/booking" className="text-sm bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700 transition-colors">
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bible Inspiration */}
      <section className="py-12 bg-purple-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold text-purple-900 mb-4">Visual Storytelling with Purpose</h3>
          <p className="text-purple-800 italic mb-4">&ldquo;Whatever you do, work at it with all your heart, as working for the Lord.&rdquo;</p>
          <p className="text-purple-700 font-semibold">— Colossians 3:23</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Instagram?</h2>
        <p className="text-gray-600 mb-8">Join faith-driven brands growing authentically on Instagram.</p>
        <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity inline-block">
          Start Your Journey
        </Link>
      </section>
    </div>
  )
}
