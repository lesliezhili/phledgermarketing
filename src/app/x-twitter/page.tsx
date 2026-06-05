'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

const services = [
  { name: 'Profile & Brand Voice Setup', desc: 'Craft your X persona, bio, pinned posts, and consistent brand voice.', price: 'Free', icon: '🎤' },
  { name: 'Thread Strategy & Ghostwriting', desc: 'Viral thread templates, daily posting schedule, and thought leadership threads.', price: '$59/mo', icon: '🧵' },
  { name: 'Engagement & Growth Hacking', desc: 'Reply strategy, quote tweets, community building through authentic conversations.', price: '$49/mo', icon: '🚀' },
  { name: 'X Spaces & Audio Marketing', desc: 'Host weekly Spaces, panel discussions, and live audio events for brand authority.', price: '$89/mo', icon: '🎙️' },
  { name: 'X Ads & Promoted Posts', desc: 'Targeted campaigns, promoted tweets, and follower acquisition ads.', price: '$129/mo', icon: '📢' },
  { name: 'X Premium & Verification Strategy', desc: 'Monetization setup, long-form content, and premium subscriber growth.', price: '$149/mo', icon: '✓' },
]

const stats = [
  { value: '600M+', label: 'Monthly Active Users' },
  { value: '500M', label: 'Tweets per day' },
  { value: '#1', label: 'For real-time engagement' },
  { value: '2.8x', label: 'Higher brand recall' },
]

export default function XTwitterPage() {
  const { t } = useI18n()

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">𝕏</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">X (Twitter) Marketing</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Real-time thought leadership. Build influence on X through authentic conversations, viral threads, and faith-driven engagement.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/booking" className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Get Started Free
            </Link>
            <Link href="/pricing" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (<div key={i}><p className="text-3xl font-bold">{s.value}</p><p className="text-gray-400 text-sm mt-1">{s.label}</p></div>))}
        </div>
      </section>

      {/* Services */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">X Marketing Services</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Authentic voice, real-time impact. Build influence through conversations rooted in integrity.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{s.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{s.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-bold">{s.price}</span>
                <Link href="/booking" className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-black transition-colors">Book Now</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bible */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Speaking Truth in the Public Square</h3>
          <p className="text-gray-700 italic mb-4">&ldquo;Let your conversation be always full of grace, seasoned with salt, so that you may know how to answer everyone.&rdquo;</p>
          <p className="text-gray-800 font-semibold">— Colossians 4:6</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Own the Conversation?</h2>
        <p className="text-gray-600 mb-8">Build your thought leadership on the world&apos;s real-time platform.</p>
        <Link href="/signup" className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-black transition-colors inline-block">
          Start Posting with Purpose
        </Link>
      </section>
    </div>
  )
}
