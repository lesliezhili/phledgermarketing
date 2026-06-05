'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'

const tabs = ['payment', 'invoicing', 'tax', 'accounting', 'reports'] as const

export default function PhLedgerTaxPage() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('payment')

  const tabLabels = {
    payment: t('phledgertax.payment'),
    invoicing: t('phledgertax.invoicing'),
    tax: t('phledgertax.tax'),
    accounting: t('phledgertax.accounting'),
    reports: t('phledgertax.reports'),
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('phledgertax.title')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">{t('phledgertax.subtitle')}</p>
        <div className="flex items-center justify-center mt-4 space-x-4">
          <span className="flex items-center text-sm text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            {t('phledgertax.status')}: {t('phledgertax.online')}
          </span>
          <span className="text-sm text-gray-500">{t('phledgertax.platforms')}: 3</span>
          <span className="text-sm text-gray-500">{t('phledgertax.compliance')}: ✓</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex space-x-0 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-linkedin text-linkedin'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-8">
        {activeTab === 'payment' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('phledgertax.payment')}</h2>
            <p className="text-gray-600 mb-6">Secure payment processing for all PhLedger services. Zero fees for Grace plan members.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg"><p className="font-semibold">Credit/Debit Cards</p><p className="text-sm text-gray-600">Visa, Mastercard, Amex</p></div>
              <div className="bg-blue-50 p-4 rounded-lg"><p className="font-semibold">Bank Transfer</p><p className="text-sm text-gray-600">Direct debit & ACH</p></div>
              <div className="bg-purple-50 p-4 rounded-lg"><p className="font-semibold">Digital Wallets</p><p className="text-sm text-gray-600">Apple Pay, Google Pay</p></div>
            </div>
          </div>
        )}
        {activeTab === 'invoicing' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('phledgertax.invoicing')}</h2>
            <p className="text-gray-600 mb-6">Automated invoice generation for all bookings and subscriptions.</p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-sm text-gray-700">Recent invoices appear here. Book a service to generate your first invoice.</p>
            </div>
          </div>
        )}
        {activeTab === 'tax' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('phledgertax.tax')}</h2>
            <p className="text-gray-600 mb-6">Automatic tax calculation based on your country and business type.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg"><p className="font-semibold">GST/VAT Calculator</p><p className="text-sm text-gray-600">Automatic rates by jurisdiction</p></div>
              <div className="bg-gray-50 p-4 rounded-lg"><p className="font-semibold">Tax Deductions</p><p className="text-sm text-gray-600">Marketing expense tracking</p></div>
            </div>
          </div>
        )}
        {activeTab === 'accounting' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('phledgertax.accounting')}</h2>
            <p className="text-gray-600 mb-6">Full double-entry accounting for your marketing spend.</p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-sm text-gray-700">Chart of accounts, journal entries, and reconciliation tools.</p>
            </div>
          </div>
        )}
        {activeTab === 'reports' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('phledgertax.reports')}</h2>
            <p className="text-gray-600 mb-6">Financial reports, tax summaries, and ROI analytics.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg"><p className="font-semibold">P&L Statement</p></div>
              <div className="bg-gray-50 p-4 rounded-lg"><p className="font-semibold">Tax Summary</p></div>
              <div className="bg-gray-50 p-4 rounded-lg"><p className="font-semibold">ROI Report</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
