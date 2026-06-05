'use client'

import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const { t } = useI18n()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('dashboard.welcome')}, {user?.name} 👋
        </h1>
        <p className="text-gray-600 mt-1">{user?.email} • {user?.plan} Plan</p>
        {user?.role === 'admin' && (
          <span className="inline-block mt-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
            {t('dashboard.admin')}
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: t('dashboard.active.campaigns'), value: '3', color: 'bg-blue-50 text-blue-700' },
          { label: t('dashboard.posts'), value: '12', color: 'bg-green-50 text-green-700' },
          { label: t('dashboard.connections'), value: '+47', color: 'bg-purple-50 text-purple-700' },
          { label: t('dashboard.engagement'), value: '4.2%', color: 'bg-amber-50 text-amber-700' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-xl p-6`}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm mt-1 opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/booking" className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-1">{t('dashboard.book.service')}</h3>
          <p className="text-sm text-gray-600">{t('dashboard.browse')}</p>
        </Link>
        <Link href="/phledgertax" className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-1">{t('dashboard.payments')}</h3>
          <p className="text-sm text-gray-600">PhLedgerTax</p>
        </Link>
        <Link href="/bible" className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-1">{t('nav.bible')}</h3>
          <p className="text-sm text-gray-600">{t('home.inspiration')}</p>
        </Link>
      </div>

      {/* Admin Panel */}
      {user?.role === 'admin' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-amber-900 mb-4">{t('dashboard.admin.panel')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg">
              <p className="font-semibold text-gray-900">Total Users</p>
              <p className="text-2xl font-bold text-linkedin">2,547</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="font-semibold text-gray-900">Revenue (MTD)</p>
              <p className="text-2xl font-bold text-green-600">$12,480</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="font-semibold text-gray-900">Active Bookings</p>
              <p className="text-2xl font-bold text-purple-600">34</p>
            </div>
          </div>
        </div>
      )}

      {/* Account Info */}
      <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.account')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Name:</span> <span className="font-medium">{user?.name}</span></div>
          <div><span className="text-gray-500">Email:</span> <span className="font-medium">{user?.email}</span></div>
          <div><span className="text-gray-500">Plan:</span> <span className="font-medium">{user?.plan}</span></div>
          <div><span className="text-gray-500">Company:</span> <span className="font-medium">{user?.company}</span></div>
        </div>
      </div>
    </div>
  )
}
