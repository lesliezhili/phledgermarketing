'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import BibleVerse from '@/components/BibleVerse'

const services = [
  { id: 1, name: 'Profile Optimization', desc: 'Complete LinkedIn profile overhaul with faith-based branding.', price: 'Free', tier: 'Grace', icon: '👤' },
  { id: 2, name: 'Content Strategy', desc: '30-day content calendar with Bible-inspired themes.', price: '$49/mo', tier: 'Faithful', icon: '📝' },
  { id: 3, name: 'Audience Growth', desc: 'Targeted connection strategy based on ethical principles.', price: '$49/mo', tier: 'Faithful', icon: '📈' },
  { id: 4, name: 'Engagement Boost', desc: 'Comment strategy, poll creation, and community building.', price: '$49/mo', tier: 'Faithful', icon: '💬' },
  { id: 5, name: 'Brand Messaging', desc: 'Craft your unique professional narrative with purpose.', price: 'Free', tier: 'Grace', icon: '🎯' },
  { id: 6, name: 'Analytics & Reporting', desc: 'Monthly performance reports with faith-aligned KPIs.', price: '$199/mo', tier: 'Abundant', icon: '📊' },
  { id: 7, name: 'LinkedIn Ads Management', desc: 'Ethical advertising campaigns aligned with your mission.', price: '$199/mo', tier: 'Abundant', icon: '🚀' },
  { id: 8, name: 'Executive Thought Leadership', desc: 'Position yourself as a faith-driven industry leader.', price: '$199/mo', tier: 'Abundant', icon: '👑' },
]

export default function ServicesPage() {
  const { t } = useI18n()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('services.title')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">{t('services.payment.note')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {services.map((service) => (
          <div key={service.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">{service.icon}</div>
            <h3 className="font-bold text-gray-900 mb-1">{service.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{service.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-linkedin font-bold">{service.price}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{service.tier}</span>
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

      <div className="max-w-2xl mx-auto">
        <BibleVerse />
      </div>
    </div>
  )
}
