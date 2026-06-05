import type { Metadata } from 'next'
import './globals.css'
import BibleBanner from '@/components/BibleBanner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BibleFooter from '@/components/BibleFooter'
import ClientProviders from '@/components/ClientProviders'

export const metadata: Metadata = {
  title: 'PhLedger Digital Marketing | Faith-Driven Growth Across All Platforms',
  description: 'Grow your digital presence across LinkedIn, Instagram, Facebook, X, and Google Maps with faith-driven marketing strategies. Powered by PhLedger.',
  keywords: ['digital marketing', 'PhLedger', 'LinkedIn', 'Instagram', 'Facebook', 'X Twitter', 'Google Maps', 'faith-driven business'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <ClientProviders>
          <BibleBanner />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <BibleFooter />
        </ClientProviders>
      </body>
    </html>
  )
}
