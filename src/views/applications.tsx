"use client"

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getMyApplications, withdrawApplication } from '@/api/services/job.service'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import type { ApplicationWithDetails } from '@/types/application'
import {
  Search,
  MapPin,
  Building,
  Clock,
  FileCheck2,
  ArrowRight,
  Eye,
  XCircle,
  CheckCircle2,
  Timer,
  Star,
  MessageSquare,
  Inbox,
} from 'lucide-react'

type StatusFilter = 'ALL' | 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFER' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  PENDING:     { label: 'Pending',     color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200', icon: Timer },
  REVIEWING:   { label: 'Reviewing',   color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200',  icon: Eye },
  SHORTLISTED: { label: 'Shortlisted', color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-200', icon: Star },
  INTERVIEW:   { label: 'Interview',   color: 'text-orange-600',  bg: 'bg-orange-50',  border: 'border-orange-200', icon: MessageSquare },
  OFFER:       { label: 'Offer',       color: 'text-[#65A30D]',   bg: 'bg-[#ADFF2F]/10', border: 'border-[#ADFF2F]/30', icon: CheckCircle2 },
  ACCEPTED:    { label: 'Accepted',    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
  REJECTED:    { label: 'Rejected',    color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',    icon: XCircle },
  WITHDRAWN:   { label: 'Withdrawn',   color: 'text-slate-500',   bg: 'bg-slate-50',   border: 'border-slate-200',  icon: XCircle },
}

function AppCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 h-[180px] animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="h-11 w-11 rounded-lg bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-48 bg-slate-100 rounded-sm" />
          <div className="h-3 w-32 bg-slate-100 rounded-sm" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-100 rounded-sm" />
        <div className="h-3 w-3/4 bg-slate-100 rounded-sm" />
      </div>
    </div>
  )
}

export default function Applications() {
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('ALL')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'match'>('newest')
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => getMyApplications(1, 100),
  })

  const withdrawMutation = useMutation({
    mutationFn: withdrawApplication,
    onSuccess: () => {
      toast({ title: 'Application withdrawn' })
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
    },
    onError: () => toast({ variant: 'destructive', title: 'Error', description: 'Failed to withdraw application' }),
  })

  const applications: ApplicationWithDetails[] = useMemo(() => {
    const apps = data?.data || (data as any)?.applications || []
    return apps
  }, [data])

  const filtered = useMemo(() => {
    let list = applications
    if (activeStatus !== 'ALL') list = list.filter(a => a.status === activeStatus)
    if (search) {
      const s = search.toLowerCase()
      list = list.filter(a => (a as any).job?.title?.toLowerCase().includes(s) || (a as any).job?.companyName?.toLowerCase().includes(s))
    }
    if (sortBy === 'newest') list = [...list].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    if (sortBy === 'oldest') list = [...list].sort((a, b) => new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime())
    if (sortBy === 'match') list = [...list].sort((a, b) => ((b as any).matchScore?.overall || 0) - ((a as any).matchScore?.overall || 0))
    return list
  }, [applications, activeStatus, search, sortBy])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: applications.length }
    applications.forEach((a: any) => { counts[a.status] = (counts[a.status] || 0) + 1 })
    return counts
  }, [applications])

  const statuses: StatusFilter[] = ['ALL', 'PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']

  return (
    <div className="w-full min-h-screen bg-[#F0F2F5] relative p-4 md:p-6 lg:p-8 font-['Plus_Jakarta_Sans'] text-slate-800 overflow-x-hidden">
      <div className="max-w-[1536px] mx-auto space-y-6">

        {/* DARK HERO */}
        <div className="bg-[#0A0A0A] rounded-2xl p-8 lg:p-12 shadow-xl relative overflow-hidden border border-slate-800 min-h-[200px] flex items-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ADFF2F]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-64 h-64 bg-[#A78BFA]/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1 rounded-[4px] bg-white/10 border border-white/5 text-[#ADFF2F] text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                  <FileCheck2 className="w-3 h-3" /> Applications
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Track Your <span className="text-slate-400">Applications</span>
              </h1>
              <p className="text-sm text-slate-400 font-medium max-w-lg leading-relaxed">
                Monitor the status of every job application in one place.
              </p>
            </div>
            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-black text-white">{statusCounts['ALL'] || 0}</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-[#ADFF2F]">{(statusCounts['OFFER'] || 0) + (statusCounts['ACCEPTED'] || 0)}</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Offers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-[#A78BFA]">{statusCounts['INTERVIEW'] || 0}</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Interviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS TABS + SEARCH */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search by title or company..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10 bg-slate-50 border-slate-200 rounded-lg text-sm font-medium" />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="match">Best Match</option>
            </select>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {statuses.map(status => {
              const count = statusCounts[status] || 0
              const conf = status === 'ALL' ? null : statusConfig[status]
              return (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest rounded-md transition-all whitespace-nowrap border flex items-center gap-1.5",
                    activeStatus === status
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {status === 'ALL' ? 'All' : conf?.label}
                  {count > 0 && <span className={cn("text-[9px] ml-0.5", activeStatus === status ? "text-slate-300" : "text-slate-400")}>({count})</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* APPLICATIONS LIST */}
        <div className="space-y-3">
          {isLoading && (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <AppCardSkeleton key={i} />)}</div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-2">No Applications</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">
                {activeStatus === 'ALL' ? "You haven't applied to any jobs yet." : `No ${statusConfig[activeStatus]?.label.toLowerCase()} applications.`}
              </p>
              {activeStatus === 'ALL' && (
                <Button onClick={() => router.push('/jobs')} className="h-8 px-4 text-xs font-extrabold uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 rounded-lg">
                  Browse Jobs <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          )}

          <AnimatePresence>
            {filtered.map((app: any) => {
              const conf = statusConfig[app.status] || statusConfig['PENDING']
              const StatusIcon = conf.icon
              const job = app.job || {}
              const canWithdraw = !['REJECTED', 'WITHDRAWN', 'ACCEPTED'].includes(app.status)

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group overflow-hidden"
                >
                  <div className="p-5 lg:p-6">
                    <div className="flex items-start gap-4">
                      {/* Company Logo */}
                      <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                        {job.companyLogo ? (
                          <img src={job.companyLogo} alt={job.companyName || job.company} className="w-7 h-7 object-contain rounded-md" />
                        ) : (
                          <Building className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <h3
                              className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors line-clamp-1"
                              onClick={() => router.push(`/jobs/${app.jobId}`)}
                            >
                              {job.title || 'Job Position'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <span>{job.companyName || job.company || "Company"}</span>
                              {(job.location || job.isRemote) && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.isRemote ? "Remote" : job.location}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className={cn("px-2.5 py-1 rounded-md border text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 flex-shrink-0", conf.bg, conf.border, conf.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {conf.label}
                          </div>
                        </div>

                        {/* Match score + date */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-50">
                          {app.matchScore?.overall > 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-8 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#ADFF2F] rounded-full" style={{ width: `${app.matchScore.overall}%` }} />
                              </div>
                              <span className="text-[10px] font-bold text-slate-500">{app.matchScore.overall}% match</span>
                            </div>
                          )}
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Applied {format(new Date(app.appliedAt), 'MMM d, yyyy')}
                          </span>
                          {(job.type || job.level) && (
                            <span className="px-2 py-0.5 text-[9px] font-bold text-slate-600 bg-slate-100 rounded-[2px] uppercase tracking-wider">
                              {job.type?.replace('_', ' ') || job.level}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            onClick={() => router.push(`/jobs/${app.jobId}`)}
                            variant="outline"
                            className="h-7 px-3 rounded-md text-[10px] font-extrabold uppercase tracking-widest border-slate-200"
                          >
                            <Eye className="w-3 h-3 mr-1" /> View Job
                          </Button>
                          {canWithdraw && (
                            <Button
                              onClick={() => withdrawMutation.mutate(app.id)}
                              variant="outline"
                              className="h-7 px-3 rounded-md text-[10px] font-extrabold uppercase tracking-widest border-red-200 text-red-500 hover:bg-red-50"
                              disabled={withdrawMutation.isPending}
                            >
                              <XCircle className="w-3 h-3 mr-1" /> Withdraw
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
