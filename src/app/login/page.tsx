'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { t } = useI18n()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const success = await login(email, password)
    if (success) {
      router.push('/dashboard')
    } else {
      setError('Invalid email or password. Try admin: zhili@phledger.com')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-linkedin to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">Ph</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{t('auth.welcome')}</h2>
          <p className="mt-2 text-gray-600">{t('auth.signin.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin focus:border-transparent"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin focus:border-transparent"
                placeholder="••••••••" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-linkedin focus:ring-linkedin" />
              <span className="ml-2 text-sm text-gray-600">{t('auth.remember')}</span>
            </label>
            <a href="#" className="text-sm text-linkedin hover:underline">{t('auth.forgot')}</a>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-linkedin text-white py-3 px-4 rounded-lg font-semibold hover:bg-linkedin-dark transition-colors disabled:opacity-50">
            {loading ? t('auth.signing.in') : t('auth.signin.btn')}
          </button>
          <p className="text-center text-sm text-gray-600">
            {t('auth.no.account')}{' '}
            <Link href="/signup" className="text-linkedin font-medium hover:underline">{t('auth.create.free')}</Link>
          </p>
        </form>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-gray-600 text-center">
          <p><strong>Admin:</strong> zhili@phledger.com / Lz@77071517</p>
        </div>
      </div>
    </div>
  )
}
