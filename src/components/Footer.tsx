'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-linkedin to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Ph</span>
              </div>
              <span className="text-white font-bold text-lg">Digital Marketing</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">Faith-driven digital marketing across LinkedIn, Instagram, Facebook, X, and Google Maps. Powered by PhLedger + Supabase.</p>
            <a href="https://www.linkedin.com/company/phledger/" target="_blank" rel="noopener noreferrer" className="text-linkedin hover:text-blue-400 text-sm transition-colors">{t('footer.follow')}</a>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Platforms</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services" className="hover:text-white transition-colors">💼 LinkedIn</Link></li>
              <li><Link href="/instagram" className="hover:text-white transition-colors">📸 Instagram</Link></li>
              <li><Link href="/facebook" className="hover:text-white transition-colors">👥 Facebook</Link></li>
              <li><Link href="/x-twitter" className="hover:text-white transition-colors">𝕏 X (Twitter)</Link></li>
              <li><Link href="/google-maps" className="hover:text-white transition-colors">📍 Google Maps</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.ecosystem')}</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-400">SilverConnect</span></li>
              <li><span className="text-white font-medium">Digital Marketing</span></li>
              <li><Link href="/phledgertax" className="hover:text-white transition-colors">PhLedgerTax</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">{t('nav.pricing')}</Link></li>
              <li><Link href="/bible" className="hover:text-white transition-colors">{t('nav.bible')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">{t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  )
}
