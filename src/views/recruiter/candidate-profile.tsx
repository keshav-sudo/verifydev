"use client"

/**
 * Candidate Profile - Recruiter View
 * Clean, Sharp, Minimal Design System
 */

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useFullCandidateProfile, useShortlistCandidate } from '@/hooks/use-recruiter'
import { downloadCandidateResume } from '@/api/services/recruiter.service'
import { AuraScore } from '@/components/aura-score'
import { SendMessageDialog } from '@/components/messaging/send-message-dialog'
import { getInitials, formatNumber } from '@/lib/utils'
import {
  ArrowLeft,
  MapPin,
  Globe,
  Github,
  Mail,
  Building,
  Calendar,
  Download,
  BookmarkPlus,
  ExternalLink,
  Star,
  Code2,
  GraduationCap,
  Briefcase,
  Trophy,
  Sparkles,
  GitBranch,
  Clock,
  Shield,
  CheckCircle2,
  Users,
  MessageSquare,
  Folder,
  FolderGit2,
  CheckCircle
} from 'lucide-react'
import { HireSignalBadge } from '@/components/skills/hire-signal-badge'

// --- Reusable Components ---

function SkillBadge({ skill }: { skill: any }) {
  // Handle string skills safely
  if (typeof skill === 'string') {
    return (
      <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-md px-3 py-1 text-xs font-bold text-slate-700">
        <span>{skill}</span>
      </div>
    )
  }

  const percentage = skill.verifiedScore || skill.score || 0

  return (
    <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-md px-3 py-1 text-xs font-bold text-slate-700">
      <span>{skill.name || 'Unknown Skill'}</span>
      {percentage > 0 && (
        <>
          <div className="h-3 w-px bg-slate-300" />
          <span className={
            percentage >= 80 ? "text-[#65A30D] font-extrabold" :
              percentage >= 60 ? "text-[#ADFF2F] font-extrabold" :
                percentage >= 40 ? "text-amber-600 font-extrabold" : "text-slate-400 font-extrabold"
          }>
            {percentage}%
          </span>
        </>
      )}
      {skill.isVerified && (
        <CheckCircle className="w-3 h-3 text-[#65A30D]" />
      )}
    </div>
  )
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm">{description}</p>
    </div>
  )
}

