"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useRecruiterStore } from '@/store/recruiter-store'
import { useUIStore } from '@/store/ui-store'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary'

// Auth check timeout - prevent infinite loading if backend is down
const AUTH_CHECK_TIMEOUT_MS = 10000

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: 'always',
            retry: 1,
            structuralSharing: true,
          },
        },
      })
  )

  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  
  const { checkAuth } = useAuthStore()
  const { checkAuth: checkRecruiterAuth } = useRecruiterStore()
  const { theme, accentColor } = useUIStore()

  // Initialize auth with timeout
  const initializeAuth = useCallback(async () => {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Auth check timeout')), AUTH_CHECK_TIMEOUT_MS)
      })

      // Race auth check against timeout
      await Promise.race([
        Promise.all([
          checkAuth(),
          checkRecruiterAuth()
        ]),
        timeoutPromise
      ])
    } catch (error: any) {
      console.warn('Auth initialization warning:', error?.message)
      // Don't block rendering - just log the warning
      // User may not be authenticated, which is fine for public pages
      if (error?.message === 'Auth check timeout') {
        setInitError('Backend connection slow. Some features may be unavailable.')
      }
    } finally {
      setIsInitializing(false)
    }
  }, [checkAuth, checkRecruiterAuth])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Initialize UI preferences
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    
    // Reset classes
    root.classList.remove('dark', 'neutral')

    // Theme Logic
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'neutral') {
      root.classList.add('dark', 'neutral')
    } else if (theme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      }
    }

    // Accent Color
    if (accentColor) {
      document.documentElement.style.setProperty('--primary', accentColor)
      document.documentElement.style.setProperty('--ring', accentColor)
    }
  }, [theme, accentColor])

  // Show minimal loading state only briefly
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {/* Show connection warning banner if there was an error */}
        {initError && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 text-center text-sm text-yellow-600 dark:text-yellow-400">
            ⚠️ {initError}
          </div>
        )}
        {children}
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
