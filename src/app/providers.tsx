"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useRecruiterStore } from '@/store/recruiter-store'
import { useUIStore } from '@/store/ui-store'
import { Toaster } from '@/components/ui/toaster'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  const { checkAuth, isLoading } = useAuthStore()
  const { checkAuth: checkRecruiterAuth } = useRecruiterStore()
  const { theme, accentColor } = useUIStore()

  useEffect(() => {
    checkAuth()
    checkRecruiterAuth()
  }, [checkAuth, checkRecruiterAuth])

  // Initialize UI preferences
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Theme
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Accent Color
    if (accentColor) {
      document.documentElement.style.setProperty('--primary', accentColor)
      document.documentElement.style.setProperty('--ring', accentColor)
    }
  }, [theme, accentColor])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

