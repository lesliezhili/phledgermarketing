'use client'

import Link from 'next/link'
import BibleVerse from '@/components/BibleVerse'

// LinkedIn is one channel among several. It fits businesses that sell to
// other businesses (corporate catering, consulting, B2B services) and
// professionals building a personal brand.
const services = [
  { name: 'Profile & Company Page Optimization', desc: 'A personal profile and company page that say clearly what you sell and who it is for.', price: 'Included in setup', icon: '👤' },
  { name: 'B2B Content Strategy', desc: '30-day plan of posts that show your work, results and expertise to decision-makers.', price: 'Grace · $149/mo', icon: '📝' },
  { name: 'Lead Generation & Outreach', desc: 'Targeted connection and message sequences to the companies most likely to buy.', price: 'Grace · $149/mo', icon: '🎯' },
  { name: 'LinkedIn Ads Management', desc: 'Ethical ad campaigns aimed by industry, job title and company size.', price: 'Abundant · $799/mo', icon: '🚀' },
  { name: 'Thought Leadership Program', desc: 'Position the founder or team as trusted voices in their field.', price: 'Abundant · $799/mo', icon: '👑' },
  { name: 'Corporate Client Campaigns', desc: 'Win office and team orders for local businesses: events, catering, gifts, services.', price: 'Abundant · $799/mo', icon: '🏢' },
]

export default function LinkedInPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">💼</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">LinkedIn Marketing</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            The channel for selling to businesses. We use LinkedIn when your buyers are companies, teams or professionals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/booking?service=1" className="bg-white text-blue-800 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors">
              Get a Free Health Check
            </Link>
            <Link href="/pricing" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">LinkedIn Services</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Faith-driven B2B marketing that builds trust with decision-makers.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{s.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{s.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-linkedin font-bold">{s.price}</span>
                <Link href="/booking" className="text-sm bg-linkedin text-white px-4 py-1.5 rounded-lg hover:bg-linkedin-dark transition-colors">
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 bg-blue-50">
        <div className="max-w-2xl mx-auto px-4">
          <BibleVerse />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Not sure LinkedIn is right for you?</h2>
        <p className="text-gray-600 mb-8">Our free health check tells you which channels reach your buyers.</p>
        <Link href="/services" className="bg-linkedin text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-linkedin-dark transition-colors inline-block">
          See All Services
        </Link>
      </section>
    </div>
  )
}
