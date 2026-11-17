'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import BibleVerse from '@/components/BibleVerse'
import { services, businessTypes, channels, adPlatforms, commitments, quotePackage, serviceLabel, leadPrices, LEAD_RULES, PAY_PER_LEAD_ID, TINY_BUSINESS, turnoverBands, isPayPerLeadEligible, type TurnoverBand } from '@/lib/catalog'
import { estimateMonthly, isValidAbn } from '@/lib/leads'

const PAY_PER_LEAD = 'Pay Per Lead'

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

export default function BookingPage() {
  const { t } = useI18n()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ service: '', date: '', time: '', business: '', offer: '', website: '', goals: '' })
  const [rush, setRush] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('bank')
  const [cloudPlatform, setCloudPlatform] = useState('cloud_vercel')
  const [businessType, setBusinessType] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [adPlatform, setAdPlatform] = useState('none')
  const [adBudget, setAdBudget] = useState(0)
  const [commitment, setCommitment] = useState('monthly')
  const [monthlyCap, setMonthlyCap] = useState(LEAD_RULES.defaultMonthlyCap)
  const [expected, setExpected] = useState({ enquiry: 8, call: 4, business: 0 })
  const [abn, setAbn] = useState('')
  const [turnoverBand, setTurnoverBand] = useState<TurnoverBand | ''>('')
  const [tinyDeclared, setTinyDeclared] = useState(false)

  // Pre-select a service from /booking?service=<id>
  useEffect(() => {
    const id = Number(new URLSearchParams(window.location.search).get('service'))
    if (id === PAY_PER_LEAD_ID) { setForm(f => ({ ...f, service: PAY_PER_LEAD })); return }
    const match = services.find(s => s.id === id)
    if (match) setForm(f => ({ ...f, service: match.name }))
  }, [])

  const chooseBusinessType = (id: string) => {
    setBusinessType(id)
    setSelectedChannels(businessTypes.find(b => b.id === id)?.channels ?? [])
  }
  const toggleChannel = (id: string) =>
    setSelectedChannels(cs => (cs.includes(id) ? cs.filter(c => c !== id) : [...cs, id]))

  const selectedService = services.find(s => s.name === form.service)
  // Services are delivered through packages; price comes from the package
  // that includes the service and how the client chooses to pay.
  const quote = quotePackage(selectedService?.tier ?? 'Free', commitment)
  const isPaid = !!selectedService && selectedService.tier !== 'Free'
  // Pay as you go = pay per lead: nothing due today, no setup fee; leads are
  // billed monthly as they arrive, never above the client's cap.
  const isPerLead = form.service === PAY_PER_LEAD
  const cap = Math.max(0, monthlyCap || 0)
  const leadEstimate = estimateMonthly(expected, cap)
  const eligible = isPayPerLeadEligible(turnoverBand)
  const abnValid = isValidAbn(abn)
  // Pay per lead can only be booked by a tiny business with a valid ABN.
  const perLeadBlocked = isPerLead && (!eligible || !abnValid || !tinyDeclared)

  const basePrice = isPerLead ? 0 : quote.fees
  const setupFee = isPerLead ? 0 : quote.setup
  const rushFee = rush ? 50 : 0

  // Cloud platform fee (% of base)
  const selectedCloud = platformFees.find(p => p.id === cloudPlatform)
  const cloudFeeAmount = basePrice * ((selectedCloud?.fee || 0) / 100)

  // Paid ad budget (any platform), passed through at cost
  const selectedAdPlatform = adPlatforms.find(a => a.id === adPlatform)
  const adBudgetAmount = adPlatform === 'none' ? 0 : Math.max(0, adBudget)

  // Subtotal before bank fee
  const subtotal = basePrice + setupFee + rushFee + cloudFeeAmount + adBudgetAmount

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
          <form onSubmit={(e) => { e.preventDefault(); if (!perLeadBlocked) setSubmitted(true) }} className="space-y-8">
            
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
                <optgroup label="Monthly packages">
                  {services.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} — {serviceLabel(s)}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Pay as you go (tiny business: turnover under $2M)">
                  <option value={PAY_PER_LEAD}>
                    {PAY_PER_LEAD} — from ${Math.min(...leadPrices.map(l => l.price))} per lead, no contract
                  </option>
                </optgroup>
              </select>

              {isPerLead && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg space-y-3">
                  {/* Eligibility: tiny businesses only (ATO aggregated turnover under $2M) */}
                  <div className="bg-white rounded-lg p-3 border border-green-200 space-y-2 text-sm">
                    <p className="font-semibold text-gray-900">Pay per lead is for tiny businesses only</p>
                    <p className="text-xs text-gray-600">
                      Your {TINY_BUSINESS.label}, using the{' '}
                      <a href={TINY_BUSINESS.url} target="_blank" rel="noopener noreferrer" className="underline">ATO aggregated turnover test</a>{' '}
                      (your gross turnover plus that of any affiliated or connected business).
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="block">
                        <span className="text-xs text-gray-700">ABN</span>
                        <input type="text" inputMode="numeric" value={abn} onChange={(e) => setAbn(e.target.value)}
                          required placeholder="11 digits"
                          className="w-full px-2 py-1 border border-gray-300 rounded" />
                      </label>
                      <label className="block">
                        <span className="text-xs text-gray-700">Aggregated annual turnover</span>
                        <select value={turnoverBand} onChange={(e) => setTurnoverBand(e.target.value as TurnoverBand)} required
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-white">
                          <option value="">Select...</option>
                          {turnoverBands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </label>
                    </div>
                    {abn && !abnValid && <p className="text-xs text-red-600">Please enter a valid 11-digit ABN.</p>}
                    {turnoverBand && !eligible && (
                      <p className="text-xs text-red-600">
                        Pay per lead is only for businesses with {TINY_BUSINESS.label}. Please choose a monthly package instead — the free Marketing Health Check will tell you which fits.
                      </p>
                    )}
                    {eligible && (
                      <label className="flex items-start text-xs text-gray-700">
                        <input type="checkbox" required checked={tinyDeclared} onChange={(e) => setTinyDeclared(e.target.checked)}
                          className="rounded border-gray-300 text-linkedin mr-2 mt-0.5" />
                        I declare my business&apos;s aggregated annual turnover is under $2 million, and I will tell PhLedger Marketing if it reaches $2 million.
                      </label>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    {leadPrices.map(l => (
                      <div key={l.type} className="bg-white rounded-lg p-2 border border-green-100">
                        <p className="font-medium">{l.icon} {l.name}</p>
                        <p className="text-green-800 font-bold">${l.price} per lead</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    {leadPrices.map(l => (
                      <label key={l.type} className="block">
                        <span className="text-xs text-green-900">Expected {l.name.toLowerCase()}s / month</span>
                        <input type="number" min="0" value={expected[l.type]}
                          onChange={(e) => setExpected({ ...expected, [l.type]: Number(e.target.value) })}
                          className="w-full px-2 py-1 border border-green-200 rounded" />
                      </label>
                    ))}
                    <label className="block">
                      <span className="text-xs text-green-900">Monthly cap ($)</span>
                      <input type="number" min="0" step="50" value={monthlyCap}
                        onChange={(e) => setMonthlyCap(Number(e.target.value))}
                        className="w-full px-2 py-1 border border-green-200 rounded" />
                    </label>
                  </div>
                  <p className="text-xs text-green-800">
                    You pay when a lead arrives, whether or not it becomes a sale. First {LEAD_RULES.freeLeads} leads free.
                    Spam, short calls, repeats within {LEAD_RULES.duplicateDays} days and existing customers are never charged.
                  </p>
                </div>
              )}

              {isPaid && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('booking.commitment')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {commitments.map(c => (
                      <label key={c.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors text-sm ${
                          commitment === c.id ? 'border-linkedin bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <input type="radio" name="commitment" value={c.id} checked={commitment === c.id}
                          onChange={() => setCommitment(c.id)} className="sr-only" />
                        <span className="font-semibold block">{c.name}</span>
                        <span className="text-xs text-gray-500">{c.note}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

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

            {/* Your Business & Channels */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-linkedin text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                {t('booking.business.title')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.business.name')}</label>
                  <input type="text" value={form.business} onChange={(e) => setForm({...form, business: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.business.website')}</label>
                  <input type="url" value={form.website} onChange={(e) => setForm({...form, website: e.target.value})}
                    placeholder="https://"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin" />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.business.offer')}</label>
                <input type="text" value={form.offer} onChange={(e) => setForm({...form, offer: e.target.value})}
                  placeholder="e.g. whole cakes and function bookings"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin" />
              </div>

              <p className="text-sm font-medium text-gray-700 mt-4 mb-2">{t('booking.business.type')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {businessTypes.map(b => (
                  <label key={b.id}
                    className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      businessType === b.id ? 'border-linkedin bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input type="radio" name="businessType" value={b.id}
                      checked={businessType === b.id}
                      onChange={() => chooseBusinessType(b.id)}
                      className="text-linkedin mr-3 mt-1" />
                    <span className="mr-2">{b.icon}</span>
                    <div>
                      <span className="font-medium text-sm">{b.name}</span>
                      <p className="text-xs text-gray-500">{b.examples}</p>
                    </div>
                  </label>
                ))}
              </div>

              <p className="text-sm font-medium text-gray-700 mt-4 mb-1">{t('booking.channels')}</p>
              <p className="text-xs text-gray-500 mb-2">{t('booking.channels.hint')}</p>
              <div className="flex flex-wrap gap-2">
                {channels.map(c => (
                  <label key={c.id}
                    className={`flex items-center px-3 py-2 rounded-full border text-sm cursor-pointer transition-colors ${
                      selectedChannels.includes(c.id) ? 'border-linkedin bg-blue-50 text-linkedin' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}>
                    <input type="checkbox" className="sr-only" checked={selectedChannels.includes(c.id)} onChange={() => toggleChannel(c.id)} />
                    {c.icon} <span className="ml-1">{c.name}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-purple-800 mb-2">{t('booking.ads.platform')}</label>
                    <select value={adPlatform} onChange={(e) => setAdPlatform(e.target.value)}
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 bg-white">
                      {adPlatforms.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  {adPlatform !== 'none' && (
                    <div>
                      <label className="block text-sm font-medium text-purple-800 mb-2">{t('booking.ads.budget')}</label>
                      <input type="number" min="0" step="50" value={adBudget}
                        onChange={(e) => setAdBudget(Number(e.target.value))}
                        placeholder="e.g. 400"
                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-purple-600 mt-2">{t('booking.ads.hint')}</p>
              </div>
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

            <button type="submit" disabled={perLeadBlocked}
              className="w-full bg-linkedin text-white py-4 rounded-xl font-bold text-lg hover:bg-linkedin-dark transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
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
                  <span className="text-gray-600">
                    {form.service}
                    {isPaid && (
                      <span className="block text-xs text-gray-500">
                        {selectedService?.tier} package · ${quote.monthly.toFixed(2)}/mo × {quote.months}
                        {quote.discount > 0 && ` (${Math.round(quote.discount * 100)}% off)`}
                      </span>
                    )}
                  </span>
                  <span className="font-medium">
                    {isPerLead ? '$0 today' : basePrice === 0 ? 'Free' : `$${basePrice.toFixed(2)}`}
                  </span>
                </div>

                {/* Pay per lead */}
                {isPerLead && (
                  <div className="bg-green-50 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Estimated leads bill / month</span>
                      <span className="font-semibold">${leadEstimate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Never more than (cap)</span>
                      <span className="font-semibold">${cap.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500">Billed monthly per lead · first {LEAD_RULES.freeLeads} free · no setup fee · no contract</p>
                  </div>
                )}

                {/* Setup fee */}
                {isPaid && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">🛠️ One-off setup</span>
                    <span className={`font-medium ${setupFee === 0 ? 'text-green-600' : ''}`}>
                      {setupFee === 0 ? 'Waived' : `$${setupFee.toFixed(2)}`}
                    </span>
                  </div>
                )}

                {/* Rush */}
                {rush && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">⚡ Rush delivery</span>
                    <span className="font-medium">$50.00</span>
                  </div>
                )}

                {/* Channels */}
                {selectedChannels.length > 0 && (
                  <div className="border-t border-gray-100 pt-2">
                    <span className="text-gray-600">📣 {selectedChannels.map(id => channels.find(c => c.id === id)?.name).join(', ')}</span>
                  </div>
                )}

                {/* Ad Budget */}
                {adBudgetAmount > 0 && (
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <span className="text-gray-600">📢 Ads: {selectedAdPlatform?.name}</span>
                    <span className="font-medium text-blue-700">${adBudgetAmount.toFixed(2)}</span>
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
                  <span className="text-linkedin text-lg">{total === 0 ? (isPerLead ? '$0 today' : 'Free') : `$${total.toFixed(2)}`}</span>
                </div>

                {/* Fee breakdown */}
                {total > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 mt-2">
                    <p className="text-xs font-semibold text-blue-800 mb-1">Fee Breakdown:</p>
                    <div className="text-xs text-blue-700 space-y-0.5">
                      <p>• {isPerLead ? 'Leads (billed monthly)' : 'Package'}: ${basePrice.toFixed(2)}</p>
                      {setupFee > 0 && <p>• Setup: ${setupFee.toFixed(2)}</p>}
                      {rush && <p>• Rush: $50.00</p>}
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
