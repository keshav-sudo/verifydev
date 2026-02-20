"use client"

/**
 * Recruiter Dashboard - Command Center
 * Sharp, clean design matching the main app's design language
 */

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRecruiterDashboard } from '@/hooks/use-recruiter'
import { useRecruiterStore } from '@/store/recruiter-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getInitials, formatNumber } from '@/lib/utils'
import {
  Briefcase,
  Users,
  Star,
  Plus,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Activity,
  Zap,
  LayoutDashboard,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

export default function RecruiterDashboard() {
  const router = useRouter()
  const { recruiter } = useRecruiterStore()
  const { data: dashboardData, isLoading } = useRecruiterDashboard()

  const stats = dashboardData?.stats || { activeJobs: 0, totalApplications: 0, newCandidates: 0, shortlisted: 0 }
  const recentApps = dashboardData?.recentApplications || []
  const topJobs = dashboardData?.topJobs || []

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-slate-200 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 border-2 border-[#ADFF2F] border-t-transparent animate-spin rounded-lg"></div>
          </div>
          <p className="text-slate-500 text-[10px] font-extrabold tracking-widest animate-pulse uppercase">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#F0F2F5] relative p-4 md:p-6 lg:p-8 font-sans text-slate-800 overflow-x-hidden">
      <div className="max-w-[1536px] mx-auto space-y-6">

        {/* ========================================= */}
        {/* 1. DARK COMMAND CENTER HERO               */}
        {/* ========================================= */}
        <div className="bg-[#0A0A0A] rounded-2xl p-8 lg:p-12 shadow-xl relative overflow-hidden border border-slate-800 min-h-[320px] flex items-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ADFF2F]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-64 h-64 bg-[#A78BFA]/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="absolute right-0 bottom-0 h-[400px] w-[450px] pointer-events-none z-0 hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tl from-[#ADFF2F]/10 via-transparent to-transparent rounded-full blur-2xl" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 rounded-[4px] bg-white/10 border border-white/5 text-[#ADFF2F] text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] animate-pulse" /> Recruiter Console
              </div>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{currentDate}</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Welcome back, <br className="hidden md:block" /> <span className="text-slate-400">{recruiter?.name?.split(' ')[0] || 'Recruiter'}</span>
              </h1>
              <p className="text-sm text-slate-400 font-medium max-w-lg leading-relaxed">
                Your recruiting pipeline is active. Track applications, discover talent, and manage your hiring workflow.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <button
                onClick={() => router.push('/recruiter/post-job')}
                className="px-6 py-3 bg-white text-slate-900 rounded-lg text-xs font-extrabold uppercase tracking-widest hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-3 h-3" /> Post New Job <ChevronRight className="w-3 h-3" />
              </button>

              <div className="h-8 w-px bg-white/10" />

              <div className="flex items-center gap-3">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Active Jobs</div>
                <div className="text-white font-black text-xl flex items-center gap-2">
                  {stats.activeJobs} <ShieldCheck className="w-4 h-4 text-[#ADFF2F]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* 2. PREMIUM METRICS GRID                   */}
        {/* ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Card 1: Active Jobs */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Briefcase className="w-16 h-16 text-blue-500 -rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-50 rounded-md border border-blue-100">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Active Jobs</span>
              </div>
              <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">{formatNumber(stats.activeJobs)}</div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm">Live</span>
                <span className="text-[10px] font-medium text-slate-400">Currently Active</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Applications */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-16 h-16 text-[#A78BFA] -rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-[#A78BFA]/10 rounded-md border border-[#A78BFA]/20">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Applications</span>
              </div>
              <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">{formatNumber(stats.totalApplications)}</div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#65A30D] bg-[#ADFF2F]/20 px-1.5 py-0.5 rounded-sm">+12%</span>
                <span className="text-[10px] font-medium text-slate-400">This Week</span>
              </div>
            </div>
          </div>

          {/* Card 3: New Candidates */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-16 h-16 text-[#ADFF2F] -rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-[#ADFF2F]/10 rounded-md border border-[#ADFF2F]/20">
                  <Zap className="w-4 h-4 text-[#65A30D]" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">New Candidates</span>
              </div>
              <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">{formatNumber(stats.newCandidates)}</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#ADFF2F] h-full rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>

          {/* Card 4: Shortlisted */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Star className="w-16 h-16 text-amber-500 -rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-amber-50 rounded-md border border-amber-100">
                  <Star className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Shortlisted</span>
              </div>
              <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">{formatNumber(stats.shortlisted)}</div>
              <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wide">
                <span className="text-amber-600">Ready</span> <span className="text-slate-300">•</span> <span className="text-[#65A30D]">Pipeline Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* 3. MAIN CONTENT GRID                      */}
        {/* ========================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN (8/12) */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* RECENT APPLICATIONS */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-400" /> Recent Applications
                </h3>
                <Link href="/recruiter/applications" className="text-[10px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors uppercase tracking-widest">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {recentApps.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentApps.map((app, i) => (
                    <div key={app.id || i} className="flex items-center justify-between p-4 hover:bg-slate-50/60 transition-colors group cursor-pointer" onClick={() => app.id && router.push(`/recruiter/candidate/${app.id}`)}>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                          <AvatarImage src={app.candidateAvatar} />
                          <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">{getInitials(app.candidateName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">{app.candidateName}</p>
                          <p className="text-[10px] font-medium text-slate-400">Applied for <span className="text-slate-600 font-bold">{app.jobTitle}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {app.matchScore && (
                          <div className={`text-[10px] font-extrabold px-2 py-0.5 rounded-[2px] uppercase tracking-widest border ${
                            app.matchScore >= 80
                              ? 'bg-[#ADFF2F]/20 text-[#65A30D] border-[#ADFF2F]/30'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {app.matchScore}% Match
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400">{new Date(app.appliedAt).toLocaleDateString()}</p>
                          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">{app.status}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg mx-auto mb-4 flex items-center justify-center border border-slate-200">
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">No Applications Yet</h3>
                  <p className="text-xs text-slate-400 font-medium mb-4">Post a job or search candidates to build your pipeline.</p>
                  <button
                    onClick={() => router.push('/recruiter/post-job')}
                    className="px-4 py-2 text-xs bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all uppercase tracking-widest"
                  >
                    Post a Job
                  </button>
                </div>
              )}
            </div>

            {/* QUICK ACTIONS ROW */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-[#A78BFA]/10 rounded-md border border-[#A78BFA]/20">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Messages</span>
                </div>
                <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">0</div>
                <p className="text-[10px] font-medium text-slate-400 mb-4">Unread messages from candidates</p>
                <button
                  onClick={() => router.push('/recruiter/messages')}
                  className="w-full px-4 py-2 text-[10px] bg-slate-100 text-slate-700 font-extrabold rounded-lg hover:bg-slate-200 transition-all uppercase tracking-widest border border-slate-200"
                >
                  Open Inbox
                </button>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-[#ADFF2F]/10 rounded-md border border-[#ADFF2F]/20">
                    <TrendingUp className="w-4 h-4 text-[#65A30D]" />
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Activity</span>
                </div>
                <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">High</div>
                <p className="text-[10px] font-medium text-slate-400 mb-4">You're in the top 10% of active recruiters</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#ADFF2F] h-full rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (4/12) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Top Performing
                </h3>
                <Link href="/recruiter/jobs" className="text-[10px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors uppercase tracking-widest">
                  All Jobs <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-6 space-y-5">
                {topJobs.length > 0 ? (
                  topJobs.map((job) => (
                    <div key={job.id} className="group cursor-pointer" onClick={() => router.push(`/recruiter/jobs/${job.id}`)}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-extrabold text-slate-900 truncate max-w-[200px] group-hover:text-blue-600 transition-colors">{job.title}</h4>
                        <div className="px-2 py-0.5 rounded-[2px] bg-[#ADFF2F]/20 text-[#65A30D] text-[9px] font-extrabold uppercase tracking-widest border border-[#ADFF2F]/30 ml-2 shrink-0">
                          Active
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5 p-2 rounded-md bg-slate-50 border border-slate-100 text-[10px]">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span className="font-black text-slate-900">{job.applicationCount}</span>
                          <span className="text-slate-400 font-medium">apps</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-2 rounded-md bg-slate-50 border border-slate-100 text-[10px]">
                          <LayoutDashboard className="w-3 h-3 text-slate-400" />
                          <span className="font-black text-slate-900">{job.viewCount}</span>
                          <span className="text-slate-400 font-medium">views</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-400 mb-2">No active jobs yet</p>
                    <button
                      onClick={() => router.push('/recruiter/post-job')}
                      className="text-[10px] font-extrabold text-slate-600 hover:text-slate-900 uppercase tracking-widest transition-colors"
                    >
                      Create one now →
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                <button
                  onClick={() => router.push('/recruiter/jobs')}
                  className="w-full flex items-center justify-center gap-2 text-[10px] font-extrabold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors"
                >
                  Manage All Jobs <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
