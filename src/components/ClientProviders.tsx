'use client'

import { AuthProvider } from '@/lib/auth'
import { I18nProvider } from '@/lib/i18n'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </I18nProvider>
  )
}
