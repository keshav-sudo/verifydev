"use client"

/**
 * ANTI-GRAVITY DEVELOPER PROFILE COMPONENT
 * 
 * Design DNA: Premium Flux Design System
 * Typography: Plus Jakarta Sans (strict)
 * Geometry: Extreme rounding (32px cards, full badges)
 * Theme: Hybrid Dark (#1A1A1A) / Light (#F8F9FA)
 * Accents: Neon Lime (#ADFF2F) + Soft Purple (#A78BFA)
 * 
 * Created by: Ex-Vercel/Stripe Design Team
 */

import { motion } from 'framer-motion'
import { 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Code, 
  Zap,
  Activity,
  GitBranch,
  Star,
  GitFork,
  MapPin,
  Building,
  Link as LinkIcon,
  Github,
  Calendar,
  Target,
  Layers
} from 'lucide-react'

// ============================================
// TYPE DEFINITIONS
// ============================================

interface AntiGravityProfileProps {
  data: ProfileData
}

export interface ProfileData {
  // Hero Stats
  aura: {
    total: number
    level: string
    trend: 'up' | 'down' | 'stable'
    percentile: number
    breakdown: {
      profile: number
      projects: number
      skills: number
      activity: number
      github: number
    }
    breakdownDetails?: {
      profile: BreakdownDetail[]
      projects: BreakdownDetail[]
      skills: BreakdownDetail[]
      activity: BreakdownDetail[]
      github: BreakdownDetail[]
    }
  }
  
  // Profile Info
  profile: {
    name: string
    username: string
    avatarUrl: string
    bio?: string
    location?: string
    company?: string
    website?: string
    githubUsername?: string
  }
  
  // Stats
  stats: {
    projects: number
    skills: number
    followers: number
    publicRepos: number
  }
  
  // Skills Array
  skills: Skill[]
  
  // Projects
  projects: ProjectItem[]
  
  // GitHub/LeetCode Calendar
  githubCalendar?: Record<string, number>
  leetcodeCalendar?: Record<string, number>
}

export interface BreakdownDetail {
  label: string
  points: number
  earned: boolean
  reason: string
}

export interface Skill {
  name: string
  category: string
  isVerified: boolean
  score?: number
  verifiedScore?: number
}

export interface ProjectItem {
  id: string
  name: string
  description?: string
  language?: string
  stars: number
  forks: number
  url?: string
  auraContribution?: number
}

// ============================================
// UTILITY COMPONENTS
// ============================================

// Circular Progress Ring for Stats
function CircularProgress({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const percentage = Math.min((value / max) * 100, 100)
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (percentage / 100) * circumference
  
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#1A1A1A]">{value}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-[#64748B]">{label}</span>
    </div>
  )
}

