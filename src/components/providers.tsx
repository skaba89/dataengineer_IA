"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { I18nProvider } from "@/lib/i18n"
import { SentryProvider, SentryErrorBoundary } from "@/components/providers/sentry-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <SentryProvider>
      <SentryErrorBoundary>
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <I18nProvider>
                {children}
              </I18nProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </SessionProvider>
      </SentryErrorBoundary>
    </SentryProvider>
  )
}
