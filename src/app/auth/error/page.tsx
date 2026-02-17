"use client"

import { Suspense } from 'react'
import AuthError from '@/views/auth-error'
import { Loader2 } from 'lucide-react'

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthError />
    </Suspense>
  )
}

