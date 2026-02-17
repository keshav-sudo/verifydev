"use client"

import dynamic from 'next/dynamic'

const JobDetail = dynamic(() => import('@/views/job-detail'), {
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading job...</p>
      </div>
    </div>
  ),
  ssr: false,
})

export default function JobDetailPage() {
  return <JobDetail />
}
