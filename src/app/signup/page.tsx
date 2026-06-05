'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'

const plans = [
  { id: 'grace', name: 'Grace', price: '$0', desc: 'Free forever' },
  { id: 'faithful', name: 'Faithful', price: '$49/mo', desc: 'Grow with strategy' },
  { id: 'abundant', name: 'Abundant', price: '$199/mo', desc: 'Enterprise marketing' },
]

export default function SignupPage() {
  const { t } = useI18n()
  const { signup } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', company: '', password: '', confirm: '', plan: 'grace' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const result = await signup({ name: form.name, email: form.email, password: form.password, plan: form.plan, company: form.company })
    if (result.success) { router.push('/dashboard') } else { setError(result.error || 'Signup failed') }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('auth.join')}</h1>
          <p className="mt-2 text-gray-600">{t('auth.free.plan')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gray-200 rounded-xl p-8">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.fullname')}</label>
            <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.company')}</label>
            <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
              <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirm.password')}</label>
              <input type="password" required value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.select.plan')}</label>
            <div className="grid grid-cols-3 gap-3">
              {plans.map(plan => (
                <button key={plan.id} type="button" onClick={() => setForm({...form, plan: plan.id})}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${form.plan === plan.id ? 'border-linkedin bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <p className="font-bold text-sm">{plan.name}</p>
                  <p className="text-xs text-gray-600">{plan.price}</p>
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-start text-sm">
            <input type="checkbox" required className="rounded border-gray-300 text-linkedin mr-2 mt-0.5" />
            <span className="text-gray-600">{t('auth.terms')}</span>
          </label>
          <button type="submit" disabled={loading}
            className="w-full bg-linkedin text-white py-3 rounded-lg font-semibold hover:bg-linkedin-dark transition-colors disabled:opacity-50">
            {loading ? t('auth.creating') : t('auth.create.btn')}
          </button>
          <p className="text-center text-sm text-gray-600">
            {t('auth.have.account')}{' '}<Link href="/login" className="text-linkedin font-medium hover:underline">{t('nav.signin')}</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
