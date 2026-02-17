"use client"

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useUserStore } from '@/store/user-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/api/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Download,
  Eye,
  Loader2,
  Plus,
  Trash2,
  GraduationCap,
  Briefcase,
  Award,
  Code,
  MapPin,
  FileText,
  CheckCircle2,
  Settings2,
  Target,
  FolderGit2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface ResumeData {
  template: 'modern' | 'classic' | 'developer' | 'corporate'
  skills: Array<{
    name: string
    category: string
    verifiedScore: number
    projectCount: number
  }>
  projects: Array<{
    repoName: string
    description: string
    language: string
    technologies: string[]
    overallScore: number
    githubUrl: string
  }>
  experiences: Array<{
    id: string
    type: 'WORK' | 'EDUCATION' | 'CERTIFICATION'
    title: string
    organization: string
    location: string
    startDate: string
    endDate?: string
    isCurrent: boolean
    description: string
  }>
}

const templates = [
  { value: 'modern', label: 'Modern', description: 'Clean, contemporary design' },
  { value: 'classic', label: 'Classic', description: 'Professional, timeless style' },
  { value: 'developer', label: 'Developer', description: 'Tech-focused layout' },
  { value: 'corporate', label: 'Corporate', description: 'Traditional business format' },
]

const TABS = ['template', 'skills', 'projects', 'experience']

