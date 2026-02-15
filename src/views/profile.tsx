"use client"

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useUserStore } from '@/store/user-store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { get, post, put, del } from '@/api/client'
import { addManualSkill, getLeetcodeStats, getGithubStats } from '@/api/services/user.service'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  getInitials,
  formatNumber,
  cn
} from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { VerifiedSkill, LeetcodeStats } from '@/types'
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
  Calendar,
  Star,
  GitFork,
  Edit3,
  Plus,
  Briefcase,
  Trash2,
  Play,
  Terminal,
  Activity,
  CheckSquare,
  Square,
  FolderGit2,
  ShieldCheck,
  Target,
  Code2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- Types ---
interface Experience {
  id: string
  type: 'WORK' | 'EDUCATION' | 'CERTIFICATION' | 'VOLUNTEER'
  title: string
  organization: string
  startDate: string
  endDate?: string
  description?: string
  isCurrent: boolean
}

// --- Components ---

// Sharp Circular Progress
function CircularProgress({ value, size = 56, strokeWidth = 4 }: { value: number; size?: number, strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#F1F5F9" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#84CC16" strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-black text-slate-900">{Math.round(value)}</span>
      </div>
    </div>
  )
}

// Engineered Heatmap
function ContributionHeatmap({ data, type }: { data: Record<string, number>; type: 'github' | 'leetcode' }) {
  const entries = Object.entries(data || {}).slice(-365)
  const maxValue = Math.max(...Object.values(data || {}), 1)
  
  const getColor = (value: number) => {
    if (value === 0) return 'bg-slate-100' 
    const intensity = value / maxValue
    
    if (type === 'github') {
      if (intensity > 0.75) return 'bg-purple-600'
      if (intensity > 0.5) return 'bg-purple-500'
      if (intensity > 0.25) return 'bg-purple-400'
      return 'bg-purple-200'
    } else {
      if (intensity > 0.75) return 'bg-[#4D7C0F]' 
      if (intensity > 0.5) return 'bg-[#65A30D]'  
      if (intensity > 0.25) return 'bg-[#84CC16]' 
      return 'bg-[#D9F99D]' 
    }
  }

  if (entries.length === 0) {
    return (
      <div className="flex gap-1 overflow-hidden opacity-40">
        {Array.from({ length: 52 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="w-2.5 h-2.5 rounded-[2px] bg-slate-200" />
            ))}
          </div>
        ))}
      </div>
    )
  }

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
    <div className="overflow-x-auto scrollbar-none">
      <div className="inline-flex gap-1 p-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map(([date, value]) => (
              <div
                key={date}
                className={`w-2.5 h-2.5 rounded-[2px] ${getColor(value)} transition-colors hover:ring-2 hover:ring-slate-400 hover:ring-offset-1`}
                title={`${date}: ${value} contributions`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Profile() {
  const { user } = useAuthStore()
  const { aura, projects, fetchAura, fetchGitHubRepos, fetchProjects } = useUserStore()

  const [skills, setSkills] = useState<VerifiedSkill[]>([])
  const [experiences, setExperiences] = useState<{ work: Experience[], education: Experience[], certifications: Experience[] }>({ work: [], education: [], certifications: [] })
  const [, setLeetcodeStats] = useState<LeetcodeStats | null>(null)
  const [githubStats, setGithubStats] = useState<{ username: string, submissionCalendar: Record<string, number> } | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const [, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', bio: '', location: '', company: '', website: '' })
  const [isSaving, setIsSaving] = useState(false)

  const [isExpDialogOpen, setIsExpDialogOpen] = useState(false)
  const [expForm, setExpForm] = useState<Partial<Experience>>({ type: 'WORK', isCurrent: false })

  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)
  const [claimForm, setClaimForm] = useState({ name: '', evidence: '', description: '' })
  const [isClaiming, setIsClaiming] = useState(false)

  useEffect(() => {
    fetchAura()
    fetchGitHubRepos()
    fetchProjects()
    fetchSkills()
    fetchExperience()
    fetchLeetCode()
    fetchGitHubStats()
  }, [fetchAura, fetchGitHubRepos, fetchProjects])

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        company: user.company || '',
        website: user.website || user.blog || '',
      })
    }
  }, [user])

  const fetchSkills = async () => { try { setSkills((await get<VerifiedSkill[]>('/v1/users/me/skills')) || []) } catch (e) { console.error(e) } }
  const fetchExperience = async () => { try { setExperiences(await get('/v1/experiences')) } catch (e) { console.error(e) } }
  const fetchLeetCode = async () => { try { setLeetcodeStats(await getLeetcodeStats()) } catch (e) {} }
  const fetchGitHubStats = async () => { try { setGithubStats(await getGithubStats()) } catch (e) {} }

  if (!user) return null

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await put('/v1/users/me', editForm)
      setIsEditDialogOpen(false)
      const { checkAuth } = useAuthStore.getState()
      await checkAuth()
      await fetchAura()
      toast({ title: 'Profile Updated', description: 'Changes saved successfully.' })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e?.response?.data?.message || 'Failed to update' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveExperience = async () => {
    setIsSaving(true)
    try {
      await post('/v1/experiences', expForm)
      toast({ title: 'Experience added!' })
      setIsExpDialogOpen(false)
      setExpForm({ type: 'WORK', isCurrent: false })
      fetchExperience()
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save experience.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleClaimSkill = async () => {
    setIsClaiming(true)
    try {
      await addManualSkill(claimForm)
      toast({ title: 'Skill Claimed! 📝', description: 'Added for verification.' })
      setIsClaimDialogOpen(false)
      setClaimForm({ name: '', evidence: '', description: '' })
      fetchSkills()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e?.response?.data?.message || 'Failed to claim.' })
    } finally {
      setIsClaiming(false)
    }
  }

  const breakdown = aura?.breakdown || { profile: 15, projects: 35, skills: 30, activity: 10, github: 10 }
  const TABS = ['overview', 'skills', 'projects', 'github', 'experience']

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-['Plus_Jakarta_Sans'] pb-20 relative">
      {/* Subtle Data Grid Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>

      <div className="w-full max-w-[1536px] mx-auto px-4 md:px-6 lg:px-8 py-8 relative z-10">
        
        {/* ========================================= */}
        {/* COMMAND CENTER HERO (Sharp & Dark)        */}
        {/* ========================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-[#0A0A0A] rounded-xl p-8 lg:p-10 shadow-xl border border-slate-800 relative overflow-hidden mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8"
        >
             {/* Architectural Accent Glows */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-[#ADFF2F]/10 rounded-full blur-[80px] pointer-events-none" />
             <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />
             
             {/* Left: Identity */}
             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                <div className="relative">
                   <Avatar className="w-24 h-24 lg:w-28 lg:h-28 rounded-xl border border-slate-700 shadow-xl bg-slate-900">
                      <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover rounded-xl" />
                      <AvatarFallback className="text-3xl bg-slate-800 text-white rounded-xl font-black">
                         {getInitials(user.name)}
                      </AvatarFallback>
                   </Avatar>
                   {user.isVerified && (
                      <div className="absolute -bottom-2 -right-2 p-1.5 rounded-md bg-slate-900 border border-slate-700 shadow-md">
                         <ShieldCheck className="w-5 h-5 text-[#84CC16]" />
                      </div>
                   )}
                </div>

                <div className="space-y-3">
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                         <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">{user.name}</h1>
                         <Button onClick={() => setIsEditDialogOpen(true)} variant="ghost" size="icon" className="h-7 w-7 rounded-sm text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                           <Edit3 className="w-3.5 h-3.5" />
                         </Button>
                      </div>
                      <p className="text-sm font-bold text-slate-400 font-mono tracking-wide">@{user.username}</p>
                   </div>

                   <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {user.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {user.location}</span>}
                      {user.company && <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-slate-500" /> {user.company}</span>}
                      {(user.website || user.blog) && (
                         <a href={user.website || user.blog} target="_blank" className="flex items-center gap-1.5 hover:text-[#ADFF2F] transition-colors">
                            <LinkIcon className="w-3.5 h-3.5 text-slate-500" /> Link
                         </a>
                      )}
                   </div>
                </div>
             </div>

             {/* Right: Sharp Aura Console */}
             <div className="flex gap-4 w-full lg:w-auto overflow-x-auto hide-scrollbar pb-2 lg:pb-0 relative z-10">
                <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col justify-center min-w-[140px] backdrop-blur-sm">
                   <div className="text-[9px] font-extrabold text-[#ADFF2F] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     <Zap className="w-3 h-3" /> Aura Score
                   </div>
                   <div className="text-4xl font-black text-white leading-none">{user.auraScore || 0}</div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col justify-center min-w-[120px] backdrop-blur-sm">
                   <div className="text-[9px] font-extrabold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     <Code2 className="w-3 h-3" /> Projects
                   </div>
                   <div className="text-3xl font-black text-white leading-none">{projects.length}</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col justify-center min-w-[120px] backdrop-blur-sm">
                   <div className="text-[9px] font-extrabold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     <Target className="w-3 h-3" /> Skills
                   </div>
                   <div className="text-3xl font-black text-white leading-none">{skills.length}</div>
                </div>
             </div>
        </motion.div>

        {/* ========================================= */}
        {/* SLEEK NAVIGATION TABS                     */}
        {/* ========================================= */}
        <div className="flex items-center border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-3 text-xs font-extrabold uppercase tracking-widest transition-all whitespace-nowrap border-b-2",
                  activeTab === tab 
                  ? "border-slate-900 text-slate-900" 
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                )}
             >
                {tab}
             </button>
          ))}
        </div>

        {/* ========================================= */}
        {/* DYNAMIC CONTENT AREA                      */}
        {/* ========================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* MAIN CONTENT (Col 8) */}
          <div className="lg:col-span-8 space-y-6">
             <AnimatePresence mode="wait">
               
               {activeTab === 'overview' && (
                 <motion.div key="overview" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="space-y-6">
                    {/* Bio Section */}
                    {user.bio && (
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                         <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">About</h3>
                         <p className="text-sm text-slate-600 leading-relaxed font-medium">{user.bio}</p>
                      </div>
                    )}

                    {/* Verified Stack */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                       <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                         <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-slate-400" /> Verified Stack
                         </h3>
                       </div>
                       <div className="flex flex-wrap gap-2.5">
                          {skills.slice(0, 15).map((skill, i) => (
                             <div key={i} className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md hover:border-slate-300 transition-colors">
                                <span className="text-[11px] font-extrabold text-slate-700">{skill.name}</span>
                                {skill.isVerified && (
                                   <span className="bg-white border border-slate-200 px-1 py-0.5 rounded-sm shadow-sm flex items-center">
                                      <CheckCircle2 className="w-3 h-3 text-[#65A30D]" />
                                   </span>
                                )}
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Activity Heatmap */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                       <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-slate-400" /> Contribution Velocity
                       </h3>
                       <div className="p-4 bg-slate-50 border border-slate-100 rounded-md">
                         <ContributionHeatmap data={githubStats?.submissionCalendar || (user as any).githubStats?.submissionCalendar || {}} type="github" />
                       </div>
                    </div>
                 </motion.div>
               )}

               {activeTab === 'projects' && (
                 <motion.div key="projects" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {projects.map((project, i) => (
                       <div key={project.id} className="bg-white rounded-lg p-5 shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group flex flex-col">
                          <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
                             <div className="pr-4">
                                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">{project.name}</h3>
                                {project.language && (
                                   <div className="flex items-center gap-1.5 mt-1">
                                      <span className="w-1.5 h-1.5 rounded-sm bg-blue-500" />
                                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{project.language}</span>
                                   </div>
                                )}
                             </div>
                             <div className="shrink-0 bg-slate-50 border border-slate-100 rounded-md p-1">
                                <CircularProgress value={project.auraContribution || 75} size={36} strokeWidth={3} />
                             </div>
                          </div>
                          <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-4 flex-1">
                            {project.description || 'No description provided.'}
                          </p>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-3 border-t border-slate-50">
                             <span className="flex items-center gap-1.5"><Star className="w-3 h-3 fill-slate-300" /> {formatNumber(project.stars)}</span>
                             <span className="flex items-center gap-1.5"><GitFork className="w-3 h-3" /> {formatNumber(project.forks)}</span>
                          </div>
                       </div>
                    ))}
                 </motion.div>
               )}

               {activeTab === 'skills' && (
                 <motion.div key="skills" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                       <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Skill Directory</h3>
                       <Button onClick={() => setIsClaimDialogOpen(true)} size="sm" className="h-8 text-xs font-bold rounded-md bg-slate-900 text-white hover:bg-slate-800">
                          <Plus className="w-3 h-3 mr-1.5" /> Claim Skill
                       </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {skills.map((skill, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all">
                             <div className="flex items-center gap-3">
                                <div className={cn("w-8 h-8 rounded-sm flex items-center justify-center border", skill.isVerified ? "bg-[#84CC16]/10 border-[#84CC16]/30 text-[#65A30D]" : "bg-white border-slate-200 text-slate-400")}>
                                   {skill.isVerified ? <CheckCircle2 className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                </div>
                                <div>
                                   <div className="text-xs font-extrabold text-slate-900">{skill.name}</div>
                                   <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{skill.category}</div>
                                </div>
                             </div>
                             <div className="text-sm font-black text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded-sm shadow-sm">{skill.verifiedScore || skill.score}%</div>
                          </div>
                       ))}
                    </div>
                 </motion.div>
               )}

               {activeTab === 'experience' && (
                 <motion.div key="experience" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                       <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Career Timeline</h3>
                       <Button onClick={() => setIsExpDialogOpen(true)} size="sm" variant="outline" className="h-8 text-xs font-bold rounded-md">
                          Add Role
                       </Button>
                    </div>
                    <div className="space-y-6">
                       {experiences.work.length === 0 ? (
                         <div className="text-center py-8 text-slate-500 text-xs font-bold">No timeline events added.</div>
                       ) : (
                         experiences.work.map(exp => (
                            <div key={exp.id} className="relative pl-6 border-l-2 border-slate-200 pb-2">
                               <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-sm bg-slate-900 ring-4 ring-white" />
                               <div className="flex justify-between items-start">
                                 <div>
                                    <h4 className="text-sm font-extrabold text-slate-900">{exp.title}</h4>
                                    <p className="text-xs font-bold text-blue-600 mt-0.5">{exp.organization}</p>
                                 </div>
                                 <button onClick={() => setExperiences(exp.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                   <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                               </div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{new Date(exp.startDate).getFullYear()} - {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}</p>
                               {exp.description && <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">{exp.description}</p>}
                            </div>
                         ))
                       )}
                    </div>
                 </motion.div>
               )}
               
             </AnimatePresence>
          </div>

          {/* RIGHT SIDEBAR (Col 4) - Analytics Panel */}
          <div className="lg:col-span-4 space-y-6">
             
             {/* AURA BREAKDOWN MODULE */}
             <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                   <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Pulse Diagnostics
                   </h3>
                   <div className="px-2 py-0.5 bg-slate-100 rounded-sm text-[9px] font-extrabold text-slate-600 uppercase tracking-widest border border-slate-200">
                      Top {aura?.percentile || 5}%
                   </div>
                </div>

                <div className="space-y-4">
                   {Object.entries(breakdown).map(([key, value]) => {
                      const total = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1
                      const percentage = Math.min(100, Math.round((value / total) * 100))
                      return (
                         <div key={key}>
                            <div className="flex justify-between items-end mb-1.5">
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{key}</span>
                               <span className="text-[10px] font-black text-slate-900">{value} PTS</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-sm overflow-hidden">
                               <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1 }}
                                  className="h-full bg-slate-800 rounded-sm"
                               />
                            </div>
                         </div>
                      )
                   })}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 p-3 rounded-md border border-slate-200/50">
                   <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Velocity</div>
                   <div className="flex items-center gap-1.5 text-[#65A30D] font-black text-xs">
                      <TrendingUp className="w-3.5 h-3.5" /> +12%
                   </div>
                </div>
             </div>

             {/* QUICK ACTIONS MODULE */}
             <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-4 pb-3 border-b border-slate-100">
                   Actions
                </h3>
                <div className="space-y-2">
                   <Button variant="outline" className="w-full justify-start text-xs font-bold h-9 bg-slate-50 border-slate-200" onClick={() => setIsEditDialogOpen(true)}>
                     <Edit3 className="w-3.5 h-3.5 mr-2" /> Edit Public Profile
                   </Button>
                   <Button variant="outline" className="w-full justify-start text-xs font-bold h-9 bg-slate-50 border-slate-200">
                     <ExternalLink className="w-3.5 h-3.5 mr-2" /> Share Profile Link
                   </Button>
                </div>
             </div>

          </div>
        </div>
      </div>
      
      {/* MODALS - Sleek Command Menu Style */}
      <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-xl border-slate-200 p-0 overflow-hidden bg-white">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Claim Verify Skill</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">Add manual skills pending code verification.</DialogDescription>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Skill Name</Label>
              <Input placeholder="e.g. React, Go, Docker" value={claimForm.name} onChange={e => setClaimForm({ ...claimForm, name: e.target.value })} className="h-9 text-sm rounded-md" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Evidence Link</Label>
              <Input placeholder="https://github.com/..." value={claimForm.evidence} onChange={e => setClaimForm({ ...claimForm, evidence: e.target.value })} className="h-9 text-sm rounded-md" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</Label>
              <Textarea placeholder="Context..." value={claimForm.description} onChange={e => setClaimForm({ ...claimForm, description: e.target.value })} className="text-sm rounded-md resize-none" rows={3} />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <Button onClick={handleClaimSkill} disabled={isClaiming || !claimForm.name} className="h-8 px-6 text-xs font-bold rounded-md bg-slate-900 hover:bg-slate-800 text-white">
              {isClaiming ? 'Claiming...' : 'Claim Skill'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isExpDialogOpen} onOpenChange={setIsExpDialogOpen}>
         <DialogContent className="sm:max-w-[500px] rounded-xl border-slate-200 p-0 overflow-hidden bg-white">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <DialogTitle className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Add Timeline Event</DialogTitle>
            </div>
            <div className="p-6 grid gap-4">
              <div className="space-y-2"><Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Role / Title</Label><Input value={expForm.title || ''} onChange={e => setExpForm({...expForm, title: e.target.value})} className="h-9 rounded-md" /></div>
              <div className="space-y-2"><Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Organization</Label><Input value={expForm.organization || ''} onChange={e => setExpForm({...expForm, organization: e.target.value})} className="h-9 rounded-md" /></div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Start Date</Label><Input type="date" value={expForm.startDate || ''} onChange={e => setExpForm({...expForm, startDate: e.target.value})} className="h-9 rounded-md" /></div>
                 <div className="space-y-2"><Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">End Date</Label><Input type="date" value={expForm.endDate || ''} onChange={e => setExpForm({...expForm, endDate: e.target.value})} className="h-9 rounded-md" /></div>
              </div>
              <div className="space-y-2"><Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</Label><Textarea value={expForm.description || ''} onChange={e => setExpForm({...expForm, description: e.target.value})} className="rounded-md resize-none" rows={3} /></div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button onClick={handleSaveExperience} disabled={isSaving} className="h-8 px-6 text-xs font-bold rounded-md bg-slate-900 hover:bg-slate-800 text-white">Save Event</Button>
            </div>
         </DialogContent>
      </Dialog>

    </div>
  )
}