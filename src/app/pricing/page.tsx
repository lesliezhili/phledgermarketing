'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

const plans = [
  {
    name: 'Grace',
    price: '$0',
    period: 'forever',
    desc: 'Start your faith-driven marketing journey.',
    features: ['Profile optimization tips', 'Basic content templates', '3 Bible-inspired posts/month', 'Community access', 'PhLedgerTax basic invoicing'],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Faithful',
    price: '$49',
    period: '/month',
    desc: 'Grow your presence with guided strategy.',
    features: ['Everything in Grace', 'Full content strategy', 'Audience growth plan', 'Engagement optimization', '10 posts/month managed', 'Monthly analytics report', 'Priority support', 'PhLedgerTax full integration'],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Abundant',
    price: '$199',
    period: '/month',
    desc: 'Enterprise-grade LinkedIn marketing.',
    features: ['Everything in Faithful', 'LinkedIn Ads management', 'Thought leadership program', 'Executive branding', 'Unlimited posts', 'Weekly reporting', 'Dedicated strategist', 'Custom Bible content', 'Multi-platform sync', 'SilverConnect premium'],
    cta: 'Contact Us',
    popular: false,
  },
]

const faqs = [
  { q: 'Can I change plans anytime?', a: 'Yes! Upgrade or downgrade at any time. Changes take effect on your next billing cycle.' },
  { q: 'Is there a free trial for paid plans?', a: 'The Grace plan is free forever. For Faithful/Abundant, we offer a 14-day money-back guarantee.' },
  { q: 'How does PhLedgerTax integration work?', a: 'All billing, invoicing, and tax reporting is handled automatically through our PhLedgerTax agent.' },
  { q: 'What is SilverConnect architecture?', a: 'SilverConnect is our platform architecture ensuring free tier access, seamless scaling, and transparent pricing across all PhLedger products.' },
]

export default function PricingPage() {
  const { t } = useI18n()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('pricing.title')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">{t('pricing.subtitle')}</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white rounded-2xl p-8 border-2 ${
              plan.popular ? 'border-linkedin shadow-xl scale-105' : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linkedin text-white px-4 py-1 rounded-full text-xs font-bold">
                {t('pricing.popular')}
              </div>
            )}
            <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-500 ml-1">{plan.period === 'forever' ? t('common.forever') : t('common.month')}</span>
            </div>
            <p className="text-gray-600 mt-2 text-sm">{plan.desc}</p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start text-sm">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className={`block mt-8 text-center py-3 rounded-lg font-semibold transition-colors ${
                plan.popular
                  ? 'bg-linkedin text-white hover:bg-linkedin-dark'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{t('pricing.faq')}</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900">{faq.q}</h4>
              <p className="text-gray-600 mt-2 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
