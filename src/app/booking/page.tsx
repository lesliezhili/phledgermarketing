'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import BibleVerse from '@/components/BibleVerse'

const services = [
  { name: 'Profile Optimization', price: 0, tier: 'Grace' },
  { name: 'Content Strategy', price: 49, tier: 'Faithful' },
  { name: 'Audience Growth', price: 49, tier: 'Faithful' },
  { name: 'Engagement Boost', price: 49, tier: 'Faithful' },
  { name: 'Brand Messaging', price: 0, tier: 'Grace' },
  { name: 'Analytics & Reporting', price: 199, tier: 'Abundant' },
  { name: 'LinkedIn Ads Management', price: 199, tier: 'Abundant' },
  { name: 'Executive Thought Leadership', price: 199, tier: 'Abundant' },
]

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM']

const paymentMethods = [
  { id: 'bank', name: 'Bank Transfer (EFT)', fee: 0, icon: '🏦', desc: 'Zero fees — recommended' },
  { id: 'credit', name: 'Credit/Debit Card', fee: 1.5, icon: '💳', desc: 'Visa, Mastercard, Amex' },
  { id: 'paypal', name: 'PayPal', fee: 2.9, icon: '🅿️', desc: 'PayPal balance or linked card' },
  { id: 'apple', name: 'Apple Pay', fee: 1.5, icon: '🍎', desc: 'Touch ID / Face ID' },
  { id: 'google', name: 'Google Pay', fee: 1.5, icon: '📱', desc: 'Google Wallet' },
  { id: 'crypto', name: 'Cryptocurrency', fee: 1.0, icon: '₿', desc: 'BTC, ETH, USDT' },
]

const platformFees = [
  { id: 'cloud_aws', name: 'AWS Cloud Hosting', fee: 2.5, icon: '☁️', desc: 'Amazon Web Services infrastructure' },
  { id: 'cloud_azure', name: 'Azure Cloud Hosting', fee: 2.3, icon: '⚡', desc: 'Microsoft Azure infrastructure' },
  { id: 'cloud_gcp', name: 'Google Cloud Platform', fee: 2.4, icon: '🌐', desc: 'GCP infrastructure' },
  { id: 'cloud_vercel', name: 'Vercel Edge Network', fee: 0, icon: '▲', desc: 'Zero fee — included with PhLedger' },
]

const linkedinFees = [
  { id: 'li_basic', name: 'LinkedIn Basic (Organic)', fee: 0, icon: '🔗', desc: 'Free organic reach only' },
  { id: 'li_premium', name: 'LinkedIn Premium Business', fee: 59.99, feeType: 'flat', icon: '💎', desc: 'InMail, profile insights, learning' },
  { id: 'li_sales', name: 'LinkedIn Sales Navigator', fee: 99.99, feeType: 'flat', icon: '🎯', desc: 'Advanced lead search, CRM integration' },
  { id: 'li_recruiter', name: 'LinkedIn Recruiter Lite', fee: 170, feeType: 'flat', icon: '👥', desc: 'Talent sourcing, pipeline management' },
  { id: 'li_ads', name: 'LinkedIn Ads Budget', fee: 0, feeType: 'custom', icon: '📢', desc: 'Set your own daily/total ad spend' },
]

