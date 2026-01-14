"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Loader2, AlertCircle } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setTokens, checkAuth } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading')

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const accessToken = searchParams.get('accessToken')
        const refreshToken = searchParams.get('refreshToken') || '' // May be in httpOnly cookie instead
        const errorParam = searchParams.get('error') || searchParams.get('message')

        if (errorParam) {
          console.error('Auth error from backend:', errorParam)
          setError(errorParam)
          setStatus('error')
          // Wait a moment before redirecting so user sees error
          setTimeout(() => {
            router.replace('/?error=' + encodeURIComponent(errorParam))
          }, 2000)
          return
        }

        if (!accessToken) {
          setError('No access token received from authentication')
          setStatus('error')
          setTimeout(() => {
            router.replace('/?error=no_token')
          }, 2000)
          return
        }

        // Store tokens
        setTokens(accessToken, refreshToken)
        
        // Verify the token works by fetching user data
        await checkAuth()
        
        setStatus('success')
        router.replace('/dashboard')
      } catch (err: any) {
        console.error('Auth callback error:', err)
        setError(err?.message || 'Authentication failed')
        setStatus('error')
        setTimeout(() => {
          router.replace('/?error=auth_failed')
        }, 2000)
      }
    }

    handleAuth()
  }, [searchParams, setTokens, checkAuth, router])

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-destructive">Authentication Failed</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            {error || 'An error occurred during authentication.'}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Redirecting you back...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Authenticating...</h2>
        <p className="text-muted-foreground mt-2">
          Please wait while we complete your sign in.
        </p>
      </div>
    </div>
  )
}