export default function Resume() {
  const { user } = useAuthStore()
  const { aura, fetchAura } = useUserStore()

  const [resumeData, setResumeData] = useState<ResumeData>({
    template: 'modern',
    skills: [],
    projects: [],
    experiences: [],
  })

  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set())
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('template')
  const [newExperience, setNewExperience] = useState({
    type: 'WORK' as const,
    title: '',
    organization: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  })
  const [isAddingExperience, setIsAddingExperience] = useState(false)

  useEffect(() => {
    const loadResumeData = async () => {
      try {
        const [skillsRes, projectsRes, experiencesRes] = await Promise.all([
          apiClient.get('/v1/users/me/skills'),
          apiClient.get('/v1/users/me/projects'),
          apiClient.get('/v1/experiences'),
          fetchAura(),
        ])

        const skillsData = skillsRes.data.data || []
        const projectsData = projectsRes.data.data?.projects || []
        const experiencesData = experiencesRes.data.data?.all || []

        fetchAura()



        setResumeData((prev) => ({
          ...prev,
          skills: skillsData,
          projects: projectsData.map((p: any) => ({
            repoName: p.repoName,
            description: p.description,
            language: p.language,
            technologies: p.technologies || [],
            overallScore: p.overallScore || 0,
            githubUrl: p.githubRepoUrl || p.url,
          })),
          experiences: experiencesData,
        }))

        const highConfidenceSkills = new Set<string>(
          skillsData.filter((s: any) => s.verifiedScore >= 70).map((s: any) => s.name as string)
        )
        setSelectedSkills(highConfidenceSkills)
        setSelectedProjects(new Set<string>(projectsData.map((p: any) => p.repoName as string)))
      } catch (error) {
        console.error('Failed to load resume data:', error)
        toast({ variant: 'destructive', title: 'Data Load Warning', description: 'Some profile data could not be loaded.' })
      } finally {
        setIsLoading(false)
      }
    }
    loadResumeData()
  }, [fetchAura])

  const toggleSkill = (skillName: string) => {
    const n = new Set(selectedSkills)
    n.has(skillName) ? n.delete(skillName) : n.add(skillName)
    setSelectedSkills(n)
  }

  const toggleProject = (projectName: string) => {
    const n = new Set(selectedProjects)
    n.has(projectName) ? n.delete(projectName) : n.add(projectName)
    setSelectedProjects(n)
  }

  const handleAddExperience = async () => {
    try {
      const response = await apiClient.post('/v1/experiences', {
        ...newExperience,
        endDate: newExperience.isCurrent ? null : newExperience.endDate,
      })
      setResumeData((prev) => ({ ...prev, experiences: [...prev.experiences, response.data.data?.experience] }))
      setNewExperience({ type: 'WORK', title: '', organization: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '' })
      setIsAddingExperience(false)
      toast({ title: 'Experience added successfully!' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to add experience' })
    }
  }

  const handleDeleteExperience = async (id: string) => {
    try {
      await apiClient.delete(`/v1/experiences/${id}`)
      setResumeData((prev) => ({ ...prev, experiences: prev.experiences.filter((exp) => exp.id !== id) }))
      toast({ title: 'Experience deleted' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to delete experience' })
    }
  }

  const handleGenerateResume = async () => {
    setIsGenerating(true)
    try {
      const selectedSkillsData = resumeData.skills.filter((s) => selectedSkills.has(s.name))
      const selectedProjectsData = resumeData.projects.filter((p) => selectedProjects.has(p.repoName))
      if (selectedSkillsData.length === 0 && selectedProjectsData.length === 0) {
        toast({ variant: 'destructive', title: 'No content selected', description: 'Please select at least one skill or project.' })
        return
      }
      const response = await apiClient.post('/v1/resumes/generate', {
        template: resumeData.template, skills: selectedSkillsData, projects: selectedProjectsData,
        experiences: resumeData.experiences.map((exp: any) => ({ company: exp.organization || exp.company, position: exp.title || exp.position, location: exp.location, startDate: exp.startDate, endDate: exp.endDate, isCurrent: exp.isCurrent, description: exp.description })),
        user: { id: user?.id, name: user?.name || user?.username, email: user?.email, username: user?.username, bio: user?.bio, location: user?.location, website: user?.website, avatarUrl: user?.avatarUrl, auraScore: aura?.total || 0, coreCount: user?.coreCount || 0 },
        auraSummary: { total: aura?.total || 0, level: aura?.level || 'novice', percentile: aura?.percentile || 0 },
      }, { responseType: 'blob', timeout: 60000 })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `resume-${user?.username || 'developer'}-${Date.now()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
      toast({ title: 'Resume generated!', description: 'Your premium resume is ready.' })
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Generation failed', description: 'Please try again.' })
    } finally { setIsGenerating(false) }
  }

  const handlePreviewResume = async () => {
    setIsPreviewing(true)
    try {
      const selectedSkillsData = resumeData.skills.filter((s) => selectedSkills.has(s.name))
      const selectedProjectsData = resumeData.projects.filter((p) => selectedProjects.has(p.repoName))
      const response = await apiClient.post('/v1/resumes/preview', {
        template: resumeData.template, skills: selectedSkillsData, projects: selectedProjectsData,
        experiences: resumeData.experiences.map((exp: any) => ({ company: exp.organization || exp.company, position: exp.title || exp.position, location: exp.location, startDate: exp.startDate, endDate: exp.endDate, isCurrent: exp.isCurrent, description: exp.description })),
        user: { id: user?.id, name: user?.name || user?.username, email: user?.email, username: user?.username, bio: user?.bio, location: user?.location, website: user?.website, avatarUrl: user?.avatarUrl, auraScore: aura?.total || 0, coreCount: user?.coreCount || 0 },
        auraSummary: { total: aura?.total || 0, level: aura?.level || 'novice', percentile: aura?.percentile || 0 },
      })
      const previewWindow = window.open('', '_blank')
      if (previewWindow) { previewWindow.document.write(response.data.data.html); previewWindow.document.close() }
      else toast({ title: 'Popup blocked', description: 'Please allow popups' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Preview failed' })
    } finally { setIsPreviewing(false) }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center font-['Plus_Jakarta_Sans']">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-slate-200 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 border-2 border-[#ADFF2F] border-t-transparent animate-spin rounded-lg"></div>
          </div>
          <p className="text-slate-500 text-[10px] font-extrabold tracking-widest animate-pulse uppercase">Loading Resume Builder...</p>
        </div>
      </div>
    )
  }

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
                  <FileText className="w-3 h-3" /> Resume Builder
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Build Your <span className="text-slate-400">Resume</span>
              </h1>
              <p className="text-sm text-slate-400 font-medium max-w-lg leading-relaxed">
                Create a professional resume powered by your verified skills and project analysis.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handlePreviewResume} disabled={isPreviewing} className="px-5 py-2.5 bg-white/10 text-white border border-white/10 rounded-lg text-xs font-extrabold uppercase tracking-widest hover:bg-white/20 transition-all">
                {isPreviewing ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Eye className="w-3 h-3 mr-2" />} Preview
              </Button>
              <Button onClick={handleGenerateResume} disabled={isGenerating} className="px-5 py-2.5 bg-[#ADFF2F] text-black rounded-lg text-xs font-extrabold uppercase tracking-widest hover:bg-[#9AE62A] transition-all shadow-[0_0_20px_rgba(173,255,47,0.2)]">
                {isGenerating ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Download className="w-3 h-3 mr-2" />} Download PDF
              </Button>
            </div>
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-[#ADFF2F]/10 rounded-md border border-[#ADFF2F]/20"><Settings2 className="w-3.5 h-3.5 text-[#65A30D]" /></div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Template</span>
            </div>
            <div className="text-lg font-black text-slate-900 capitalize">{resumeData.template}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-[#A78BFA]/10 rounded-md border border-[#A78BFA]/20"><Target className="w-3.5 h-3.5 text-purple-600" /></div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Skills</span>
            </div>
            <div className="text-lg font-black text-slate-900">{selectedSkills.size} <span className="text-xs font-bold text-slate-400">/ {resumeData.skills.length}</span></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-50 rounded-md border border-blue-100"><FolderGit2 className="w-3.5 h-3.5 text-blue-600" /></div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Projects</span>
            </div>
            <div className="text-lg font-black text-slate-900">{selectedProjects.size} <span className="text-xs font-bold text-slate-400">/ {resumeData.projects.length}</span></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-amber-50 rounded-md border border-amber-100"><Briefcase className="w-3.5 h-3.5 text-amber-600" /></div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Experience</span>
            </div>
            <div className="text-lg font-black text-slate-900">{resumeData.experiences.length}</div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center border-b border-slate-200 overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-6 py-3 text-xs font-extrabold uppercase tracking-widest transition-all whitespace-nowrap border-b-2", activeTab === tab ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300")}>
              {tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">

          {activeTab === 'template' && (
            <motion.div key="template" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((template) => (
                <div key={template.value} onClick={() => setResumeData({ ...resumeData, template: template.value as any })}
                  className={cn("relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all group hover:shadow-md", resumeData.template === template.value ? "border-[#ADFF2F] shadow-[0_0_20px_rgba(173,255,47,0.1)]" : "border-slate-200 hover:border-slate-300")}>
                  {resumeData.template === template.value && (
                    <div className="absolute top-3 right-3"><div className="w-6 h-6 rounded-full bg-[#ADFF2F] flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-black" /></div></div>
                  )}
                  <div className="h-32 bg-slate-50 rounded-lg border border-slate-100 mb-4 flex items-center justify-center overflow-hidden">
                    {template.value === 'modern' && (<div className="w-full h-full bg-slate-900 p-3 space-y-1.5"><div className="h-3 w-3/4 bg-[#ADFF2F]/40 rounded-sm" /><div className="h-2 w-1/2 bg-slate-700 rounded-sm" /><div className="flex gap-1 mt-2"><div className="h-1.5 w-1.5 rounded-full bg-[#ADFF2F]" /><div className="h-1.5 w-1.5 rounded-full bg-[#ADFF2F]" /></div><div className="grid grid-cols-2 gap-1 mt-2"><div className="h-3 bg-slate-800 rounded-sm" /><div className="h-3 bg-slate-800 rounded-sm" /></div></div>)}
                    {template.value === 'developer' && (<div className="w-full h-full bg-black p-3 font-mono text-[6px] text-green-500 space-y-0.5"><div>$ cat profile.json</div><div className="text-blue-400">{"{"}</div><div className="pl-1">&quot;name&quot;: &quot;USER&quot;,</div><div className="pl-1">&quot;aura&quot;: 1500</div><div className="text-blue-400">{"}"}</div></div>)}
                    {template.value === 'classic' && (<div className="w-full h-full bg-white p-3 space-y-2"><div className="h-2 w-1/2 bg-slate-900 mx-auto rounded-sm" /><div className="h-px bg-slate-300 w-full" /><div className="space-y-1"><div className="h-1 w-full bg-slate-200" /><div className="h-1 w-3/4 bg-slate-100" /></div></div>)}
                    {template.value === 'corporate' && (<div className="w-full h-full bg-slate-50 p-3 flex gap-2"><div className="w-1/3 h-full bg-slate-800 rounded-sm" /><div className="flex-1 space-y-2 pt-1"><div className="h-1.5 w-full bg-slate-300" /><div className="h-1 w-3/4 bg-slate-200" /></div></div>)}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-1">{template.label}</h3>
                  <p className="text-[10px] font-medium text-slate-500">{template.description}</p>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div key="skills" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2"><Target className="w-4 h-4 text-[#A78BFA]" /> Select Verified Skills</h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-sm uppercase tracking-widest">{selectedSkills.size} Selected</span>
                </div>
                <div className="p-6">
                  <p className="text-xs text-slate-500 font-medium mb-5">Click to toggle selection. High-confidence skills are auto-selected.</p>
                  {resumeData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      {resumeData.skills.map((skill) => (
                        <button key={skill.name} onClick={() => toggleSkill(skill.name)}
                          className={cn("group flex items-center gap-2 px-3.5 py-2 rounded-md border transition-all text-[11px] font-bold", selectedSkills.has(skill.name) ? "bg-[#ADFF2F]/10 border-[#ADFF2F]/40 text-slate-900 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300")}>
                          {selectedSkills.has(skill.name) && <CheckCircle2 className="w-3 h-3 text-[#65A30D]" />}
                          <span>{skill.name}</span>
                          <span className={cn("px-1.5 py-0.5 rounded-[2px] text-[9px] font-black", selectedSkills.has(skill.name) ? "bg-[#65A30D] text-white" : "bg-slate-200 text-slate-500")}>{skill.verifiedScore}%</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50"><Code className="w-8 h-8 text-slate-300 mx-auto mb-3" /><p className="text-sm font-bold text-slate-400">No verified skills found</p></div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div key="projects" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2"><FolderGit2 className="w-4 h-4 text-blue-500" /> Select Projects</h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-sm uppercase tracking-widest">{selectedProjects.size} Selected</span>
                </div>
                <div className="p-6 space-y-3">
                  {resumeData.projects.length > 0 ? resumeData.projects.map((project) => (
                    <div key={project.repoName} onClick={() => toggleProject(project.repoName)}
                      className={cn("flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all group", selectedProjects.has(project.repoName) ? "border-[#ADFF2F]/40 bg-[#ADFF2F]/5 shadow-sm" : "border-slate-200 hover:border-slate-300 bg-white")}>
                      <div className={cn("w-8 h-8 rounded-sm flex items-center justify-center border flex-shrink-0", selectedProjects.has(project.repoName) ? "bg-[#ADFF2F] border-[#ADFF2F] text-black" : "bg-slate-50 border-slate-200 text-slate-400")}>
                        {selectedProjects.has(project.repoName) ? <CheckCircle2 className="w-4 h-4" /> : <FolderGit2 className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-900 truncate">{project.repoName}</h4>
                        <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">{project.description || 'No description'}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {project.language && <span className="px-2 py-0.5 text-[9px] font-extrabold bg-blue-50 text-blue-700 rounded-[2px] border border-blue-100">{project.language}</span>}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50"><FolderGit2 className="w-8 h-8 text-slate-300 mx-auto mb-3" /><p className="text-sm font-bold text-slate-400">No projects added yet</p></div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'experience' && (
            <motion.div key="experience" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2"><Briefcase className="w-4 h-4 text-amber-500" /> Work & Education</h3>
                  <Dialog open={isAddingExperience} onOpenChange={setIsAddingExperience}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="h-8 text-xs font-bold rounded-md bg-slate-900 text-white hover:bg-slate-800 uppercase tracking-widest"><Plus className="w-3 h-3 mr-1.5" /> Add</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-xl border-slate-200 p-0 overflow-hidden bg-white">
                      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <DialogTitle className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Add Experience</DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 mt-1">Add your work, education, or certification</DialogDescription>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Type</label><select value={newExperience.type} onChange={(e) => setNewExperience({ ...newExperience, type: e.target.value as any })} className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white"><option value="WORK">Work Experience</option><option value="EDUCATION">Education</option><option value="CERTIFICATION">Certification</option></select></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Title/Degree</label><Input value={newExperience.title} onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })} placeholder="Job title or degree" className="h-9 rounded-md" /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Organization</label><Input value={newExperience.organization} onChange={(e) => setNewExperience({ ...newExperience, organization: e.target.value })} placeholder="Company or school" className="h-9 rounded-md" /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Location</label><Input value={newExperience.location} onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })} placeholder="City, Country" className="h-9 rounded-md" /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Start Date</label><Input type="date" value={newExperience.startDate} onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })} className="h-9 rounded-md" /></div>
                          <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-wider">End Date</label><Input type="date" value={newExperience.endDate} onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })} disabled={newExperience.isCurrent} className="h-9 rounded-md" /></div>
                        </div>
                        <div className="flex items-center gap-2"><input type="checkbox" checked={newExperience.isCurrent} onChange={(e) => setNewExperience({ ...newExperience, isCurrent: e.target.checked })} className="rounded" /><label className="text-xs font-bold text-slate-600">Currently here</label></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</label><Textarea value={newExperience.description} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })} placeholder="Describe your role" rows={3} className="rounded-md resize-none" /></div>
                      </div>
                      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsAddingExperience(false)} className="h-8 px-4 text-xs font-bold rounded-md">Cancel</Button>
                        <Button onClick={handleAddExperience} className="h-8 px-6 text-xs font-bold rounded-md bg-slate-900 hover:bg-slate-800 text-white">Add</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="p-6 space-y-4">
                  {resumeData.experiences.length > 0 ? resumeData.experiences.map((exp) => (
                    <div key={exp.id} className="group relative pl-6 border-l-2 border-slate-200 pb-4 hover:border-l-[#ADFF2F] transition-colors">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-sm bg-slate-900 ring-4 ring-white" />
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {exp.type === 'WORK' && <Briefcase className="w-3.5 h-3.5 text-amber-500" />}
                            {exp.type === 'EDUCATION' && <GraduationCap className="w-3.5 h-3.5 text-blue-500" />}
                            {exp.type === 'CERTIFICATION' && <Award className="w-3.5 h-3.5 text-purple-500" />}
                            <h4 className="text-sm font-extrabold text-slate-900">{exp.title}</h4>
                          </div>
                          <p className="text-xs font-bold text-blue-600">{exp.organization}</p>
                          {exp.location && <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5"><MapPin className="w-2.5 h-2.5" /> {exp.location}</p>}
                        </div>
                        <button onClick={() => handleDeleteExperience(exp.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{exp.startDate && new Date(exp.startDate).getFullYear()} - {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}</p>
                      {exp.description && <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">{exp.description}</p>}
                    </div>
                  )) : (
                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50"><Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-3" /><p className="text-sm font-bold text-slate-400">No experiences added yet</p></div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

