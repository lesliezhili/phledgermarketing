'use client'

import { useEffect, useState } from 'react'
import { BIBLE_VERSES, getDailyVerse } from '@/lib/bible'

export default function BibleBanner() {
  const [verse, setVerse] = useState(getDailyVerse())

  useEffect(() => {
    setVerse(getDailyVerse())
  }, [])

  return (
    <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-amber-800 text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
        <span className="text-amber-300 mr-2">✝</span>
        <p className="text-xs sm:text-sm font-light italic truncate">
          &ldquo;{verse.text}&rdquo;
          <span className="font-semibold not-italic ml-1">— {verse.reference}</span>
        </p>
        <span className="text-amber-300 ml-2">✝</span>
      </div>
    </div>
  )
}
