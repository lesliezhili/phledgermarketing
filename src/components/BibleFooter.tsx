'use client'

import { useI18n } from '@/lib/i18n'

const footerVerses = [
  { text: "Trust in the LORD with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
  { text: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
  { text: "The LORD is my shepherd; I shall not want.", reference: "Psalm 23:1" },
]

export default function BibleFooter() {
  const { t } = useI18n()

  return (
    <div className="bg-gradient-to-b from-amber-900 to-amber-950 text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cross Divider */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-px bg-amber-600 flex-1 max-w-[100px]" />
          <span className="mx-4 text-2xl text-amber-400">✝</span>
          <div className="h-px bg-amber-600 flex-1 max-w-[100px]" />
        </div>

        {/* Scripture Heading */}
        <h3 className="text-center text-lg font-semibold text-amber-300 mb-6">
          {t('biblefooter.heading')}
        </h3>

        {/* Verse Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {footerVerses.map((verse, i) => (
            <div key={i} className="text-center px-4">
              <p className="text-amber-100 text-sm italic leading-relaxed">
                &ldquo;{verse.text}&rdquo;
              </p>
              <p className="text-amber-400 text-xs font-semibold mt-2">
                — {verse.reference}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center mb-6">
          <div className="h-px bg-amber-700 flex-1 max-w-[200px]" />
          <span className="mx-3 text-amber-500 text-xs">{t('footer.powered').toUpperCase()}</span>
          <div className="h-px bg-amber-700 flex-1 max-w-[200px]" />
        </div>

        {/* PhLedger Ecosystem */}
        <div className="text-center">
          <p className="text-amber-200 text-sm mb-2">
            {t('footer.ecosystem')}
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-amber-400">
            <span>SilverConnect</span>
            <span className="text-amber-600">&bull;</span>
            <span className="font-semibold text-white">LinkedIn Marketing</span>
            <span className="text-amber-600">&bull;</span>
            <span>PhLedgerTax</span>
          </div>
          <a
            href="https://www.linkedin.com/company/phledger/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-amber-300 text-xs hover:text-white transition-colors"
          >
            {t('footer.follow')}
          </a>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-4 border-t border-amber-800 text-center">
          <p className="text-amber-500 text-xs">
            &ldquo;For where your treasure is, there your heart will be also.&rdquo; — Matthew 6:21
          </p>
          <p className="text-amber-600 text-xs mt-2">
            {t('footer.rights')}
          </p>
        </div>
      </div>
    </div>
  )
}
