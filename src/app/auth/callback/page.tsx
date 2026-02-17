"use client"

import { Suspense } from 'react'
import AuthCallback from '@/views/auth-callback'
import { Loader2 } from 'lucide-react'

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallback />
    </Suspense>
  )
}

