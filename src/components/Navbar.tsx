'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useI18n, LANGUAGES, Locale } from '@/lib/i18n'

const countries = [
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
]

const platformLinks = [
  { name: 'LinkedIn', href: '/services', icon: '💼' },
  { name: 'Instagram', href: '/instagram', icon: '📸' },
  { name: 'Facebook', href: '/facebook', icon: '👥' },
  { name: 'X (Twitter)', href: '/x-twitter', icon: '𝕏' },
  { name: 'Google Maps', href: '/google-maps', icon: '📍' },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [country, setCountry] = useState(countries[0])
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const [showPlatforms, setShowPlatforms] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { locale, setLocale, t } = useI18n()

  const currentLang = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0]

  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: 'Platforms', href: '#', dropdown: true },
    { name: t('nav.pricing'), href: '/pricing' },
    { name: 'Finance', href: '/finance' },
    { name: t('nav.book'), href: '/booking' },
    { name: t('nav.bible'), href: '/bible' },
    { name: t('nav.phledgertax'), href: '/phledgertax' },
    { name: t('nav.feedback'), href: '/feedback' },
    { name: t('nav.about'), href: '/about' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar: Country, Language, Auth */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-9 space-x-4 text-xs">
            {/* Country */}
            <div className="relative">
              <button onClick={() => { setShowCountryDropdown(!showCountryDropdown); setShowLangDropdown(false) }}
                className="flex items-center space-x-1 text-gray-600 hover:text-linkedin transition-colors">
                <span>{country.flag}</span>
                <span className="hidden sm:inline">{country.name}</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showCountryDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
                  {countries.map((c) => (
                    <button key={c.code} onClick={() => { setCountry(c); setShowCountryDropdown(false) }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center space-x-2 ${country.code === c.code ? 'bg-blue-50 text-linkedin' : 'text-gray-700'}`}>
                      <span>{c.flag}</span><span>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-gray-300">|</span>
            {/* Language */}
            <div className="relative">
              <button onClick={() => { setShowLangDropdown(!showLangDropdown); setShowCountryDropdown(false) }}
                className="flex items-center space-x-1 text-gray-600 hover:text-linkedin transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                <span>{currentLang.native}</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showLangDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 z-50 min-w-[150px]">
                  {LANGUAGES.map((l) => (
                    <button key={l.code} onClick={() => { setLocale(l.code); setShowLangDropdown(false) }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${locale === l.code ? 'bg-blue-50 text-linkedin font-medium' : 'text-gray-700'}`}>
                      <span>{l.native}</span><span className="text-gray-400 text-[10px]">{l.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-gray-300">|</span>
            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-linkedin rounded-full flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">{user?.name?.split(' ').map(n => n[0]).join('') || 'U'}</span>
                </div>
                <span className="text-gray-700 font-medium hidden sm:inline">{user?.name}</span>
                {user?.role === 'admin' && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold">ADMIN</span>}
                <button onClick={logout} className="text-gray-500 hover:text-red-600 transition-colors ml-1">{t('nav.signout')}</button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="text-gray-600 hover:text-linkedin font-medium transition-colors">{t('nav.signin')}</Link>
                <Link href="/signup" className="bg-linkedin text-white px-3 py-1 rounded font-medium hover:bg-linkedin-dark transition-colors">{t('nav.signup')}</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-linkedin to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Ph</span>
              </div>
              <span className="font-bold text-lg text-gray-900">Digital Marketing</span>
            </Link>
            <span className="text-xs text-gray-500 ml-3 hidden md:inline">{t('nav.powered')}</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {isAuthenticated && (
              <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-linkedin bg-blue-50 rounded-md">{t('nav.dashboard')}</Link>
            )}
            {navigation.map((item) => (
              item.dropdown ? (
                <div key="platforms" className="relative">
                  <button onClick={() => setShowPlatforms(!showPlatforms)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-linkedin hover:bg-blue-50 rounded-md transition-colors flex items-center">
                    Platforms
                    <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showPlatforms && (
                    <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-xl py-2 z-50 min-w-[200px]">
                      {platformLinks.map(p => (
                        <Link key={p.href} href={p.href} onClick={() => setShowPlatforms(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-linkedin">
                          <span className="mr-3 text-lg">{p.icon}</span>{p.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.href} href={item.href}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-linkedin hover:bg-blue-50 rounded-md transition-colors">
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-gray-700 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {isAuthenticated && (
              <Link href="/dashboard" className="block px-3 py-2 text-base font-medium text-linkedin bg-blue-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            )}
            <p className="px-3 py-1 text-xs font-bold text-gray-400 uppercase">Platforms</p>
            {platformLinks.map(p => (
              <Link key={p.href} href={p.href} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-linkedin hover:bg-blue-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}>{p.icon} {p.name}</Link>
            ))}
            <hr className="my-2" />
            {navigation.filter(n => !n.dropdown).slice(1).map((item) => (
              <Link key={item.href} href={item.href}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-linkedin hover:bg-blue-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}>{item.name}</Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
