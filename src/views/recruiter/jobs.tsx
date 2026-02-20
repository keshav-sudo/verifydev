"use client"

/**
 * Recruiter Jobs List Page
 * View and manage posted jobs
 */

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { get } from '@/api/client'
import {
  Plus,
  Search,
  Briefcase,
  Users,
  MapPin,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'

interface Job {
  id: string
  title: string
  location: string
  isRemote: boolean
  type: string
  level: string
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'DRAFT'
  applicationsCount: number
  createdAt: string
  requiredSkills: string[]
}

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  PAUSED: { label: 'Paused', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  CLOSED: { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  DRAFT: { label: 'Draft', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
}

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
}

export default function RecruiterJobsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: async () => {
      const res = await get<{ jobs: Job[] }>('/v1/recruiter/jobs')
      return res.jobs
    },
  })

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalApplicants = jobs.reduce((sum, job) => sum + job.applicationsCount, 0)
  const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F0F2F5] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#ADFF2F]" />
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-500">
            Loading jobs
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#F0F2F5] p-4 md:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-[1536px] mx-auto space-y-6">

        {/* ========================================= */}
        {/* 1. DARK HERO SECTION                      */}
        {/* ========================================= */}
        <div className="bg-[#0A0A0A] rounded-2xl p-8 lg:p-12 shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#A78BFA]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-64 h-64 bg-[#ADFF2F]/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1 rounded-[4px] bg-white/10 border border-white/5 text-[#ADFF2F] text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] animate-pulse" /> Recruitment
                </div>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Recruiter Console</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Job <span className="text-[#A78BFA]">Listings</span>
              </h1>
              <p className="text-sm text-slate-400 font-medium max-w-lg leading-relaxed">
                {jobs.length} job{jobs.length !== 1 ? 's' : ''} &middot; {activeJobs} active &middot; {totalApplicants} total applicants
              </p>
            </div>

            <Link href="/recruiter/post-job">
              <button className="px-6 py-3 bg-white text-slate-900 rounded-lg text-xs font-extrabold uppercase tracking-widest hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0 self-start">
                <Plus className="w-3 h-3" /> Post New Job
              </button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        {/* Content */}
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {[
              { icon: Briefcase, value: jobs.length, label: 'Total Jobs', color: '#64748B' },
              { icon: Eye, value: activeJobs, label: 'Active', color: '#65A30D' },
              { icon: Users, value: totalApplicants, label: 'Applicants', color: '#A78BFA' },
              { icon: Clock, value: jobs.filter(j => j.status === 'DRAFT').length, label: 'Drafts', color: '#64748B' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5">
                <div className="flex items-center gap-3">
                  <div
                    className="p-1.5 rounded-md border"
                    style={{
                      backgroundColor: `${stat.color}10`,
                      borderColor: `${stat.color}20`,
                    }}
                  >
                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                      {stat.label}
                    </p>
                    <p className="text-4xl font-black text-slate-900 tracking-tight leading-none mt-0.5">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 px-3 py-2.5 bg-white rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-colors appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="CLOSED">Closed</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          {/* Section Header */}
          <div className="mb-4">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">
              {filteredJobs.length} Result{filteredJobs.length !== 1 ? 's' : ''}
            </h2>
          </div>

          {/* Jobs List */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-16">
              <div className="p-3 bg-slate-100 rounded-xl mb-4">
                <Briefcase className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">No jobs found</h3>
              <p className="text-xs text-slate-500 mb-5">
                {jobs.length === 0 ? "You haven't posted any jobs yet" : 'No jobs match your filters'}
              </p>
              <Link href="/recruiter/post-job">
                <button className="flex items-center gap-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  Post Your First Job
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

  )
}

function JobCard({ job }: { job: Job }) {
  const status = STATUS_CONFIG[job.status]

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 md:p-6 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
            <Link
              href={`/recruiter/jobs/${job.id}/applicants`}
              className="text-base font-bold text-slate-900 hover:text-[#65A30D] transition-colors truncate"
            >
              {job.title}
            </Link>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[9px] font-extrabold uppercase tracking-widest ${status.bg} ${status.text} ${status.border}`}
            >
              {status.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
              {job.isRemote && ' (Remote)'}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {TYPE_LABELS[job.type] || job.type}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills?.slice(0, 5).map(skill => (
              <span
                key={skill}
                className="inline-flex items-center px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 uppercase tracking-wide"
              >
                {skill}
              </span>
            ))}
            {job.requiredSkills?.length > 5 && (
              <span className="inline-flex items-center px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                +{job.requiredSkills.length - 5} more
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href={`/recruiter/jobs/${job.id}/applicants`}>
            <div className="text-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
              <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {job.applicationsCount}
              </p>
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">
                Applicants
              </p>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit Job
              </DropdownMenuItem>
              <DropdownMenuItem>
                {job.status === 'ACTIVE' ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Pause Job
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Activate Job
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