// Contribution Heatmap with Flux Colors
function ContributionHeatmap({ 
  data, 
  type 
}: { 
  data: Record<string, number>
  type: 'github' | 'leetcode' 
}) {
  const entries = Object.entries(data || {}).slice(-364)
  const maxValue = Math.max(...Object.values(data || {}), 1)
  
  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-100/50'
    const intensity = value / maxValue
    
    if (type === 'github') {
      // Soft Purple gradients
      if (intensity > 0.75) return 'bg-[#7C3AED]'
      if (intensity > 0.5) return 'bg-[#8B5CF6]'
      if (intensity > 0.25) return 'bg-[#A78BFA]'
      return 'bg-[#DDD6FE]'
    } else {
      // Neon Lime gradients
      if (intensity > 0.75) return 'bg-[#65A30D]'
      if (intensity > 0.5) return 'bg-[#84CC16]'
      if (intensity > 0.25) return 'bg-[#ADFF2F]'
      return 'bg-[#ECFCCB]'
    }
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
    <div className="overflow-x-auto scrollbar-hide">
      <div className="inline-flex gap-[3px] min-w-full">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {week.map(([date, value]) => (
              <div
                key={date}
                className={`w-[11px] h-[11px] rounded-[3px] ${getColor(value)} transition-all duration-300 hover:scale-125`}
                title={`${date}: ${value} ${type === 'github' ? 'contributions' : 'submissions'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Skill Pill Component
function SkillPill({ skill }: { skill: Skill }) {
  const categoryColors: Record<string, string> = {
    LANGUAGE: 'bg-lime-50 text-lime-700 border-lime-200',
    FRAMEWORK: 'bg-purple-50 text-purple-700 border-purple-200',
    DATABASE: 'bg-blue-50 text-blue-700 border-blue-200',
    DEVOPS: 'bg-orange-50 text-orange-700 border-orange-200',
    TOOL: 'bg-teal-50 text-teal-700 border-teal-200',
  }
  
  const colorClass = categoryColors[skill.category] || 'bg-gray-50 text-gray-700 border-gray-200'
  
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5 rounded-full border
        ${colorClass} font-medium text-sm
        transition-all duration-300
        backdrop-blur-sm
      `}
      style={{
        boxShadow: skill.isVerified ? '0 0 12px rgba(173, 255, 47, 0.15)' : 'none'
      }}
    >
      <span>{skill.name}</span>
      {skill.isVerified && (
        <CheckCircle2 className="w-4 h-4 text-[#ADFF2F]" strokeWidth={2.5} />
      )}
      {skill.verifiedScore && (
        <span className="text-xs font-bold opacity-70">{skill.verifiedScore}</span>
      )}
    </motion.div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AntiGravityProfile({ data }: AntiGravityProfileProps) {
  const { aura, profile, stats, skills, projects, githubCalendar, leetcodeCalendar } = data

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-['Plus_Jakarta_Sans'] antialiased">
      {/* FLUID CONTAINER */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* HERO STATS ROW - Top Stats with Circular Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {/* Aura Score Card */}
          <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF2F]/5 to-transparent" />
            <div className="relative z-10 flex flex-col items-center">
              <CircularProgress 
                value={aura.total} 
                max={600} 
                label="Aura Score"
                color="#ADFF2F"
              />
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ADFF2F]/10 border border-[#ADFF2F]/20">
                <TrendingUp className="w-3.5 h-3.5 text-[#ADFF2F]" />
                <span className="text-xs font-bold text-[#1A1A1A]">{aura.level}</span>
              </div>
            </div>
          </div>

          {/* Projects Card */}
          <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <CircularProgress 
              value={stats.projects} 
              max={10} 
              label="Projects"
              color="#A78BFA"
            />
            <p className="text-xs text-[#64748B] mt-2">Analyzed & Verified</p>
          </div>

          {/* Skills Card */}
          <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <CircularProgress 
              value={stats.skills} 
              max={100} 
              label="Skills"
              color="#ADFF2F"
            />
            <p className="text-xs text-[#64748B] mt-2">Verified Skills</p>
          </div>

          {/* GitHub Stats Card */}
          <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <CircularProgress 
              value={stats.publicRepos} 
              max={50} 
              label="Repositories"
              color="#A78BFA"
            />
            <p className="text-xs text-[#64748B] mt-2">Public Repos</p>
          </div>
        </motion.div>

        {/* MAIN GRID - 12 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN - Profile Card (Dark Theme) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4"
          >
            <div className="bg-[#1A1A1A] rounded-[32px] p-8 shadow-lg sticky top-6">
              {/* Avatar with Glow */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ADFF2F] to-[#A78BFA] blur-xl opacity-30" />
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="relative w-32 h-32 rounded-full border-4 border-white/10 object-cover"
                  />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#ADFF2F] rounded-full flex items-center justify-center border-4 border-[#1A1A1A]">
                    <Sparkles className="w-5 h-5 text-[#1A1A1A]" />
                  </div>
                </div>
              </div>

              {/* Name & Username */}
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-white mb-1">{profile.name}</h1>
                <p className="text-[#A78BFA] font-medium">@{profile.username}</p>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-300 text-sm leading-relaxed mb-6 text-center">
                  {profile.bio}
                </p>
              )}

              {/* Meta Info */}
              <div className="space-y-3 mb-6">
                {profile.location && (
                  <div className="flex items-center gap-3 text-gray-300 text-sm">
                    <MapPin className="w-4 h-4 text-[#A78BFA]" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.company && (
                  <div className="flex items-center gap-3 text-gray-300 text-sm">
                    <Building className="w-4 h-4 text-[#A78BFA]" />
                    <span>{profile.company}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-3 text-gray-300 text-sm">
                    <LinkIcon className="w-4 h-4 text-[#A78BFA]" />
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-[#ADFF2F] transition-colors"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {profile.githubUsername && (
                  <div className="flex items-center gap-3 text-gray-300 text-sm">
                    <Github className="w-4 h-4 text-[#A78BFA]" />
                    <a 
                      href={`https://github.com/${profile.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#ADFF2F] transition-colors"
                    >
                      github.com/{profile.githubUsername}
                    </a>
                  </div>
                )}
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.followers}</div>
                  <div className="text-xs text-gray-400 mt-1">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.projects}</div>
                  <div className="text-xs text-gray-400 mt-1">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.skills}</div>
                  <div className="text-xs text-gray-400 mt-1">Skills</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN - Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* AURA BREAKDOWN CARD - CENTERPIECE (Dark Theme) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#1A1A1A] rounded-[32px] p-8 shadow-lg"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Award className="w-7 h-7 text-[#ADFF2F]" />
                    Aura Breakdown
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Top {aura.percentile}% · {aura.total} Total Points
                  </p>
                </div>
                <div className="px-4 py-2 rounded-full bg-[#ADFF2F]/10 border border-[#ADFF2F]/20">
                  <span className="text-sm font-bold text-[#ADFF2F]">{aura.level}</span>
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="space-y-5">
                {Object.entries(aura.breakdown).map(([key, value], index) => {
                  const icons: Record<string, any> = {
                    profile: CheckCircle2,
                    projects: Code,
                    skills: Zap,
                    activity: Activity,
                    github: GitBranch
                  }
                  const Icon = icons[key]
                  const maxValues: Record<string, number> = {
                    profile: 60,
                    projects: 200,
                    skills: 150,
                    activity: 100,
                    github: 100
                  }
                  const max = maxValues[key]
                  const percentage = Math.min((value / max) * 100, 100)
                  
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-[#A78BFA]" />
                          <span className="text-sm font-semibold text-white capitalize">{key}</span>
                        </div>
                        <span className="text-sm font-bold text-[#ADFF2F]">
                          {value} / {max}
                        </span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full bg-gradient-to-r from-[#ADFF2F] to-[#84CC16] relative"
                          style={{
                            filter: 'drop-shadow(0 0 8px rgba(173, 255, 47, 0.4))',
                            opacity: 0.3 + (percentage / 100) * 0.7
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Breakdown Details (if available) */}
              {aura.breakdownDetails && (
                <div className="mt-8 pt-8 border-t border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Earn More Points</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(aura.breakdownDetails).map(([category, details]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider mb-2">
                          {category}
                        </h4>
                        {details.slice(0, 3).map((detail: BreakdownDetail, idx: number) => (
                          <div 
                            key={idx}
                            className={`text-xs p-2 rounded-lg ${
                              detail.earned 
                                ? 'bg-[#ADFF2F]/5 text-gray-300' 
                                : 'bg-white/5 text-gray-500'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{detail.label}</span>
                              <span className="text-[#ADFF2F] font-bold">+{detail.points}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* SKILLS CLOUD - Premium Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-[#ADFF2F]" />
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Verified Skills</h2>
                <span className="ml-auto text-sm font-bold text-[#64748B]">
                  {skills.filter(s => s.isVerified).length} / {skills.length}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <SkillPill key={index} skill={skill} />
                ))}
              </div>
            </motion.div>

            {/* GITHUB HEATMAP */}
            {githubCalendar && Object.keys(githubCalendar).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <GitBranch className="w-6 h-6 text-[#A78BFA]" />
                  <h2 className="text-2xl font-bold text-[#1A1A1A]">GitHub Activity</h2>
                  <span className="ml-auto text-sm font-medium text-[#64748B]">Last 365 days</span>
                </div>
                
                <ContributionHeatmap data={githubCalendar} type="github" />
              </motion.div>
            )}

            {/* LEETCODE HEATMAP */}
            {leetcodeCalendar && Object.keys(leetcodeCalendar).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-6 h-6 text-[#ADFF2F]" />
                  <h2 className="text-2xl font-bold text-[#1A1A1A]">LeetCode Activity</h2>
                  <span className="ml-auto text-sm font-medium text-[#64748B]">Last 365 days</span>
                </div>
                
                <ContributionHeatmap data={leetcodeCalendar} type="leetcode" />
              </motion.div>
            )}

            {/* TOP PROJECTS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <Code className="w-6 h-6 text-[#A78BFA]" />
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Top Projects</h2>
              </div>
              
              <div className="space-y-4">
                {projects.slice(0, 5).map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    className="group p-5 rounded-[24px] bg-white border border-gray-100 hover:border-[#A78BFA]/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#A78BFA] transition-colors">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-[#64748B] mt-1 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </div>
                      {project.auraContribution && (
                        <div className="ml-4 px-3 py-1.5 rounded-full bg-[#ADFF2F]/10 border border-[#ADFF2F]/20">
                          <span className="text-xs font-bold text-[#1A1A1A]">
                            +{project.auraContribution}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-[#64748B]">
                      {project.language && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-[#A78BFA]" />
                          <span>{project.language}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4" />
                        <span>{project.stars}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <GitFork className="w-4 h-4" />
                        <span>{project.forks}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