export default function BookingPage() {
  const { t } = useI18n()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ service: '', date: '', time: '', linkedin: '', goals: '' })
  const [rush, setRush] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('bank')
  const [cloudPlatform, setCloudPlatform] = useState('cloud_vercel')
  const [linkedinTier, setLinkedinTier] = useState('li_basic')
  const [adBudget, setAdBudget] = useState(0)

  const selectedService = services.find(s => s.name === form.service)
  const basePrice = selectedService?.price || 0
  const rushFee = rush ? 50 : 0

  // Cloud platform fee (% of base)
  const selectedCloud = platformFees.find(p => p.id === cloudPlatform)
  const cloudFeeAmount = basePrice * ((selectedCloud?.fee || 0) / 100)

  // LinkedIn fee (flat add-on)
  const selectedLinkedin = linkedinFees.find(l => l.id === linkedinTier)
  const linkedinFeeAmount = selectedLinkedin?.feeType === 'flat' ? (selectedLinkedin?.fee || 0) : 0
  const adBudgetAmount = linkedinTier === 'li_ads' ? adBudget : 0

  // Subtotal before bank fee
  const subtotal = basePrice + rushFee + cloudFeeAmount + linkedinFeeAmount + adBudgetAmount

  // Bank/payment processing fee
  const selectedPayment = paymentMethods.find(p => p.id === paymentMethod)
  const bankFeeAmount = subtotal * ((selectedPayment?.fee || 0) / 100)

  // Grand total
  const total = subtotal + bankFeeAmount

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('booking.confirmed')}</h1>
        <p className="text-gray-600 mb-4">{t('booking.payment.note')}</p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-sm">
          <p className="font-semibold text-green-800">Total charged: ${total.toFixed(2)}</p>
          <p className="text-green-700">Invoice will be sent via PhLedgerTax</p>
        </div>
        <BibleVerse />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('booking.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }} className="space-y-8">
            
            {/* Service Selection */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-linkedin text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                {t('booking.select')}
              </h2>
              <select
                value={form.service}
                onChange={(e) => setForm({...form, service: e.target.value})}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin"
              >
                <option value="">{t('booking.select')}...</option>
                {services.map(s => (
                  <option key={s.name} value={s.name}>
                    {s.name} — {s.price === 0 ? 'Free' : `$${s.price}/mo`} ({s.tier})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.date')}</label>
                  <input type="date" required value={form.date} onChange={(e) => setForm({...form, date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.time')}</label>
                  <select value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin">
                    <option value="">{t('booking.time')}...</option>
                    {timeSlots.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.linkedin.url')}</label>
                <input type="url" value={form.linkedin} onChange={(e) => setForm({...form, linkedin: e.target.value})}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin" />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.goals')}</label>
                <textarea rows={2} value={form.goals} onChange={(e) => setForm({...form, goals: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin" />
              </div>

              <div className="mt-4 space-y-2">
                <label className="flex items-center text-sm">
                  <input type="checkbox" checked={rush} onChange={(e) => setRush(e.target.checked)}
                    className="rounded border-gray-300 text-linkedin mr-2" />
                  {t('booking.rush')}
                </label>
                <label className="flex items-center text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-linkedin mr-2" />
                  {t('booking.faith')}
                </label>
                <label className="flex items-center text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-linkedin mr-2" defaultChecked />
                  {t('booking.invoice')}
                </label>
              </div>
            </div>

            {/* LinkedIn Tier Selection */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-linkedin text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                LinkedIn Account Tier
              </h2>
              <p className="text-sm text-gray-500 mb-3">Choose your LinkedIn subscription level for enhanced features.</p>
              <div className="space-y-2">
                {linkedinFees.map(tier => (
                  <label
                    key={tier.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      linkedinTier === tier.id ? 'border-linkedin bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <input type="radio" name="linkedin" value={tier.id}
                        checked={linkedinTier === tier.id}
                        onChange={(e) => setLinkedinTier(e.target.value)}
                        className="text-linkedin mr-3" />
                      <span className="mr-2">{tier.icon}</span>
                      <div>
                        <span className="font-medium text-sm">{tier.name}</span>
                        <p className="text-xs text-gray-500">{tier.desc}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      tier.fee === 0 && tier.feeType !== 'custom'
                        ? 'bg-green-100 text-green-700'
                        : tier.feeType === 'custom'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {tier.fee === 0 && tier.feeType !== 'custom' ? 'Free' : tier.feeType === 'custom' ? 'Custom' : `+$${tier.fee}/mo`}
                    </span>
                  </label>
                ))}
              </div>

              {linkedinTier === 'li_ads' && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <label className="block text-sm font-medium text-purple-800 mb-2">Monthly Ad Budget ($)</label>
                  <input type="number" min="0" step="50" value={adBudget}
                    onChange={(e) => setAdBudget(Number(e.target.value))}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400" />
                  <p className="text-xs text-purple-600 mt-1">LinkedIn minimum: $10/day. We recommend $300-$1000/month for B2B.</p>
                </div>
              )}
            </div>

            {/* Cloud Platform Fee */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-linkedin text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                Cloud Platform
              </h2>
              <p className="text-sm text-gray-500 mb-3">Select your hosting infrastructure. Vercel is included free with PhLedger.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {platformFees.map(platform => (
                  <label
                    key={platform.id}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      cloudPlatform === platform.id ? 'border-linkedin bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input type="radio" name="cloud" value={platform.id}
                      checked={cloudPlatform === platform.id}
                      onChange={(e) => setCloudPlatform(e.target.value)}
                      className="text-linkedin mr-3" />
                    <span className="mr-2 text-lg">{platform.icon}</span>
                    <div className="flex-1">
                      <span className="font-medium text-sm">{platform.name}</span>
                      <p className="text-xs text-gray-500">{platform.desc}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      platform.fee === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {platform.fee === 0 ? 'Free' : `${platform.fee}%`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-linkedin text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">4</span>
                Payment Method
              </h2>
              <p className="text-sm text-gray-500 mb-3">Bank Transfer has zero processing fees.</p>
              <div className="space-y-2">
                {paymentMethods.map(method => (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      paymentMethod === method.id ? 'border-linkedin bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <input type="radio" name="payment" value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-linkedin mr-3" />
                      <span className="mr-2">{method.icon}</span>
                      <div>
                        <span className="font-medium text-sm">{method.name}</span>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      method.fee === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {method.fee === 0 ? 'No Fee' : `${method.fee}%`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-linkedin text-white py-4 rounded-xl font-bold text-lg hover:bg-linkedin-dark transition-colors shadow-lg">
              {t('booking.confirm')} — ${total.toFixed(2)}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-32">
            <h3 className="font-bold text-gray-900 mb-4">💰 Order Summary</h3>
            
            {form.service ? (
              <div className="space-y-3 text-sm">
                {/* Service */}
                <div className="flex justify-between">
                  <span className="text-gray-600">{form.service}</span>
                  <span className="font-medium">{basePrice === 0 ? 'Free' : `$${basePrice.toFixed(2)}`}</span>
                </div>
                
                {/* Rush */}
                {rush && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">⚡ Rush delivery</span>
                    <span className="font-medium">$50.00</span>
                  </div>
                )}

                {/* LinkedIn Fee */}
                {(linkedinFeeAmount > 0 || adBudgetAmount > 0) && (
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <span className="text-gray-600">🔗 {selectedLinkedin?.name}</span>
                    <span className="font-medium text-blue-700">
                      {linkedinTier === 'li_ads' ? `$${adBudgetAmount.toFixed(2)}` : `$${linkedinFeeAmount.toFixed(2)}`}
                    </span>
                  </div>
                )}
                {linkedinFeeAmount === 0 && adBudgetAmount === 0 && linkedinTier === 'li_basic' && (
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <span className="text-gray-600">🔗 LinkedIn (Organic)</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                )}

                {/* Cloud Platform Fee */}
                <div className="flex justify-between">
                  <span className="text-gray-600">{selectedCloud?.icon} {selectedCloud?.name}</span>
                  <span className={`font-medium ${cloudFeeAmount === 0 ? 'text-green-600' : ''}`}>
                    {cloudFeeAmount === 0 ? 'Free' : `$${cloudFeeAmount.toFixed(2)}`}
                  </span>
                </div>
                {cloudFeeAmount > 0 && (
                  <p className="text-xs text-amber-600 -mt-1">
                    💡 Switch to Vercel Edge to save ${cloudFeeAmount.toFixed(2)}
                  </p>
                )}

                {/* Subtotal */}
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-700 font-medium">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                {/* Bank Fee */}
                <div className="flex justify-between">
                  <span className="text-gray-600">🏦 Processing fee ({selectedPayment?.name})</span>
                  <span className={`font-medium ${bankFeeAmount === 0 ? 'text-green-600' : ''}`}>
                    {bankFeeAmount === 0 ? 'Free' : `$${bankFeeAmount.toFixed(2)}`}
                  </span>
                </div>
                {bankFeeAmount > 0 && (
                  <p className="text-xs text-amber-600 -mt-1">
                    💡 Use Bank Transfer (EFT) for zero fees
                  </p>
                )}

                {/* Total */}
                <div className="flex justify-between text-base font-bold border-t-2 border-gray-300 pt-3 mt-2">
                  <span>Total</span>
                  <span className="text-linkedin text-lg">{total === 0 ? 'Free' : `$${total.toFixed(2)}`}</span>
                </div>

                {/* Fee breakdown */}
                {total > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 mt-2">
                    <p className="text-xs font-semibold text-blue-800 mb-1">Fee Breakdown:</p>
                    <div className="text-xs text-blue-700 space-y-0.5">
                      <p>• Service: ${basePrice.toFixed(2)}</p>
                      {rush && <p>• Rush: $50.00</p>}
                      {linkedinFeeAmount > 0 && <p>• LinkedIn: ${linkedinFeeAmount.toFixed(2)}</p>}
                      {adBudgetAmount > 0 && <p>• Ad Budget: ${adBudgetAmount.toFixed(2)}</p>}
                      {cloudFeeAmount > 0 && <p>• Cloud ({selectedCloud?.fee}%): ${cloudFeeAmount.toFixed(2)}</p>}
                      {bankFeeAmount > 0 && <p>• Bank ({selectedPayment?.fee}%): ${bankFeeAmount.toFixed(2)}</p>}
                    </div>
                  </div>
                )}

                {/* PhLedgerTax note */}
                <div className="bg-gray-50 rounded-lg p-3 mt-2">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">PhLedgerTax:</span> GST/VAT calculated by country. Invoice auto-generated.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Select a service to see full pricing breakdown with all fees.</p>
            )}

            {/* Bible verse */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs italic text-amber-700 text-center">
                &ldquo;Dishonest money dwindles away, but whoever gathers money little by little makes it grow.&rdquo;
              </p>
              <p className="text-xs font-semibold text-amber-800 text-center mt-1">— Proverbs 13:11</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
