"use client"

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { get } from '@/api/client'
import { getInitials, formatNumber, cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Building,
  Link as LinkIcon,
  Github,
  Code,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Zap,
  TrendingUp,
  Activity,
  Calendar,
  Star,
  GitFork,
  Loader2,
  Users,
  FolderGit2,
  ShieldCheck,
  Terminal,
  Code2,
} from 'lucide-react'

// --- Types ---
interface PublicUser {
  id: string; name: string; username: string; avatarUrl: string; bio?: string
  location?: string; company?: string; website?: string; tags?: string[]
  auraScore: number; followers: number; following: number; publicRepos: number
  githubUsername?: string; createdAt: string; isVerified?: boolean
  primaryRole?: string; primaryNiche?: string
  skills?: VerifiedSkill[]; projects?: Project[]
}
interface VerifiedSkill { name: string; category: string; isVerified: boolean; score?: number; verifiedScore?: number; source?: string }
interface Project { id: string; name: string; repoName?: string; description?: string; language?: string; stars: number; forks: number; auraContribution?: number; url?: string }

// --- Heatmap (same engineered version as profile) ---
function ContributionHeatmap({ data, type }: { data: Record<string, number>; type: 'github' | 'leetcode' }) {
  const dataMap = data || {}
  const maxValue = Math.max(...Object.values(dataMap), 1)
  const getColor = (value: number) => {
    if (value === 0) return 'bg-slate-100'
    const intensity = value / maxValue
    if (type === 'github') {
      if (intensity > 0.75) return 'bg-purple-600'
      if (intensity > 0.5) return 'bg-purple-500'
      if (intensity > 0.25) return 'bg-purple-400'
      return 'bg-purple-200'
    }
    if (intensity > 0.75) return 'bg-[#4D7C0F]'
    if (intensity > 0.5) return 'bg-[#65A30D]'
    if (intensity > 0.25) return 'bg-[#84CC16]'
    return 'bg-[#D9F99D]'
  }
  const today = new Date()
  const startDate = new Date(today)
  startDate.setFullYear(startDate.getFullYear() - 1)
  startDate.setDate(startDate.getDate() - startDate.getDay())
  const weeks: Array<Array<{ date: string; value: number; dayOfWeek: number }>> = []
  let currentWeek: Array<{ date: string; value: number; dayOfWeek: number }> = []
  const currentDate = new Date(startDate)
  const monthLabels: Array<{ label: string; weekIndex: number }> = []
  let lastMonth = -1
  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayOfWeek = currentDate.getDay()
    const month = currentDate.getMonth()
    if (dayOfWeek === 0 && month !== lastMonth) {
      monthLabels.push({ label: currentDate.toLocaleDateString('en-US', { month: 'short' }), weekIndex: weeks.length })
      lastMonth = month
    }
    currentWeek.push({ date: dateStr, value: dataMap[dateStr] || 0, dayOfWeek })
    if (dayOfWeek === 6) { weeks.push([...currentWeek]); currentWeek = [] }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  if (currentWeek.length > 0) weeks.push(currentWeek)
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']

  return (
    <div className="w-full">
      <div className="flex mb-1 ml-8">
        {weeks.map((_, weekIndex) => {
          const monthLabel = monthLabels.find(m => m.weekIndex === weekIndex)
          return (
            <div key={weekIndex} className="flex-shrink-0" style={{ width: 13 }}>
              {monthLabel && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{monthLabel.label}</span>}
            </div>
          )
        })}
      </div>
      <div className="flex">
        <div className="flex flex-col gap-[3px] mr-1.5 flex-shrink-0">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-[11px] flex items-center">
              <span className="text-[9px] font-bold text-slate-400 w-6 text-right">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-[3px] flex-1 overflow-x-auto hide-scrollbar">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const day = week.find(d => d.dayOfWeek === dayIndex)
                if (!day) return <div key={dayIndex} className="w-[11px] h-[11px]" />
                return (
                  <div key={dayIndex} className={`w-[11px] h-[11px] rounded-[2px] ${getColor(day.value)} transition-colors hover:ring-1 hover:ring-slate-400 hover:ring-offset-1 cursor-default`} title={`${day.date}: ${day.value} contributions`} />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Circular Progress
function CircularProgress({ value, size = 42, strokeWidth = 3 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx={size/2} cy={size/2} r={radius} stroke="#F1F5F9" strokeWidth={strokeWidth} fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke="#84CC16" strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-black text-slate-900">{Math.round(value)}</span>
      </div>
    </div>
  )
}

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ['public-profile', username],
    queryFn: () => get<{ profile: PublicUser }>(`/v1/u/${username}`),
    enabled: !!username,
  })

  const { data: githubStats } = useQuery({
    queryKey: ['public-github', username],
    queryFn: () => get<{ submissionCalendar: Record<string, number> }>(`/v1/u/${username}/github-stats`).catch(() => null),
    enabled: !!username,
  })

  const { data: leetcodeStats } = useQuery({
    queryKey: ['public-leetcode', username],
    queryFn: () => get<{ totalSolved: number; ranking: number; acceptanceRate: number; submissionCalendar: Record<string, number> }>(`/v1/u/${username}/leetcode-stats`).catch(() => null),
    enabled: !!username,
  })

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] font-['Plus_Jakarta_Sans']">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Not Found
  if (!profileResponse?.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] font-['Plus_Jakarta_Sans']">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Users className="h-6 w-6 text-slate-300" />
          </div>
          <h1 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-2">User Not Found</h1>
          <p className="text-xs text-slate-500 font-medium mb-6">@{username} doesn't exist or has a private profile.</p>
          <a href="/" className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-extrabold uppercase tracking-widest hover:bg-slate-800 transition-colors">
            Go Back
          </a>
        </div>
      </div>
    )
  }

  const user = profileResponse.profile
  const skills = user.skills || []
  const projects = user.projects || []
  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'github', label: 'GitHub' },
    ...(leetcodeStats ? [{ id: 'leetcode', label: 'LeetCode' }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-['Plus_Jakarta_Sans'] pb-20 relative">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="w-full max-w-[1536px] mx-auto px-4 md:px-6 lg:px-8 py-8 relative z-10">

        {/* ====== DARK HERO ====== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-[#0A0A0A] rounded-xl p-8 lg:p-10 shadow-xl border border-slate-800 relative overflow-hidden mb-8"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ADFF2F]/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 lg:w-28 lg:h-28 rounded-xl border border-slate-700 shadow-xl bg-slate-900">
                  <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover rounded-xl" />
                  <AvatarFallback className="text-3xl bg-slate-800 text-white rounded-xl font-black">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {(user.isVerified || user.auraScore > 100) && (
                  <div className="absolute -bottom-2 -right-2 p-1.5 rounded-md bg-slate-900 border border-slate-700 shadow-md">
                    <ShieldCheck className="w-5 h-5 text-[#84CC16]" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">{user.name}</h1>
                  <p className="text-sm font-bold text-slate-400 font-mono tracking-wide mt-1">@{user.username}</p>
                </div>
                {user.bio && <p className="text-xs text-slate-400 font-medium max-w-lg leading-relaxed">{user.bio}</p>}
                <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {user.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {user.location}</span>}
                  {user.company && <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-slate-500" /> {user.company}</span>}
                  {user.website && (
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#ADFF2F] transition-colors">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-500" /> Website
                    </a>
                  )}
                  {user.githubUsername && (
                    <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#ADFF2F] transition-colors">
                      <Github className="w-3.5 h-3.5 text-slate-500" /> GitHub
                    </a>
                  )}
                </div>
                {user.tags && user.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {user.tags.slice(0, 5).map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-[9px] font-extrabold text-[#A78BFA] bg-[#A78BFA]/10 border border-[#A78BFA]/20 rounded-[2px] uppercase tracking-wider">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stat cards */}
            <div className="flex gap-4 w-full lg:w-auto overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
              <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col justify-center min-w-[140px] backdrop-blur-sm">
                <div className="text-[9px] font-extrabold text-[#ADFF2F] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Aura Score
                </div>
                <div className="text-4xl font-black text-white leading-none">{user.auraScore || 0}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col justify-center min-w-[120px] backdrop-blur-sm">
                <div className="text-[9px] font-extrabold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Code2 className="w-3 h-3" /> Repos
                </div>
                <div className="text-3xl font-black text-white leading-none">{user.publicRepos || 0}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col justify-center min-w-[120px] backdrop-blur-sm">
                <div className="text-[9px] font-extrabold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> Followers
                </div>
                <div className="text-3xl font-black text-white leading-none">{formatNumber(user.followers || 0)}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ====== TABS ====== */}
        <div className="flex items-center border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-3 text-xs font-extrabold uppercase tracking-widest transition-all whitespace-nowrap border-b-2",
                activeTab === tab.id
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ====== CONTENT ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* MAIN (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">

              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  {/* Verified Stack */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-slate-400" /> Verified Stack
                      </h3>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{skills.length} skills</span>
                    </div>
                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {skills.slice(0, 15).map((skill, i) => (
                          <div key={i} className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md hover:border-slate-300 transition-colors">
                            <span className="text-[11px] font-extrabold text-slate-700">{skill.name}</span>
                            {skill.isVerified && (
                              <span className="bg-white border border-slate-200 px-1 py-0.5 rounded-sm shadow-sm flex items-center">
                                <CheckCircle2 className="w-3 h-3 text-[#65A30D]" />
                              </span>
                            )}
                            {(skill.verifiedScore || skill.score) && (
                              <span className="text-[9px] font-black text-slate-500">{skill.verifiedScore || skill.score}%</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium text-center py-6">No verified skills yet.</p>
                    )}
                  </div>

                  {/* Top Projects */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <FolderGit2 className="w-4 h-4 text-slate-400" /> Top Projects
                      </h3>
                      {projects.length > 3 && (
                        <button onClick={() => setActiveTab('projects')} className="text-[10px] font-extrabold text-[#65A30D] uppercase tracking-widest hover:underline">
                          View All
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {projects.slice(0, 3).map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 flex-shrink-0">
                              {project.language?.slice(0, 2).toUpperCase() || 'PR'}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{project.name}</h4>
                              {project.description && <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">{project.description}</p>}
                              <div className="flex items-center gap-3 mt-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {project.language && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm bg-blue-500" />{project.language}</span>}
                                <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-slate-300" /> {formatNumber(project.stars)}</span>
                                <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {formatNumber(project.forks)}</span>
                              </div>
                            </div>
                          </div>
                          {project.auraContribution && <CircularProgress value={project.auraContribution} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contribution Heatmap */}
                  {githubStats?.submissionCalendar && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-400" /> Contribution Activity
                      </h3>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-md">
                        <ContributionHeatmap data={githubStats.submissionCalendar} type="github" />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* SKILLS */}
              {activeTab === 'skills' && (
                <motion.div key="skills" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-6 pb-4 border-b border-slate-100">All Verified Skills</h3>
                    {skills.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {skills.map((skill, i) => {
                          const score = skill.verifiedScore || skill.score || 0
                          return (
                            <div key={i} className="relative bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center border", skill.isVerified ? "bg-[#ADFF2F]/10 border-[#ADFF2F]/30" : "bg-slate-50 border-slate-200")}>
                                    {skill.isVerified ? <CheckCircle2 className="w-4 h-4 text-[#65A30D]" /> : <Code className="w-4 h-4 text-slate-400" />}
                                  </div>
                                  <div>
                                    <div className="text-xs font-extrabold text-slate-900">{skill.name}</div>
                                    <div className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: skill.isVerified ? '#65A30D' : '#94A3B8' }}>
                                      {skill.isVerified ? 'Verified' : skill.category || 'Unverified'}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-sm font-black text-slate-900">{score}%</div>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full transition-all duration-500", skill.isVerified ? "bg-[#ADFF2F]" : "bg-slate-300")} style={{ width: `${score}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium text-center py-8">No verified skills yet.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* PROJECTS */}
              {activeTab === 'projects' && (
                <motion.div key="projects" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg p-5 shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group flex flex-col">
                      <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
                        <div className="pr-4">
                          <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">{project.repoName || project.name}</h3>
                          {project.language && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="w-1.5 h-1.5 rounded-sm bg-blue-500" />
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{project.language}</span>
                            </div>
                          )}
                        </div>
                        {project.auraContribution && (
                          <div className="shrink-0 bg-slate-50 border border-slate-100 rounded-md p-1">
                            <CircularProgress value={project.auraContribution} size={36} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-4 flex-1">{project.description || 'No description.'}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Star className="w-3 h-3 fill-slate-300" /> {formatNumber(project.stars)}</span>
                          <span className="flex items-center gap-1.5"><GitFork className="w-3 h-3" /> {formatNumber(project.forks)}</span>
                        </div>
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-extrabold text-[#65A30D] uppercase tracking-widest flex items-center gap-1 hover:underline">
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <FolderGit2 className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No projects found</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* GITHUB */}
              {activeTab === 'github' && (
                <motion.div key="github" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  {/* GitHub Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Repos', value: user.publicRepos || 0, icon: FolderGit2, color: 'text-blue-500' },
                      { label: 'Followers', value: user.followers || 0, icon: Users, color: 'text-purple-500' },
                      { label: 'Following', value: user.following || 0, icon: Users, color: 'text-orange-500' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <stat.icon className={cn("w-4 h-4", stat.color)} />
                          <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-black text-slate-900">{formatNumber(stat.value)}</div>
                      </div>
                    ))}
                  </div>

                  {/* GitHub Profile Link */}
                  {user.githubUsername && (
                    <div className="bg-[#0A0A0A] rounded-lg p-5 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                          <Github className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-white">@{user.githubUsername}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GitHub Profile</div>
                        </div>
                      </div>
                      <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-md bg-white/10 text-white text-[10px] font-extrabold uppercase tracking-widest hover:bg-white/20 transition-colors flex items-center gap-1.5">
                        <ExternalLink className="w-3 h-3" /> View
                      </a>
                    </div>
                  )}

                  {/* Heatmap */}
                  {githubStats?.submissionCalendar ? (
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" /> Contribution Heatmap
                      </h3>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-md">
                        <ContributionHeatmap data={githubStats.submissionCalendar} type="github" />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200 text-center">
                      <Github className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No contribution data available</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* LEETCODE */}
              {activeTab === 'leetcode' && leetcodeStats && (
                <motion.div key="leetcode" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
                      <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Total Solved</div>
                      <div className="text-3xl font-black text-slate-900">{leetcodeStats.totalSolved}</div>
                    </div>
                    <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
                      <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Ranking</div>
                      <div className="text-3xl font-black text-slate-900">#{formatNumber(leetcodeStats.ranking)}</div>
                    </div>
                  </div>
                  {leetcodeStats.submissionCalendar && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#65A30D]" /> Submission Activity
                      </h3>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-md">
                        <ContributionHeatmap data={leetcodeStats.submissionCalendar} type="leetcode" />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* SIDEBAR (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Aura Breakdown */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Aura Analysis
                </h3>
                <div className="px-2 py-0.5 bg-[#ADFF2F]/10 border border-[#ADFF2F]/20 rounded-sm text-[9px] font-extrabold text-[#65A30D] uppercase tracking-widest">
                  Verified
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="text-5xl font-black text-slate-900 mb-1">{formatNumber(user.auraScore)}</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Aura Points</div>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'profile', value: 15, color: 'bg-[#ADFF2F]' },
                  { key: 'projects', value: 35, color: 'bg-[#A78BFA]' },
                  { key: 'skills', value: 30, color: 'bg-[#38BDF8]' },
                  { key: 'activity', value: 10, color: 'bg-[#F97316]' },
                  { key: 'github', value: 10, color: 'bg-[#F472B6]' },
                ].map(({ key, value, color }) => (
                  <div key={key}>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{key}</span>
                      <span className="text-[10px] font-black text-slate-900">{value} PTS</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-sm overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1 }} className={cn("h-full rounded-sm", color)} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 p-3 rounded-md border border-slate-200/50">
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Trend</div>
                <div className="flex items-center gap-1.5 text-[#65A30D] font-black text-xs">
                  <TrendingUp className="w-3.5 h-3.5" /> Rising
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-4 pb-3 border-b border-slate-100">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Projects</span>
                  <span className="text-sm font-black text-slate-900">{projects.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Skills</span>
                  <span className="text-sm font-black text-slate-900">{skills.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Stars</span>
                  <span className="text-sm font-black text-slate-900">{formatNumber(projects.reduce((sum, p) => sum + p.stars, 0))}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 text-center">
              <div className="w-10 h-10 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/20 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5 text-[#A78BFA]" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-1">Want a profile like this?</h3>
              <a href="/" className="text-[10px] font-extrabold text-[#65A30D] uppercase tracking-widest hover:underline">Get Verified &rarr;</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
