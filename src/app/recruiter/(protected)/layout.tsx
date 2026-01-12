"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRecruiterStore } from '@/store/recruiter-store'
import RecruiterLayoutComponent from '@/components/layout/recruiter-layout'
import { Loader2 } from 'lucide-react'

export default function RecruiterProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useRecruiterStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/recruiter/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <RecruiterLayoutComponent>{children}</RecruiterLayoutComponent>
}

