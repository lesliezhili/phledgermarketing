'use client'

import { getDailyVerse } from '@/lib/bible'

interface BibleVerseProps {
  text?: string
  reference?: string
  className?: string
}

export default function BibleVerse({ text, reference, className = '' }: BibleVerseProps) {
  const verse = (!text || !reference) ? getDailyVerse() : null
  const displayText = text || verse?.text || ''
  const displayRef = reference || verse?.reference || ''

  return (
    <div className={`bible-verse bg-amber-50 border border-amber-200 rounded-xl p-6 text-center ${className}`}>
      <p className="text-base leading-relaxed italic text-gray-800">
        &ldquo;{displayText}&rdquo;
      </p>
      <p className="mt-2 font-semibold not-italic text-amber-800">
        — {displayRef}
      </p>
    </div>
  )
}