export default function CandidateProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { data: profileData, isLoading } = useFullCandidateProfile(userId || '')
  const shortlistMutation = useShortlistCandidate()
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)

  // Extract candidate from response (backend nests it under 'candidate')
  const candidate = (profileData as any)?.candidate || profileData;

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F0F2F5] p-4 md:p-6 lg:p-8 font-sans">
        <div className="max-w-[1536px] mx-auto space-y-6">
          <Skeleton className="h-8 w-40 rounded-lg" />
          <Skeleton className="h-72 w-full rounded-2xl" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-96 md:col-span-2 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="w-full min-h-screen bg-[#F0F2F5] flex items-center justify-center font-sans">
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm max-w-md">
          <div className="w-14 h-14 mx-auto mb-5 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
            <Users className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Not Found</p>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mb-2">Candidate Not Found</h1>
          <p className="text-sm text-slate-500 mb-6">
            The profile you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button asChild className="bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 px-6 py-2.5">
            <Link href="/recruiter/candidates">
              <ArrowLeft className="mr-2 w-3.5 h-3.5" />
              Back to search
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleShortlist = () => {
    if (candidate?.id) {
      shortlistMutation.mutate({ userId: candidate.id })
    }
  }

  const handleDownloadResume = () => {
    if (candidate?.id) {
      downloadCandidateResume(candidate.id)
    }
  }

  const privacy = (candidate as any)?.visibility || {};

  // Privacy Logic
  const canShowEmail = candidate.showEmail || privacy.showEmail;

  // Filter lists based on showToRecruiters (and ensure items exist)
  // Fix: Check verifiedSkills first as it's the primary source of truth for verified profiles
  const skills = (candidate.verifiedSkills || candidate.allSkills || candidate.skills || []).filter((s: any) => s && s.showToRecruiters !== false);
  const topSkills = (candidate.topSkills || []).filter((s: any) => s && s.showToRecruiters !== false);
  const projects = (candidate.analyzedProjects || candidate.projects || []).filter((p: any) => p && p.showToRecruiters !== false);
  const experiences = candidate.experiences || candidate.experience || [];
  const educationList = candidate.education || [];
  const auraScore = candidate.auraScore || (candidate as any).auraSummary?.score || 0;

  // Calculate stats
  const totalStars = projects.reduce((acc: number, p: any) => acc + (p?.stars || 0), 0);
  const coreCount = candidate.coreCount || candidate.summary?.cores || 0;

  return (
    <div className="w-full min-h-screen bg-[#F0F2F5] p-4 md:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-[1536px] mx-auto space-y-6">

        {/* Back Button */}
        <Link
          href="/recruiter/candidates"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to search
        </Link>

        {/* ========== HERO PROFILE CARD ========== */}
        <div className="relative overflow-hidden bg-[#0A0A0A] rounded-2xl border border-slate-800">
          {/* Decorative blurs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#ADFF2F]/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#A78BFA]/10 rounded-full blur-[100px]" />
          </div>

          <div className="relative p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Avatar */}
              <div className="flex flex-col items-center lg:items-start gap-5 lg:w-56 flex-shrink-0">
                <div className="relative">
                  {candidate.isOpenToWork && (
                    <div className="absolute -inset-1.5 bg-[#ADFF2F]/20 rounded-full blur-md" />
                  )}
                  <Avatar className="relative h-28 w-28 border-2 border-slate-700 shadow-2xl">
                    <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
                    <AvatarFallback className="text-2xl bg-slate-800 text-[#ADFF2F] font-black">
                      {getInitials(candidate.name || candidate.username || '?')}
                    </AvatarFallback>
                  </Avatar>
                  {candidate.isOpenToWork && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#ADFF2F] text-[#0A0A0A] text-[10px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-full whitespace-nowrap">
                      Open to Work
                    </span>
                  )}
                </div>

                {/* Mini Stats Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 w-full max-w-[220px]">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xl font-black text-slate-900 tracking-tight">{projects.length}</p>
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Projects</p>
                    </div>
                    <div className="border-x border-slate-200">
                      <p className="text-xl font-black text-slate-900 tracking-tight">{formatNumber(totalStars)}</p>
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Stars</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-[#ADFF2F] tracking-tight">{auraScore}</p>
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Aura</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center: Info */}
              <div className="flex-1 space-y-4 text-center lg:text-left min-w-0">
                <div>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-1.5">
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                      {candidate.name || candidate.username || 'Unknown Candidate'}
                    </h1>
                    {coreCount > 0 && (
                      <span className="inline-flex items-center gap-1 bg-[#A78BFA]/15 border border-[#A78BFA]/30 rounded-md px-2.5 py-1 text-[10px] font-extrabold text-[#A78BFA] uppercase tracking-widest">
                        <Shield className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                    {(candidate as any).hireSignal && (
                      <HireSignalBadge signal={(candidate as any).hireSignal} className="shadow-sm" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400 font-medium">@{candidate.username}</p>

                  {/* Primary Role */}
                  {candidate.primaryRole && (
                    <div className="mt-3 flex flex-wrap gap-2 justify-center lg:justify-start">
                      <span className="inline-flex items-center gap-1.5 bg-[#ADFF2F]/10 border border-[#ADFF2F]/20 rounded-md px-3 py-1 text-xs font-bold text-[#ADFF2F]">
                        <Code2 className="h-3.5 w-3.5" />
                        {candidate.primaryRole}
                      </span>
                    </div>
                  )}
                </div>

                {candidate.bio && (
                  <p className="text-slate-300 max-w-2xl text-sm leading-relaxed">{candidate.bio}</p>
                )}

                <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 text-[10px] font-medium text-slate-400">
                  {candidate.location && (
                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {candidate.location}</span>
                  )}
                  {candidate.company && (
                    <span className="flex items-center gap-1.5"><Building className="h-3.5 w-3.5" /> {candidate.company}</span>
                  )}
                  {candidate.websiteUrl && (
                    <a href={candidate.websiteUrl} target="_blank" className="flex items-center gap-1.5 hover:text-[#ADFF2F] transition-colors"><Globe className="h-3.5 w-3.5" /> Website</a>
                  )}
                  {candidate.githubUrl && (
                    <a href={candidate.githubUrl} target="_blank" className="flex items-center gap-1.5 hover:text-[#ADFF2F] transition-colors"><Github className="h-3.5 w-3.5" /> GitHub</a>
                  )}
                  {canShowEmail && candidate.email && (
                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {candidate.email}</span>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-row lg:flex-col gap-2.5 justify-center lg:min-w-[160px] flex-shrink-0">
                <button
                  onClick={handleShortlist}
                  className="flex items-center justify-center gap-2 w-full bg-[#ADFF2F] text-[#0A0A0A] text-xs font-extrabold uppercase tracking-widest rounded-lg px-5 py-2.5 hover:bg-[#c5ff66] transition-colors"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  Shortlist
                </button>
                <button
                  onClick={() => setIsMessageDialogOpen(true)}
                  className="flex items-center justify-center gap-2 w-full bg-white/10 border border-slate-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg px-5 py-2.5 hover:bg-white/20 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message
                </button>
                <button
                  onClick={handleDownloadResume}
                  className="flex items-center justify-center gap-2 w-full bg-transparent border border-slate-700 text-slate-400 text-xs font-bold uppercase tracking-widest rounded-lg px-5 py-2.5 hover:text-white hover:border-slate-500 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Resume
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========== TABS ========== */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 shadow-sm p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg text-xs font-bold uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="skills" className="rounded-lg text-xs font-bold uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">Skills</TabsTrigger>
            <TabsTrigger value="projects" className="rounded-lg text-xs font-bold uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">Projects</TabsTrigger>
            <TabsTrigger value="experience" className="rounded-lg text-xs font-bold uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">Experience</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Top Skills Preview */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-amber-500/10 rounded-md border border-amber-500/20">
                        <Star className="w-4 h-4 text-amber-500" />
                      </div>
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Top Skills</h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(topSkills.length > 0 ? topSkills : skills.slice(0, 10)).map((s: any) => (
                      <SkillBadge key={s.name || s} skill={s} />
                    ))}
                    {skills.length === 0 && <span className="text-xs text-slate-400">No skills listed.</span>}
                  </div>
                </div>

                {/* Featured Projects Preview */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20">
                      <Folder className="w-4 h-4 text-blue-500" />
                    </div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Featured Projects</h3>
                  </div>
                  <div className="space-y-3">
                    {projects.slice(0, 3).map((project: any) => (
                      <div key={project.id} className="flex items-start justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="flex gap-3.5">
                          <div className="mt-0.5 p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20 flex-shrink-0">
                            <FolderGit2 className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{project.name || project.repoName || 'Untitled Project'}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{project.description || 'No description provided'}</p>
                            <div className="flex items-center gap-3 mt-2">
                              {project.language && (
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">{project.language}</span>
                              )}
                              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                <Star className="w-3 h-3 text-amber-500" /> {formatNumber(project.stars)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {project.demoUrl && (
                          <a href={project.demoUrl} target="_blank" className="text-slate-400 hover:text-slate-900 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                    {projects.length === 0 && <span className="text-xs text-slate-400">No projects to display.</span>}
                  </div>
                </div>
              </div>

              {/* Right Column: Aura & Insights */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 pt-5 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-amber-500/10 rounded-md border border-amber-500/20">
                        <Trophy className="w-4 h-4 text-amber-500" />
                      </div>
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Aura Score</h3>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <AuraScore
                        score={auraScore}
                        level={auraScore}
                        trend={(candidate as any).auraSummary?.trend || 'STABLE'}
                        size="lg"
                      />
                    </div>
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4">
                      {auraScore >= 400 ? 'Exceptional' : auraScore >= 200 ? 'Strong' : 'Growing'} Developer
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-left">
                      {candidate.auraSummary?.breakdown && Object.entries(candidate.auraSummary.breakdown).map(([key, val]: any) => (
                        <div key={key} className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex justify-between items-center">
                          <span className="capitalize text-[10px] font-medium text-slate-400">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-xs font-black text-slate-900">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 pt-5 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-[#A78BFA]/10 rounded-md border border-[#A78BFA]/20">
                        <Sparkles className="w-4 h-4 text-[#A78BFA]" />
                      </div>
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">AI Insights</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex gap-3">
                      <div className="p-1.5 bg-[#65A30D]/10 rounded-md border border-[#65A30D]/20 h-fit">
                        <Code2 className="w-4 h-4 text-[#65A30D]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Technical Depth</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{skills.length} skills analyzed across {projects.length} projects.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20 h-fit">
                        <Briefcase className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Experience Level</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {experiences.length > 2 ? 'Experienced Professional' : 'Early Career / Junior'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* SKILLS TAB */}
          <TabsContent value="skills">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-[#ADFF2F]/10 rounded-md border border-[#ADFF2F]/20">
                    <CheckCircle2 className="w-4 h-4 text-[#65A30D]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Technical Skills</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Competencies verified through project analysis.</p>
                  </div>
                </div>
              </div>

              {skills.length > 0 ? (
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4">Verified by Code</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.filter((s: any) => s.isVerified).map((s: any) => <SkillBadge key={s.name || s} skill={s} />)}
                      {skills.filter((s: any) => s.isVerified).length === 0 && <span className="text-xs text-slate-400 italic">No verified skills yet.</span>}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4">Claimed & Other</p>
                    <div className="flex flex-wrap gap-2">
                      {/* Fix: safely handle skill object check */}
                      {skills.filter((s: any) => !s.isVerified).map((s: any) => <SkillBadge key={s.name || s} skill={s} />)}
                      {skills.filter((s: any) => !s.isVerified).length === 0 && <span className="text-xs text-slate-400 italic">No other skills listed.</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={<Code2 className="w-6 h-6 text-slate-400" />}
                  title="No Skills Listed"
                  description="This candidate has not listed any skills yet."
                />
              )}
            </div>
          </TabsContent>

          {/* PROJECTS TAB */}
          <TabsContent value="projects">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="p-1.5 bg-[#A78BFA]/10 rounded-md border border-[#A78BFA]/20">
                  <FolderGit2 className="w-4 h-4 text-[#A78BFA]" />
                </div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Project Portfolio</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project: any, idx: number) => {
                  const accentColors = ['border-l-[#ADFF2F]', 'border-l-[#A78BFA]', 'border-l-blue-500', 'border-l-amber-500', 'border-l-rose-500', 'border-l-cyan-500']
                  const accent = accentColors[idx % accentColors.length]
                  return (
                    <div key={project.id} className={`flex flex-col justify-between p-5 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow border-l-4 ${accent}`}>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1" title={project.name || project.repoName}>
                            {project.name || project.repoName || 'Untitled Project'}
                          </h4>
                          <div className="flex gap-1.5 flex-shrink-0 ml-2">
                            {project.homepage && (
                              <a
                                href={project.homepage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
                                title="View Demo"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {project.repoUrl && (
                              <a
                                href={project.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
                                title="View Code"
                              >
                                <Github className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                          {project.description || 'No description provided for this project.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {project.language && (
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                              {project.language}
                            </span>
                          )}
                          {project.topics?.slice(0, 2).map((topic: string) => (
                            <span key={topic} className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">{topic}</span>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            {formatNumber(project.stars || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitBranch className="w-3.5 h-3.5" />
                            {formatNumber(project.forks || 0)}
                          </span>
                          {(project.commits || 0) > 0 && (
                            <span className="flex items-center gap-1 ml-auto text-[10px] text-slate-400">
                              <Clock className="w-3 h-3" />
                              {formatNumber(project.commits)} commits
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {projects.length === 0 && (
                  <div className="col-span-full">
                    <EmptyState
                      icon={<FolderGit2 className="w-6 h-6 text-slate-400" />}
                      title="No Projects Found"
                      description="This candidate has not chosen to showcase any projects yet or they are hidden from recruiters."
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* EXPERIENCE TAB */}
          <TabsContent value="experience" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Work History */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="p-1.5 bg-[#ADFF2F]/10 rounded-md border border-[#ADFF2F]/20">
                    <Briefcase className="w-4 h-4 text-[#65A30D]" />
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Work History</h3>
                </div>
                <div className="space-y-6">
                  {experiences.map((exp: any, idx: number) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-slate-200 pb-4 last:border-0 last:pb-0">
                      <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-900" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{exp.title}</h4>
                        <p className="text-xs font-semibold text-[#65A30D]">{exp.organization}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] font-medium text-slate-400">
                            {exp.startDate ? new Date(exp.startDate).getFullYear() : 'Unknown'} -
                            {exp.isCurrent ? ' Present' : (exp.endDate ? ` ${new Date(exp.endDate).getFullYear()}` : '')}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {experiences.length === 0 && (
                    <p className="text-center text-xs text-slate-400 italic py-6">No work experience listed.</p>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Education</h3>
                </div>
                <div className="space-y-5">
                  {educationList.map((edu: any, idx: number) => (
                    <div key={idx} className="flex gap-3.5">
                      <div className="p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20 h-fit flex-shrink-0">
                        <GraduationCap className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{edu.degree || edu.title}</h4>
                        <p className="text-xs text-slate-500">{edu.school || edu.institution || edu.organization}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                          {edu.startDate ? new Date(edu.startDate).getFullYear() : 'Unknown'} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {educationList.length === 0 && (
                    <p className="text-center text-xs text-slate-400 italic py-6">No education listed.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

        </Tabs>

        {/* Send Message Dialog */}
        <SendMessageDialog
          open={isMessageDialogOpen}
          onOpenChange={setIsMessageDialogOpen}
          candidateId={candidate?.id}
          candidateName={candidate?.name || candidate?.username || 'Candidate'}
          candidateAvatar={candidate?.avatarUrl}
        />
      </div>
    </div>
  )
}
