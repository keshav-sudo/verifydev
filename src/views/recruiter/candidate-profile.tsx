"use client"

/**
 * Candidate Profile - Recruiter View
 * Clean, Professional, Dashboard-aligned UI
 */

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useFullCandidateProfile, useShortlistCandidate } from '@/hooks/use-recruiter'
import { downloadCandidateResume } from '@/api/services/recruiter.service'
import { AuraScore } from '@/components/aura-score'
import { SendMessageDialog } from '@/components/messaging/send-message-dialog'
import { getInitials, cn, formatNumber } from '@/lib/utils'
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
  Zap,
  GitBranch,
  Clock,
  Award,
  Shield,
  CheckCircle2,
  Users,
  MessageSquare,
  Target,
  TrendingUp,
  Folder,
  Brain,
  Rocket,
  FolderGit2,
  CheckCircle,
  Link as LinkIcon
} from 'lucide-react'
import { HireSignalBadge } from '@/components/skills/hire-signal-badge'

// --- Reusable Components (Matching profile.tsx) ---

function GlassCard({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

function SkillBadge({ skill }: { skill: any }) {
  const percentage = skill.verifiedScore || skill.score || 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="group"
    >
      <Badge
        variant="outline"
        className={cn(
          "px-3 py-1.5 text-sm backdrop-blur-sm transition-all cursor-default",
          "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/40"
        )}
      >
        <span className="font-medium text-foreground">{skill.name}</span>
        {percentage > 0 && (
          <>
            <div className="mx-2 h-3 w-px bg-border" />
            <span className={cn(
              "text-xs font-bold",
              percentage >= 80 ? "text-emerald-500" :
                percentage >= 60 ? "text-primary" :
                  percentage >= 40 ? "text-amber-500" : "text-muted-foreground"
            )}>
              {percentage}%
            </span>
          </>
        )}
        {skill.isVerified && (
          <CheckCircle className="w-3 h-3 ml-1.5 text-emerald-500" />
        )}
      </Badge>
    </motion.div>
  )
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-3 rounded-full bg-muted/50 mb-4 opacity-70">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-muted-foreground max-w-sm">{description}</p>
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
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-96 md:col-span-2 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center p-12 rounded-2xl border border-dashed border-border max-w-md bg-card">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold mb-2">Candidate Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The profile you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild variant="outline">
            <Link href="/recruiter/candidates">
              <ArrowLeft className="mr-2 w-4 h-4" />
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
  const canShowPhone = candidate.showPhone || privacy.showPhone;

  // Filter lists based on showToRecruiters (and ensure items exist)
  const skills = (candidate.allSkills || candidate.skills || []).filter((s: any) => s && s.showToRecruiters !== false);
  const topSkills = (candidate.topSkills || []).filter((s: any) => s && s.showToRecruiters !== false);
  const verifiedSkillsCount = skills.filter((s: any) => s?.isVerified).length;
  const projects = (candidate.analyzedProjects || candidate.projects || []).filter((p: any) => p && p.showToRecruiters !== false);
  const experiences = candidate.experiences || candidate.experience || [];
  const educationList = candidate.education || [];
  const auraScore = candidate.auraScore || (candidate as any).auraSummary?.score || 0;

  // Calculate stats
  const totalStars = projects.reduce((acc: number, p: any) => acc + (p?.stars || 0), 0);
  const coreCount = candidate.coreCount || candidate.summary?.cores || 0;

  return (
    <div className="min-h-full space-y-6 animate-in fade-in duration-500 container mx-auto px-4 py-8">
      
      {/* Back Button */}
      <Link
        href="/recruiter/candidates"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to search
      </Link>

      {/* ========== HERO PROFILE CARD ========== */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-card/80 shadow-sm">
        {/* Subtle decorative background elements (matching profile.tsx) */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-1/4 -left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Avatar & Basic Info */}
            <div className="flex flex-col items-center lg:items-start gap-4 lg:w-64">
              <div className="relative group">
                {candidate.isOpenToWork && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-green-500/30 rounded-full blur-md opacity-70 animate-pulse" />
                )}
                <Avatar className="relative h-32 w-32 border-4 border-card shadow-xl">
                  <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                    {getInitials(candidate.name || candidate.username || '?')}
                  </AvatarFallback>
                </Avatar>
                {candidate.isOpenToWork && (
                    <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white shadow-lg whitespace-nowrap">
                        Open to Work
                    </Badge>
                )}
              </div>

               {/* Quick Stats */}
               <div className="flex gap-4 text-center w-full justify-center lg:justify-start lg:w-auto mt-2">
                <div>
                  <p className="text-xl font-bold text-foreground">{projects.length}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <p className="text-xl font-bold text-foreground">{formatNumber(totalStars)}</p>
                  <p className="text-xs text-muted-foreground">Stars</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <p className="text-xl font-bold text-primary">{auraScore}</p>
                  <p className="text-xs text-muted-foreground">Aura</p>
                </div>
              </div>
            </div>

            {/* Center: Info */}
            <div className="flex-1 space-y-4 text-center lg:text-left">
              <div>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-2">
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                    {candidate.name || candidate.username || 'Unknown Candidate'}
                  </h1>
                  {coreCount > 0 && (
                    <Badge variant="outline" className="border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-500/5">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified Profile
                    </Badge>
                  )}
                  {(candidate as any).hireSignal && (
                    <HireSignalBadge signal={(candidate as any).hireSignal} className="shadow-sm" />
                  )}
                </div>
                <p className="text-lg text-muted-foreground">@{candidate.username}</p>

                {/* Primary Role Badge */}
                {candidate.primaryRole && (
                  <div className="mt-3 flex flex-wrap gap-2 justify-center lg:justify-start">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-3 py-1 text-sm">
                      <Code2 className="h-3.5 w-3.5 mr-1.5" />
                      {candidate.primaryRole}
                    </Badge>
                  </div>
                )}
              </div>

              {candidate.bio && (
                 <p className="text-foreground/80 max-w-2xl text-lg leading-relaxed">{candidate.bio}</p>
              )}

              <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {candidate.location && (
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {candidate.location}</span>
                )}
                {candidate.company && (
                  <span className="flex items-center gap-1.5"><Building className="h-4 w-4" /> {candidate.company}</span>
                )}
                {candidate.websiteUrl && (
                  <a href={candidate.websiteUrl} target="_blank" className="flex items-center gap-1.5 hover:text-primary transition-colors"><Globe className="h-4 w-4" /> Website</a>
                )}
                 {candidate.githubUrl && (
                  <a href={candidate.githubUrl} target="_blank" className="flex items-center gap-1.5 hover:text-primary transition-colors"><Github className="h-4 w-4" /> GitHub</a>
                )}
                 {canShowEmail && candidate.email && (
                  <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {candidate.email}</span>
                )}
              </div>
            </div>

            {/* Right: Actions */}
             <div className="flex flex-row lg:flex-col gap-3 justify-center lg:min-w-[160px]">
                <Button 
                    onClick={handleShortlist} 
                    className="w-full gap-2 shadow-sm bg-primary hover:bg-primary/90"
                >
                    <BookmarkPlus className="w-4 h-4" />
                    Shortlist
                </Button>
                <Button 
                    variant="outline" 
                    onClick={() => setIsMessageDialogOpen(true)}
                    className="w-full gap-2"
                >
                    <MessageSquare className="w-4 h-4" />
                    Message
                </Button>
                <Button 
                    variant="ghost" 
                    onClick={handleDownloadResume}
                    className="w-full gap-2"
                >
                    <Download className="w-4 h-4" />
                    Resume
                </Button>
             </div>
          </div>
        </div>
      </div>

       {/* ========== TABS ========== */}
       <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="skills" className="rounded-lg">Skills</TabsTrigger>
          <TabsTrigger value="projects" className="rounded-lg">Projects</TabsTrigger>
          <TabsTrigger value="experience" className="rounded-lg">Experience</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
             <div className="grid lg:grid-cols-3 gap-6">
                 {/* Left Column */}
                 <div className="lg:col-span-2 space-y-6">
                     {/* Top Skills Preview */}
                     <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500" /> Top Skills
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => document.getElementById('tab-skills')?.click()} asChild>
                                <span className="cursor-pointer">View All</span>
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                             {(topSkills.length > 0 ? topSkills : skills.slice(0, 10)).map((s: any) => (
                                 <SkillBadge key={s.name} skill={s} />
                             ))}
                             {skills.length === 0 && <span className="text-muted-foreground text-sm">No skills listed.</span>}
                        </div>
                     </GlassCard>

                     {/* Recent Projects Preview */}
                     <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-6">
                             <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Folder className="w-5 h-5 text-blue-500" /> Featured Projects
                            </h3>
                        </div>
                        <div className="space-y-4">
                            {projects.slice(0, 3).map((project: any) => (
                                <div key={project.id} className="flex items-start justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="mt-1 h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                            <FolderGit2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{project.name}</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{project.description || 'No description provided'}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                {project.language && <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{project.language}</Badge>}
                                                <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {project.stars}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {project.demoUrl && (
                                        <a href={project.demoUrl} target="_blank" className="text-muted-foreground hover:text-primary">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            ))}
                            {projects.length === 0 && <span className="text-muted-foreground text-sm">No projects to display.</span>}
                        </div>
                     </GlassCard>
                 </div>

                 {/* Right Column: Aura & Insights */}
                 <div className="space-y-6">
                      <Card className="border-border/80 shadow-sm overflow-hidden">
                          <CardHeader className="bg-muted/30 pb-4">
                              <CardTitle className="text-lg flex items-center gap-2">
                                  <Trophy className="w-5 h-5 text-yellow-500" /> Aura Score
                              </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-6 text-center">
                              <div className="flex justify-center mb-4">
                                  <AuraScore 
                                    score={auraScore} 
                                    level={auraScore} 
                                    trend={(candidate as any).auraSummary?.trend || 'STABLE'}
                                    size="lg" 
                                  />
                              </div>
                              <p className="text-sm text-muted-foreground font-medium mb-4">
                                {auraScore >= 400 ? 'Exceptional' : auraScore >= 200 ? 'Strong' : 'Growing'} Developer
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-left">
                                  {candidate.auraSummary?.breakdown && Object.entries(candidate.auraSummary.breakdown).map(([key, val]: any) => (
                                      <div key={key} className="bg-muted/20 p-2 rounded text-xs flex justify-between">
                                          <span className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                          <span className="font-semibold">{val}</span>
                                      </div>
                                  ))}
                              </div>
                          </CardContent>
                      </Card>

                      {/* Quick Insights */}
                      <Card className="border-border/80 shadow-sm">
                          <CardHeader className="bg-muted/30 pb-4">
                              <CardTitle className="text-lg flex items-center gap-2">
                                  <Sparkles className="w-5 h-5 text-violet-500" /> AI Insights
                              </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-6 space-y-4">
                              <div className="flex gap-3">
                                  <div className="p-2 h-fit rounded-lg bg-green-500/10"><Code2 className="w-4 h-4 text-green-600" /></div>
                                  <div className="text-sm">
                                      <span className="font-medium">Technical Depth:</span>
                                      <p className="text-muted-foreground">{skills.length} skills analyzed across {projects.length} projects.</p>
                                  </div>
                              </div>
                              <div className="flex gap-3">
                                  <div className="p-2 h-fit rounded-lg bg-blue-500/10"><Briefcase className="w-4 h-4 text-blue-600" /></div>
                                  <div className="text-sm">
                                      <span className="font-medium">Experience Level:</span>
                                      <p className="text-muted-foreground">
                                          {experiences.length > 2 ? 'Experienced Professional' : 'Early Career / Junior'}
                                      </p>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                 </div>
             </div>
        </TabsContent>

        {/* SKILLS TAB */}
        <TabsContent value="skills">
            <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" /> Technical Skills
                        </h3>
                        <p className="text-sm text-muted-foreground">Competencies verified through project analysis.</p>
                    </div>
                </div>
                
                {skills.length > 0 ? (
                    <div className="space-y-8">
                         {/* Group by Verification Status */}
                         <div>
                             <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Verified by Code</h4>
                             <div className="flex flex-wrap gap-3">
                                 {skills.filter((s:any) => s.isVerified).map((s:any) => <SkillBadge key={s.name} skill={s} />)}
                                 {skills.filter((s:any) => s.isVerified).length === 0 && <span className="text-sm text-muted-foreground italic">No verified skills yet.</span>}
                             </div>
                         </div>
                         
                         <div>
                             <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Claimed & Other</h4>
                             <div className="flex flex-wrap gap-3">
                                 {skills.filter((s:any) => !s.isVerified).map((s:any) => <SkillBadge key={s.name} skill={s} />)}
                                 {skills.filter((s:any) => !s.isVerified).length === 0 && <span className="text-sm text-muted-foreground italic">No other skills listed.</span>}
                             </div>
                         </div>
                    </div>
                ) : (
                    <EmptyState 
                        icon={<Code2 className="w-8 h-8" />} 
                        title="No Skills Listed" 
                        description="This candidate has not listed any skills yet." 
                    />
                )}
            </GlassCard>
        </TabsContent>

        {/* PROJECTS TAB */}
        <TabsContent value="projects">
            <GlassCard className="p-6">
                <div className="mb-6">
                     <h3 className="font-semibold text-lg flex items-center gap-2">
                        <FolderGit2 className="w-5 h-5 text-primary" /> Project Portfolio
                    </h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    {projects.map((project: any) => (
                        <div key={project.id} className="group flex flex-col justify-between p-5 rounded-xl border border-border bg-card hover:bg-muted/30 hover:border-primary/30 transition-all h-full">
                             <div className="space-y-4">
                                 <div className="flex items-start justify-between">
                                     <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                         <FolderGit2 className="h-6 w-6 text-primary" />
                                     </div>
                                     <div className="flex gap-2">
                                        {project.homepage && (
                                            <a 
                                                href={project.homepage} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg hover:bg-background text-muted-foreground hover:text-primary transition-colors"
                                                title="View Demo"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                        {project.repoUrl && (
                                            <a 
                                                href={project.repoUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg hover:bg-background text-muted-foreground hover:text-primary transition-colors"
                                                title="View Code"
                                            >
                                                <Github className="w-4 h-4" />
                                            </a>
                                        )}
                                     </div>
                                 </div>
                                 
                                 <div>
                                     <h4 className="font-semibold text-lg line-clamp-1" title={project.name}>
                                        {project.name}
                                     </h4>
                                     <p className="text-sm text-muted-foreground mt-2 line-clamp-2 min-h-[40px]">
                                        {project.description || 'No description provided for this project.'}
                                     </p>
                                 </div>
                             </div>

                             <div className="mt-4 pt-4 border-t border-border/50">
                                 <div className="flex flex-wrap gap-2 mb-3">
                                     {project.language && (
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900">
                                            {project.language}
                                        </Badge>
                                     )}
                                     {project.topics?.slice(0, 2).map((topic: string) => (
                                         <Badge key={topic} variant="outline" className="text-xs">{topic}</Badge>
                                     ))}
                                 </div>
                                 
                                 <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                                     <span className="flex items-center gap-1.5 hover:text-amber-500 transition-colors">
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" /> 
                                        {formatNumber(project.stars || 0)}
                                     </span>
                                     <span className="flex items-center gap-1.5">
                                        <GitBranch className="w-4 h-4" /> 
                                        {formatNumber(project.forks || 0)}
                                     </span>
                                     {(project.commits || 0) > 0 && (
                                        <span className="flex items-center gap-1.5 ml-auto text-xs opacity-70">
                                            <Clock className="w-3 h-3" /> 
                                            {formatNumber(project.commits)} commits
                                        </span>
                                     )}
                                 </div>
                             </div>
                        </div>
                    ))}
                     {projects.length === 0 && (
                        <div className="col-span-full">
                            <EmptyState 
                                icon={<FolderGit2 className="w-10 h-10 text-muted-foreground" />}
                                title="No Projects Found"
                                description="This candidate has not chosen to showcase any projects yet or they are hidden from recruiters."
                            />
                        </div>
                     )}
                </div>
            </GlassCard>
        </TabsContent>

        {/* EXPERIENCE TAB */}
        <TabsContent value="experience" className="space-y-6">
             <div className="grid md:grid-cols-2 gap-6">
                 {/* Work History */}
                 <GlassCard className="p-6">
                     <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
                         <Briefcase className="w-5 h-5 text-primary" /> Work History
                     </h3>
                     <div className="space-y-8">
                         {experiences.map((exp: any, idx: number) => (
                             <div key={idx} className="relative pl-6 border-l-2 border-border/50 pb-2 last:border-0 last:pb-0">
                                 <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-background bg-primary" />
                                 <div>
                                     <h4 className="font-medium text-base">{exp.title}</h4>
                                     <p className="text-primary/80 font-medium">{exp.organization}</p>
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                         <Calendar className="w-3.5 h-3.5" />
                                         <span>
                                             {exp.startDate ? new Date(exp.startDate).getFullYear() : 'Unknown'} - 
                                             {exp.isCurrent ? ' Present' : (exp.endDate ? ` ${new Date(exp.endDate).getFullYear()}` : '')}
                                         </span>
                                     </div>
                                     {exp.description && (
                                         <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>
                                     )}
                                 </div>
                             </div>
                         ))}
                         {experiences.length === 0 && (
                             <p className="text-center text-muted-foreground text-sm italic py-4">No work experience listed.</p>
                         )}
                     </div>
                 </GlassCard>

                 {/* Education */}
                 <GlassCard className="p-6">
                     <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
                         <GraduationCap className="w-5 h-5 text-blue-500" /> Education
                     </h3>
                     <div className="space-y-6">
                         {educationList.map((edu: any, idx: number) => (
                             <div key={idx} className="flex gap-4">
                                 <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                     <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                 </div>
                                 <div>
                                     <h4 className="font-medium">{edu.degree || edu.title}</h4>
                                     <p className="text-sm text-muted-foreground">{edu.school || edu.institution || edu.organization}</p>
                                     <p className="text-xs text-muted-foreground mt-1">
                                          {edu.startDate ? new Date(edu.startDate).getFullYear() : 'Unknown'} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                                     </p>
                                 </div>
                             </div>
                         ))}
                         {educationList.length === 0 && (
                             <p className="text-center text-muted-foreground text-sm italic py-4">No education listed.</p>
                         )}
                     </div>
                 </GlassCard>
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
  )
}
