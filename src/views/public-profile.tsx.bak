"use client"

/**
 * Public Developer Profile - PREMIUM FLUX DESIGN SYSTEM
 * Ultra-polished, fluid responsive grid with specific brand accents
 */

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { get } from '@/api/client'
import {
  getInitials,
  formatNumber,
} from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
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
  Award,
  Target,
  Activity,
  Calendar,
  Star,
  GitFork,
  Loader2,
  Users,
  FolderGit2
} from 'lucide-react'

// --- Types ---

interface PublicUser {
  id: string
  name: string
  username: string
  avatarUrl: string
  bio?: string
  location?: string
  company?: string
  website?: string
  tags?: string[]
  auraScore: number
  followers: number
  following: number
  publicRepos: number
  githubUsername?: string
  createdAt: string
  skills?: VerifiedSkill[]
  projects?: Project[]
}

interface VerifiedSkill {
  name: string
  category: string
  isVerified: boolean
  score?: number
  verifiedScore?: number
}

interface Project {
  id: string
  name: string
  repoName?: string
  description?: string
  language?: string
  stars: number
  forks: number
  auraContribution?: number
  url?: string
}

interface AuraBreakdown {
  profile: number
  projects: number
  skills: number
  activity: number
  github: number
}

// --- Components ---

// Skill category colors
const skillCategoryColors: Record<string, { bg: string; text: string; border: string }> = {
  LANGUAGE: { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  FRAMEWORK: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  DATABASE: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  DEVOPS: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  TOOL: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
}

// Heatmap Component
function ContributionHeatmap({ data, type }: { data: Record<string, number>; type: 'github' | 'leetcode' }) {
  const entries = Object.entries(data || {}).slice(-365) // Last year
  const maxValue = Math.max(...Object.values(data || {}), 1)
  
  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-100'
    const intensity = value / maxValue
    if (type === 'github') {
      if (intensity > 0.75) return 'bg-purple-600'
      if (intensity > 0.5) return 'bg-purple-400'
      if (intensity > 0.25) return 'bg-purple-300'
      return 'bg-purple-200'
    } else {
      if (intensity > 0.75) return 'bg-lime-600'
      if (intensity > 0.5) return 'bg-lime-400'
      if (intensity > 0.25) return 'bg-lime-300'
      return 'bg-lime-200'
    }
  }

  // If no data, show placeholder pattern
  if (entries.length === 0) {
    return (
      <div className="flex gap-1 overflow-hidden opacity-50">
        {Array.from({ length: 52 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="w-3 h-3 rounded-sm bg-gray-100" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Group by weeks
  const weeks: Array<Array<[string, number]>> = []
  let currentWeek: Array<[string, number]> = []
  
  entries.forEach((entry, index) => {
    currentWeek.push(entry)
    if ((index + 1) % 7 === 0 || index === entries.length - 1) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map(([date, value]) => (
              <div
                key={date}
                className={`w-3 h-3 rounded-sm ${getColor(value)} transition-all`}
                title={`${date}: ${value} contributions`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Circular Progress
function CircularProgress({ value, size = 60 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#ADFF2F" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-900">{Math.round(value)}</span>
      </div>
    </div>
  )
}

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>()
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch Public Profile (User, Skills, Projects)
  const { data: profileResponse, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['public-profile', username],
    queryFn: async () => {
      return get<{ profile: PublicUser }>(`/v1/u/${username}`)
    },
    enabled: !!username,
  })

  // Try to fetch detailed stats if available (might fail if not authorized/public)
  const { data: githubStats } = useQuery({
    queryKey: ['public-github', username],
    queryFn: async () => get<{ submissionCalendar: Record<string, number> }>(`/v1/u/${username}/github-stats`).catch(() => null),
    enabled: !!username,
  })

  const { data: leetcodeStats } = useQuery({
    queryKey: ['public-leetcode', username],
    queryFn: async () => get<{ 
      totalSolved: number
      ranking: number
      acceptanceRate: number
      submissionCalendar: Record<string, number>
    }>(`/v1/u/${username}/leetcode-stats`).catch(() => null),
    enabled: !!username,
  })

  // Loading State
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
          <p className="text-gray-500 font-medium font-['Plus_Jakarta_Sans']">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Not Found State
  if (!profileResponse?.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] font-['Plus_Jakarta_Sans']">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">User not found</h1>
          <p className="text-gray-500 mb-6">
            The user @{username} doesn't exist or has a private profile.
          </p>
          <a href="/" className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full font-semibold hover:bg-gray-900 transition-colors">
            Go back home
          </a>
        </div>
      </div>
    )
  }

  const user = profileResponse.profile
  const skills = user.skills || []
  const projects = user.projects || []

  // Mock Aura breakdown if not available
  const auraBreakdown: AuraBreakdown = {
    profile: 15,
    projects: 35,
    skills: 30,
    activity: 10,
    github: 10,
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-['Plus_Jakarta_Sans']">
      {/* FLUID CONTAINER */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[30px] p-6 sm:p-8 lg:p-10 shadow-sm border border-gray-100 mb-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 items-start">
            {/* Avatar */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <Avatar className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-[30px] border-4 border-white shadow-lg">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-[#ADFF2F] to-[#9FE62F] text-black rounded-[30px] font-black">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-white border-2 border-gray-100 shadow-md">
                  <Github className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="text-center lg:text-left">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 mb-3">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{user.name}</h1>
                {user.auraScore > 100 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white text-xs font-bold shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    Verified
                  </div>
                )}
              </div>
              <p className="text-lg text-gray-500 font-medium mb-4">@{user.username}</p>

              {/* Tags */}
              {user.tags && user.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-4">
                  {user.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold border border-purple-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {user.bio && (
                <p className="text-sm text-gray-600 max-w-2xl mb-4">{user.bio}</p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 justify-center lg:justify-start">
                {user.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {user.location}
                  </span>
                )}
                {user.company && (
                  <span className="flex items-center gap-1.5">
                    <Building className="w-4 h-4" />
                    {user.company}
                  </span>
                )}
                {user.website && (
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                    <LinkIcon className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>

            {/* Aura Score - Prominent Display */}
            <div className="flex justify-center lg:justify-end">
              <div className="text-center p-6 bg-gradient-to-br from-[#ADFF2F]/10 to-[#9FE62F]/10 rounded-[24px] border-2 border-[#ADFF2F]/30">
                <Zap className="w-8 h-8 text-[#ADFF2F] mx-auto mb-2" />
                <div className="text-4xl font-black text-gray-900 mb-1">{formatNumber(user.auraScore)}</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Aura Score</div>
                <div className="mt-2 text-xs font-bold text-[#ADFF2F]">Verified</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-black text-gray-900">{projects.length}</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-gray-900">{formatNumber(user.publicRepos)}</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Repos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-gray-900">{formatNumber(user.followers)}</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Followers</div>
            </div>
          </div>
        </motion.div>

        {/* PILL NAVIGATION TABS */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'skills', label: 'Skills' },
              { id: 'projects', label: 'Projects' },
              { id: 'github', label: 'GitHub' },
              ...(leetcodeStats ? [{ id: 'leetcode', label: 'LeetCode' }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#1A1A1A] text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="space-y-6">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Skills & Projects Preview */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Verified Skills Cloud */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[30px] p-6 sm:p-8 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                      <Code className="w-5 h-5 text-gray-700" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Verified Skills</h2>
                  </div>
                  
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {skills.slice(0, 15).map((skill, index) => {
                        const colors = skillCategoryColors[skill.category] || skillCategoryColors.TOOL
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full ${colors.bg} border ${colors.border} transition-all`}
                          >
                            <span className={`text-sm font-semibold ${colors.text}`}>{skill.name}</span>
                            {skill.isVerified && (
                              <CheckCircle2 className="w-4 h-4 text-[#ADFF2F]" />
                            )}
                            {(skill.score || skill.verifiedScore) && (
                              <>
                                <span className="w-px h-4 bg-gray-300" />
                                <span className="text-xs font-bold text-gray-700">
                                  {skill.verifiedScore || skill.score}%
                                </span>
                              </>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                     <div className="text-center py-8 text-gray-500">
                       No verified skills found.
                     </div>
                  )}
                </motion.div>

                {/* Top Projects Preview */}
                <div className="bg-white rounded-[30px] p-6 sm:p-8 shadow-sm border border-gray-100">
                   <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                         <FolderGit2 className="w-5 h-5 text-gray-700" />
                       </div>
                       <h2 className="text-xl font-bold text-gray-900">Top Projects</h2>
                     </div>
                     <button onClick={() => setActiveTab('projects')} className="text-sm font-semibold text-purple-600 hover:text-purple-700">
                       View All
                     </button>
                   </div>

                   <div className="grid gap-4">
                     {projects.slice(0, 3).map((project, index) => (
                       <motion.div
                         key={project.id}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: index * 0.1 }}
                         className="p-5 rounded-[24px] border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                       >
                         <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-700 bg-gray-100 shrink-0">
                                {project.language?.slice(0, 2).toUpperCase() || 'PR'}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 mb-1">{project.name}</h3>
                                {project.description && (
                                  <p className="text-sm text-gray-600 line-clamp-1 mb-2">{project.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1.5">
                                    <Star className="w-3.5 h-3.5" /> {formatNumber(project.stars)}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <GitFork className="w-3.5 h-3.5" /> {formatNumber(project.forks)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {project.auraContribution && (
                               <CircularProgress value={project.auraContribution} size={50} />
                            )}
                         </div>
                       </motion.div>
                     ))}
                   </div>
                </div>

              </div>

              {/* Right: PREMIUM DARK AURA CARD */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#1A1A1A] rounded-[30px] p-6 sm:p-8 shadow-lg border border-white/10 sticky top-8"
                >
                  <div className="text-center mb-6">
                    <Zap className="w-12 h-12 text-[#ADFF2F] mx-auto mb-4" />
                    <div className="text-6xl font-black text-white mb-2 tracking-tight">
                      {formatNumber(user.auraScore)}
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ADFF2F] to-[#9FE62F] text-black text-xs font-bold shadow-lg">
                      <Award className="w-3.5 h-3.5" />
                      verified
                    </div>
                    <p className="text-sm text-gray-400 mt-3 font-medium">Verified Aura Score</p>
                  </div>

                  {/* Score Breakdown - Neon Lime Bars */}
                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Score Breakdown</h3>
                    {Object.entries(auraBreakdown).map(([key, value], index) => {
                      const percentage = value // Using mock percentage for now
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400 font-medium capitalize">{key}</span>
                            <span className="text-white font-bold">~{percentage}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="h-full bg-gradient-to-r from-[#ADFF2F] to-[#9FE62F] rounded-full"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Trend */}
                  <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#ADFF2F]" />
                    <span className="text-sm text-gray-400">
                      Rising trend
                    </span>
                  </div>
                </motion.div>
                
                {/* Promo Card */}
                <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100 text-center">
                   <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                     <Sparkles className="w-6 h-6 text-purple-600" />
                   </div>
                   <h3 className="font-bold text-gray-900 mb-2">Want a profile like this?</h3>
                   <a href="/" className="text-sm font-semibold text-purple-600 hover:text-purple-700">Get Verified &rarr;</a>
                </div>
              </div>
            </div>
          )}
          
          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100">
               <h2 className="text-2xl font-bold text-gray-900 mb-6">All Verified Skills</h2>
                {skills.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skills.map((skill, index) => {
                    const colors = skillCategoryColors[skill.category] || skillCategoryColors.TOOL
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-[20px] ${colors.bg} border ${colors.border}`}
                      >
                        <div className="flex items-center gap-3">
                          {skill.isVerified && (
                            <CheckCircle2 className="w-5 h-5 text-[#ADFF2F]" />
                          )}
                          <div>
                            <div className={`font-semibold ${colors.text}`}>{skill.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{skill.category.toLowerCase()}</div>
                          </div>
                        </div>
                        {(skill.score || skill.verifiedScore) && (
                          <div className="text-lg font-bold text-gray-900">{skill.verifiedScore || skill.score}%</div>
                        )}
                      </div>
                    )
                  })}
                  </div>
                ) : (
                  <p className="text-gray-500">No verified skills yet.</p>
                )}
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1 truncate group-hover:text-purple-600 transition-colors">
                        {project.repoName || project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                      )}
                    </div>
                    {project.auraContribution && (
                        <CircularProgress value={project.auraContribution} size={50} />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {project.language && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#ADFF2F]" />
                        {project.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" />
                      {formatNumber(project.stars)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GitFork className="w-3.5 h-3.5" />
                      {formatNumber(project.forks)}
                    </span>
                  </div>

                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700"
                    >
                      View Repository <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* GITHUB TAB */}
          {activeTab === 'github' && (
            <div className="space-y-6">
               {githubStats ? (
                  <div className="bg-white rounded-[30px] p-6 sm:p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        Contribution Activity
                      </h3>
                      <a href={`https://github.com/${user.username}`} target="_blank" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" /> Open GitHub
                      </a>
                    </div>
                    <ContributionHeatmap data={githubStats.submissionCalendar} type="github" />
                  </div>
               ) : (
                  <div className="bg-white rounded-[30px] p-8 text-center border border-gray-100">
                    <Github className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900">No GitHub Data Available</h3>
                    <p className="text-gray-500">Detailed GitHub stats are unavailable for this profile.</p>
                  </div>
               )}
            </div>
          )}

          {/* LEETCODE TAB */}
          {activeTab === 'leetcode' && (
             <div className="space-y-6">
                {leetcodeStats ? (
                   <>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100">
                       <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Total Solved</div>
                       <div className="text-4xl font-black text-gray-900">{leetcodeStats.totalSolved}</div>
                     </div>
                     <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100">
                       <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Ranking</div>
                       <div className="text-4xl font-black text-gray-900">#{formatNumber(leetcodeStats.ranking)}</div>
                     </div>
                   </div>
                   <div className="bg-white rounded-[30px] p-6 sm:p-8 shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Activity className="w-5 h-5 text-lime-500" /> Submission Activity
                      </h3>
                      <ContributionHeatmap data={leetcodeStats.submissionCalendar} type="leetcode" />
                   </div>
                   </>
                ) : (
                   <div className="bg-white rounded-[30px] p-8 text-center border border-gray-100">
                    <Code className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900">No LeetCode Data Available</h3>
                    <p className="text-gray-500">Detailed LeetCode stats are unavailable for this profile.</p>
                  </div>
                )}
             </div>
          )}

        </div>
      </div>
    </div>
  )
}
