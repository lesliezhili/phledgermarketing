'use client'

import Link from 'next/link'

const sectors = [
  {
    name: 'SilverConnect Global',
    tagline: 'Digital Inclusion for Seniors',
    market: '$52B Aged Care Market',
    icon: '🤝',
    color: 'from-slate-700 to-purple-900',
    href: '/finance/silverconnect',
    bodies: 12,
    templates: 3,
    verse: 'Proverbs 16:31',
  },
  {
    name: 'GraceCovenant',
    tagline: 'Covenant Community for Churches',
    market: '$14B Church Tech Market',
    icon: '⛪',
    color: 'from-indigo-800 to-amber-700',
    href: '/finance/gracecovenant',
    bodies: 14,
    templates: 4,
    verse: 'Hebrews 10:24-25',
  },
]

export default function FinancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-linkedin to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">Ph</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">PhLedger Finance & Investment</h1>
          <p className="text-gray-300 text-lg">Investor relations, pitch materials, and partnership outreach for PhLedger ecosystem products.</p>
          <p className="text-amber-400 text-sm mt-4 italic">"The plans of the diligent lead to profit as surely as haste leads to poverty." — Proverbs 21:5</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Select Customer Sector</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {sectors.map((sector) => (
            <Link key={sector.name} href={sector.href} className="group">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                <div className={`bg-gradient-to-br ${sector.color} p-8 text-white`}>
                  <span className="text-4xl">{sector.icon}</span>
                  <h3 className="text-2xl font-bold mt-4">{sector.name}</h3>
                  <p className="text-gray-200 mt-1">{sector.tagline}</p>
                </div>
                <div className="p-6">
                  <p className="text-lg font-semibold text-gray-900">{sector.market}</p>
                  <div className="mt-4 flex gap-4 text-sm text-gray-600">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">{sector.bodies} Investment Bodies</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full">{sector.templates} Email Templates</span>
                  </div>
                  <p className="text-xs text-amber-600 mt-3 italic">{sector.verse}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-gray-500 hover:underline">← Back to Digital Marketing</Link>
        </div>
      </div>
    </div>
  )
}
