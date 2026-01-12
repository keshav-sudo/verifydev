"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setTokens, checkAuth } = useAuthStore()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    // const userId = searchParams.get('userId')
    const error = searchParams.get('error') || searchParams.get('message')

    if (error) {
      console.error('Auth error:', error)
      router.replace('/?error=' + encodeURIComponent(error))
      return
    }

    if (accessToken) {
      // Store access token - refresh token is in httpOnly cookie
      setTokens(accessToken, '')
      checkAuth().then(() => {
        router.replace('/dashboard')
      }).catch(() => {
        router.replace('/?error=auth_failed')
      })
    } else {
      router.replace('/?error=no_token')
    }
  }, [searchParams, setTokens, checkAuth, router])

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
