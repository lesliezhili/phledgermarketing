'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'

const testimonials = [
  { name: 'Sarah M.', role: 'Marketing Director', rating: 5, text: 'PhLedger transformed my LinkedIn presence. The Bible-inspired content resonates authentically with my network.', service: 'Content Strategy' },
  { name: 'James R.', role: 'Startup Founder', rating: 5, text: 'Finally a marketing platform aligned with my values. The SilverConnect free tier let me start without risk.', service: 'Profile Optimization' },
  { name: 'Chen W.', role: 'Finance Manager', rating: 4, text: 'Great integration with PhLedgerTax for invoicing. The faith-driven approach sets this apart from other tools.', service: 'Analytics & Reporting' },
  { name: 'Maria L.', role: 'Business Coach', rating: 5, text: 'My engagement grew 300% in 2 months. The daily Bible wisdom keeps me grounded and inspired.', service: 'Engagement Boost' },
  { name: 'David K.', role: 'Sales VP', rating: 5, text: 'Executive thought leadership program positioned me as a faith-driven industry voice. Incredible ROI.', service: 'Executive Thought Leadership' },
]

export default function FeedbackPage() {
  const { t } = useI18n()
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">{t('feedback.title')}</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto mb-12">
        <div className="text-center">
          <p className="text-3xl font-bold text-linkedin">4.9</p>
          <p className="text-sm text-gray-600">{t('feedback.overall')}</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-linkedin">1,284</p>
          <p className="text-sm text-gray-600">{t('feedback.total')}</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-linkedin">98%</p>
          <p className="text-sm text-gray-600">{t('feedback.satisfaction')}</p>
        </div>
      </div>

      {/* Testimonials */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('feedback.testimonials')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {testimonials.map((review, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center mb-3">
              <div className="flex text-yellow-400">
                {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
              </div>
              <span className="text-xs text-gray-500 ml-2">{review.service}</span>
            </div>
            <p className="text-gray-700 text-sm mb-3">&ldquo;{review.text}&rdquo;</p>
            <p className="text-sm font-semibold text-gray-900">{review.name}</p>
            <p className="text-xs text-gray-500">{review.role}</p>
          </div>
        ))}
      </div>

      {/* Submit Form */}
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('feedback.write')}</h2>
        {submitted ? (
          <div className="text-center p-8 bg-green-50 rounded-xl">
            <p className="text-green-700 font-semibold">Thank you for your review! 🙏</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }} className="space-y-4 bg-white border border-gray-200 rounded-xl p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('feedback.service.used')}</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Profile Optimization</option>
                <option>Content Strategy</option>
                <option>Audience Growth</option>
                <option>Engagement Boost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('feedback.rating')}</label>
              <div className="flex space-x-2 text-2xl text-yellow-400">
                {[1,2,3,4,5].map(n => <button key={n} type="button">★</button>)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('feedback.your.review')}</label>
              <textarea rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <label className="flex items-center text-sm">
              <input type="checkbox" className="rounded border-gray-300 text-linkedin mr-2" />
              {t('feedback.bible.impact')}
            </label>
            <button type="submit" className="w-full bg-linkedin text-white py-3 rounded-lg font-semibold hover:bg-linkedin-dark transition-colors">
              {t('feedback.submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
