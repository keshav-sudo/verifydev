"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { get, post } from '@/api/client'
import { formatSalary, formatDate, cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { ApplyJobModal } from '@/components/job/ApplyJobModal'
import { useAuthStore } from '@/store/auth-store'
import type { Job } from '@/types'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Building,
  Briefcase,
  Zap,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  Target
} from 'lucide-react'

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Internship',
}

const experienceLevelLabels: Record<string, string> = {
  ENTRY: 'Entry Level',
  JUNIOR: 'Junior',
  MID: 'Mid Level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  PRINCIPAL: 'Principal',
  EXECUTIVE: 'Executive',
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [quickApplyEnabled, setQuickApplyEnabled] = useState(false)

  // Job Data
  const { data: job, isLoading, isError, error } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const response = await get<{ job: Job }>(`/v1/jobs/${id}`)
      return response.job
    },
    enabled: !!id,
  })

  // Start Preparation for Quick Apply Data
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => get<{ projects: any[] }>('/v1/projects'),
    enabled: !!user,
  })

  const { data: experienceData } = useQuery({
    queryKey: ['experiences'],
    queryFn: () => get<{ work: any[], education: any[], certifications: any[] }>('/v1/experiences'),
    enabled: !!user,
  })

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => get<any>('/v1/users/me'),
    enabled: !!user,
  })

  // Load preferences
  useEffect(() => {
    const saved = localStorage.getItem('jobPreferences')
    if (saved) {
      try {
        const prefs = JSON.parse(saved)
        if (prefs.quickApplyEnabled) {
          setQuickApplyEnabled(true)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Prepare Payload Helper
  const getQuickApplyPayload = () => {
    try {
      const saved = localStorage.getItem('jobPreferences')
      if (!saved) return null
      const prefs = JSON.parse(saved)

      const projects = projectsData?.projects || []
      const work = experienceData?.work || []
      const certs = experienceData?.certifications || []

      const selectedProjects = projects.filter((p: any) => prefs.selectedProjects?.includes(p.id))
      const selectedSkills = prefs.selectedSkills || []
      const selectedWork = work.filter((e: any) => prefs.selectedExperience?.includes(e.id))
      const selectedCerts = certs.filter((e: any) => prefs.selectedCertifications?.includes(e.id))

      return {
        coverLetter: prefs.defaultCoverLetter || '',
        candidateName: user?.name || userProfile?.name || 'Candidate',
        candidateEmail: user?.email || userProfile?.email || 'candidate@example.com',
        candidateAura: userProfile?.auraScore || 0,
        candidateCores: userProfile?.coreCount || 1,
        candidateSkills: selectedSkills.length > 0 ? selectedSkills : (userProfile?.skills?.map((s: any) => s.name) || []),
        candidateProjects: selectedProjects,
        candidateExperience: selectedWork,
        candidateCertifications: selectedCerts,
      }
    } catch (error) {
      console.error('Error in getQuickApplyPayload:', error)
      return null
    }
  }

  const quickApplyMutation = useMutation({
    mutationFn: (data: any) => post(`/v1/jobs/${id}/apply`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] })
      toast({
        title: 'Application submitted! 🚀',
        description: 'Applied successfully using your default preferences.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to apply',
        description: error?.response?.data?.message || 'Please try again.',
      })
    },
  })

  const handleApply = () => {
    if (quickApplyEnabled) {
      const payload = getQuickApplyPayload()
      if (payload) {
        quickApplyMutation.mutate(payload)
      } else {
        toast({ title: 'Quick Apply not configured', description: 'Please check your settings.' })
        setShowApplyModal(true)
      }
    } else {
      setShowApplyModal(true)
    }
  }

  // Get application data for Modal
  const manualApplicationData = (() => {
    const payload = getQuickApplyPayload()
    if (!payload) return undefined
    return {
      skills: payload.candidateSkills,
      projects: payload.candidateProjects,
      experience: payload.candidateExperience,
      certifications: payload.candidateCertifications
    }
  })()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Briefcase className="h-6 w-6 text-slate-300" />
          </div>
          <h1 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-2">Job Not Found</h1>
          <p className="text-xs text-slate-500 font-medium mb-6">The job post you are looking for does not exist or has been removed.</p>
          <Link href="/jobs" className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-extrabold uppercase tracking-widest hover:bg-slate-800 transition-colors">
            Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-['Plus_Jakarta_Sans'] pb-20 relative">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="w-full max-w-[1536px] mx-auto px-4 md:px-6 lg:px-8 py-8 relative z-10">

        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors group">
            <div className="p-1.5 rounded-md bg-white border border-slate-200 shadow-sm group-hover:border-slate-300 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
            Back to Jobs
          </Link>
        </div>

        {/* DARK HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-[#0A0A0A] rounded-xl p-8 lg:p-10 shadow-xl border border-slate-800 relative overflow-hidden mb-8"
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ADFF2F]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-white/10 border border-white/5 flex items-center justify-center backdrop-blur-md shrink-0">
                  <Briefcase className="w-7 h-7 text-[#ADFF2F]" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight mb-2">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5 text-sm font-bold text-slate-300">
                      <Building className="w-4 h-4 text-slate-400" />
                      {job.organization?.name || 'Verified Company'}
                    </span>
                    <span className="px-2 py-0.5 rounded-[3px] bg-[#ADFF2F]/10 border border-[#ADFF2F]/20 text-[#ADFF2F] text-[9px] font-extrabold uppercase tracking-widest">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {user && (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                  <Switch
                    id="quick-apply"
                    checked={quickApplyEnabled}
                    onCheckedChange={(checked) => {
                      setQuickApplyEnabled(checked)
                      const saved = localStorage.getItem('jobPreferences')
                      if (saved) {
                        const prefs = JSON.parse(saved)
                        prefs.quickApplyEnabled = checked
                        localStorage.setItem('jobPreferences', JSON.stringify(prefs))
                      }
                    }}
                    className="data-[state=checked]:bg-[#ADFF2F]"
                  />
                  <Label htmlFor="quick-apply" className="text-[10px] font-extrabold text-white uppercase tracking-widest cursor-pointer flex items-center gap-2 select-none">
                    <Sparkles className="w-3.5 h-3.5 text-[#ADFF2F]" /> Quick Apply
                  </Label>
                </div>
              )}
              <Button
                onClick={handleApply}
                disabled={quickApplyMutation.isPending}
                className="h-11 px-8 bg-[#ADFF2F] hover:bg-[#9AE62A] text-slate-900 text-xs font-extrabold uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(173,255,47,0.2)] hover:shadow-[0_0_30px_rgba(173,255,47,0.3)] transition-all transform active:scale-95"
              >
                {quickApplyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    {quickApplyEnabled ? 'Quick Apply' : 'Apply Now'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT CONTENT (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8"
            >
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-slate-400" /> Job Description
              </h3>
              <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed font-medium">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8"
            >
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#65A30D]" /> Requirements
              </h3>
              <ul className="space-y-4">
                {(() => {
                  const reqs = job.requirements
                  const reqArray = typeof reqs === 'string'
                    ? reqs.split('\n').map(r => r.trim()).filter(Boolean)
                    : (Array.isArray(reqs) ? reqs : [])

                  if (reqArray.length === 0) return <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">No specific requirements listed.</p>

                  return reqArray.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-0.5 min-w-[16px]"><CheckCircle className="w-4 h-4 text-[#65A30D]" /></div>
                      <span className="text-sm font-medium text-slate-600 leading-relaxed">{req}</span>
                    </li>
                  ))
                })()}
              </ul>
            </motion.div>

            {/* Responsibilities */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8"
            >
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" /> Responsibilities
              </h3>
              <ul className="space-y-4">
                {(() => {
                  const resps = job.responsibilities
                  const respArray = typeof resps === 'string'
                    ? resps.split('\n').map(r => r.trim()).filter(Boolean)
                    : (Array.isArray(resps) ? resps : [])

                  if (respArray.length === 0) return <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">No specific responsibilities listed.</p>

                  return respArray.map((resp: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-0.5 min-w-[16px]"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 ml-1" /></div>
                      <span className="text-sm font-medium text-slate-600 leading-relaxed">{resp}</span>
                    </li>
                  ))
                })()}
              </ul>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8"
            >
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Required Skills
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {job.requiredSkills.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-700 text-xs font-extrabold uppercase tracking-widest hover:border-slate-300 transition-colors">
                    {skill}
                  </Badge>
                ))}
                {job.preferredSkills?.map((skill: string) => (
                  <Badge key={skill} variant="outline" className="px-3 py-1.5 border-dashed border-slate-300 text-slate-500 text-xs font-bold uppercase tracking-widest hover:border-slate-400 transition-colors">
                    {skill} (Preferred)
                  </Badge>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDEBAR (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Job Overview Card */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
            >
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-6 pb-4 border-b border-slate-100">
                Job Overview
              </h3>
              <div className="space-y-5">

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salary</div>
                    <div className="text-sm font-black text-slate-900">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</div>
                    <div className="text-sm font-black text-slate-900">{job.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job Type</div>
                    <div className="text-sm font-black text-slate-900">{jobTypeLabels[job.type]}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience</div>
                    <div className="text-sm font-black text-slate-900">{experienceLevelLabels[job.level]}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</div>
                    <div className="text-sm font-black text-slate-900">{job.category}</div>
                  </div>
                </div>

                {job.minAuraScore && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#ADFF2F]/10 border border-[#ADFF2F]/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-[#65A30D]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min Aura Score</div>
                      <div className="text-sm font-black text-[#65A30D]">{job.minAuraScore}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posted</div>
                    <div className="text-sm font-black text-slate-900">{formatDate(job.createdAt)}</div>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Company Card */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
            >
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-6 pb-4 border-b border-slate-100">
                About the Company
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Building className="h-7 w-7 text-slate-400" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">{job.organization?.name || 'Verified Company'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {job.applicationsCount} applicants
                  </p>
                </div>
              </div>

              <Button
                className="w-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-extrabold uppercase tracking-widest h-10 rounded-lg"
                onClick={handleApply}
                disabled={quickApplyMutation.isPending}
              >
                {quickApplyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                {quickApplyEnabled ? 'Quick Apply' : 'Apply for this Job'}
              </Button>
            </motion.div>

          </div>
        </div>

      </div>

      {/* Apply Modal */}
      {job && (
        <ApplyJobModal
          job={job}
          open={showApplyModal}
          onOpenChange={setShowApplyModal}
          applicationData={manualApplicationData}
        />
      )}
    </div>
  )
}
