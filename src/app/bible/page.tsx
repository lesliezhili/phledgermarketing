'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { BIBLE_VERSES, MARKETING_WISDOM } from '@/lib/bible'

const categories = ['All', 'business', 'finance', 'marketing', 'networking', 'leadership', 'trust', 'diligence', 'wisdom', 'service']

export default function BiblePage() {
  const { t } = useI18n()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? BIBLE_VERSES : BIBLE_VERSES.filter(v => v.category === filter)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('bible.title')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">{t('bible.foundation.desc')}</p>
      </div>

      {/* Marketing Wisdom Lessons */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('bible.lessons')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MARKETING_WISDOM.map((lesson, i) => (
            <div key={i} className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">{lesson.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{lesson.lesson}</p>
              <p className="text-xs italic text-amber-700">{lesson.verse}</p>
              <p className="text-xs text-amber-600 mt-1">{lesson.application}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Verse Collection */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('bible.all.verses')}</h2>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === cat
                  ? 'bg-linkedin text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === 'All' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Verses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((verse, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
              <p className="text-gray-700 text-sm italic leading-relaxed mb-3">
                &ldquo;{verse.text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">— {verse.reference}</p>
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">{verse.category}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Foundation Note */}
      <section className="mt-16 text-center bg-amber-50 border border-amber-200 rounded-xl p-8">
        <h3 className="text-xl font-bold text-amber-900 mb-2">{t('bible.foundation')}</h3>
        <p className="text-amber-800">{t('bible.foundation.desc')}</p>
      </section>
    </div>
  )
}
