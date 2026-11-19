import type { Metadata } from 'next'
import './globals.css'
import BibleBanner from '@/components/BibleBanner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BibleFooter from '@/components/BibleFooter'
import ClientProviders from '@/components/ClientProviders'

export const metadata: Metadata = {
  title: 'PhLedger Marketing | Faith-Driven Marketing for Any Business',
  description: 'Marketing for any business, whatever it sells. One proven 90-day method on the channels that reach your buyers — Google, Instagram, Facebook, LinkedIn, X and more. Powered by PhLedger.',
  keywords: ['digital marketing', 'small business marketing', 'PhLedger', 'local marketing', 'social media', 'Google Business Profile', 'faith-driven business'],
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
