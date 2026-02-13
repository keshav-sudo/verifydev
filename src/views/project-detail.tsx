"use client"

/**
 * Project Detail Page — Premium Analytics Dashboard
 * Full-depth rendering of Go Engine analysis output
 * Sections: Hero → Verdict → Dimensions → Skills → Architecture → Quality → Trust → Confidence → Graph → Git
 */

import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { get, post } from '@/api/client'
import { formatNumber, cn } from '@/lib/utils'
import {
  ArrowLeft, ExternalLink, Star, GitFork, GitCommit,
  Github, Sparkles, Code, Layers, ChevronDown, ChevronUp, Server, Zap,
  TrendingUp, CheckCircle2, AlertTriangle, Target, Brain, Eye, BarChart3,
  GraduationCap, ShieldCheck, FileCheck, Network, Lightbulb, TestTube,
  Wrench, Rocket, MessageSquare, Activity, Shield, Cpu,
  Box, Database, Terminal, Gauge, Hash, ArrowUpRight,
  CircleDot, Workflow, Flame, Award, Package, Quote,
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip as RechartsTooltip, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

// ============================================
// TYPES
// ============================================
interface ProjectData {
  id: string
  repoName: string
  description?: string
  stars: number
  forks: number
  language: string
  analysisStatus: string
  analyzedAt: string
  auraContribution: number
  overallScore?: number
  repoUrl: string
  commits?: number
  contributors?: number
  fullAnalysis: any
  industryAnalysis: any
  complexity: any
  languages: Record<string, number>
  metrics: any
  gitDetails?: any
}

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#14b8a6']

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-blue-400'
  if (score >= 40) return 'text-amber-400'
  return 'text-red-400'
}

const getScoreStroke = (score: number) => {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#3b82f6'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

// ============================================
// CIRCULAR SCORE
// ============================================
function CircularScore({ value, size = 120, label, strokeWidth = 8 }: { value: number; size?: number; label?: string; strokeWidth?: number }) {
  const safeValue = isNaN(value) ? 0 : Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth * 2) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (safeValue / 100) * circumference

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="hsl(var(--muted)/0.3)" strokeWidth={strokeWidth} fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={getScoreStroke(safeValue)} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold tracking-tight", getScoreColor(safeValue), size >= 100 ? "text-3xl" : size >= 70 ? "text-xl" : "text-lg")}>
          {Math.round(safeValue)}
        </span>
        {label && <span className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  )
}

// ============================================
// CONFIDENCE BAR
// ============================================
function ConfidenceBar({ value, label, color = 'primary' }: { value: number; label?: string; color?: string }) {
  const pct = Math.round(value > 1 ? value : value * 100)
  const colorMap: Record<string, string> = {
    primary: 'bg-primary', emerald: 'bg-emerald-500', blue: 'bg-blue-500',
    amber: 'bg-amber-500', purple: 'bg-purple-500', cyan: 'bg-cyan-500',
    rose: 'bg-rose-500', orange: 'bg-orange-500',
  }
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        {label && <span className="text-xs text-muted-foreground font-medium">{label}</span>}
        <span className={cn("text-xs font-bold", getScoreColor(pct))}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", colorMap[color] || 'bg-primary')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ============================================
// SKELETON LOADER
// ============================================
function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen pb-12">
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-64 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectDetail() {
  const params = useParams()
  const id = params?.id as string
  const [showAllSkills, setShowAllSkills] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await get<{ project: ProjectData }>(`/v1/projects/${id}`)
      return response.project
    },
    enabled: !!id,
  })

  const queryClient = useQueryClient()
  const gitFetchTriggered = useRef(false)

  // Auto-fetch git details from GitHub if not yet populated
  useEffect(() => {
    if (project && !project.gitDetails && !gitFetchTriggered.current && project.analysisStatus === 'completed') {
      gitFetchTriggered.current = true
      post(`/v1/projects/${id}/git-details/fetch`)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['project', id] })
        })
        .catch(() => {
          // silently fail — git details are optional
        })
    }
  }, [project, id, queryClient])

  // ── Extract all data (must be before any early returns so hooks stay stable) ──
  const fa = project?.fullAnalysis || {}
  const industry = project?.industryAnalysis || {}
  const verifiedSkills = useMemo(() => fa.verifiedSkills || industry.verifiedSkills || [], [fa.verifiedSkills, industry.verifiedSkills])
  const overallScore = project?.overallScore || project?.auraContribution || 0
  const gitDetails = project?.gitDetails || null
  const techGraph = fa.techDependencyGraph || {}
  const confidenceReport = fa.confidenceReport || {}
  const metrics = fa.metrics || {}
  const codeQuality = fa.codeQuality || {}
  const architecture = fa.architecture || {}
  const dimensionalAnalysis = fa.dimensionalAnalysis || {}
  const verdict = fa.verdict || {}
  const trustAnalysis = fa.trustAnalysis || {}
  const experienceAnalysis = fa.experienceAnalysis || {}
  const complexity = fa.complexity || project?.complexity || {}
  const folderStructure = fa.folderStructure || {}
  const techStack = fa.techStack || {}
  const bestPractices = fa.bestPractices || {}
  const scores = fa.scores || {}
  const optimizations = fa.optimizations || []
  const infraSignals = fa.infraSignals || {}
  const reactAnalysis = fa.reactAnalysis || null

  const commits = gitDetails?.totalCommits || project?.commits || 0

  // Process languages for pie chart
  const languagesData = useMemo(() => {
    const entries = Object.entries(project?.languages || {}).map(([name, bytes]) => ({ name, value: bytes as number, percentage: 0 }))
    const total = entries.reduce((sum, l) => sum + l.value, 0)
    entries.forEach(l => { l.percentage = total > 0 ? (l.value / total) * 100 : 0 })
    return entries.sort((a, b) => b.value - a.value)
  }, [project?.languages])

  // Skills by category
  const skillsByCategory = useMemo(() => {
    const cats: Record<string, typeof verifiedSkills> = {}
    verifiedSkills.forEach((s: any) => {
      const cat = s.category?.replace('_legacy', '') || 'other'
      if (!cats[cat]) cats[cat] = []
      cats[cat].push(s)
    })
    return Object.entries(cats).sort((a, b) => b[1].length - a[1].length)
  }, [verifiedSkills])

  const resumeReadyCount = verifiedSkills.filter((s: any) => s.resumeReady).length
  const highConfCount = verifiedSkills.filter((s: any) => (s.confidence || 0) >= 0.7).length

  if (isLoading) return <ProjectDetailSkeleton />

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full border-border/50">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Project Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error ? 'Failed to load project data' : 'This project does not exist'}
            </p>
            <Button asChild><Link href="/projects"><ArrowLeft className="h-4 w-4 mr-2" />Back to Projects</Link></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/5">
        <div className="w-full max-w-[98%] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 py-6 space-y-8">

          {/* ═══════════════════════════════════════════════════════ */}
          {/* HERO HEADER                                            */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card via-card/95 to-card/80">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative p-6 lg:p-10">
              {/* Back */}
              <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6 group">
                <div className="p-1 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </div>
                Back to Projects
              </Link>

              {/* Title Row */}
              <div className="flex flex-col xl:flex-row gap-8 items-start justify-between mb-8">
                <div className="flex items-start gap-6 flex-1 min-w-0">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-violet-500/10 border border-primary/25 flex items-center justify-center shrink-0 shadow-lg shadow-primary/5">
                    <Github className="w-10 h-10 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <h1 className="text-4xl lg:text-5xl font-bold tracking-tight truncate bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                        {project.repoName}
                      </h1>
                      {project.language && (
                        <Badge variant="secondary" className="gap-1.5 py-1 text-sm"><CircleDot className="h-3.5 w-3.5 text-primary" />{project.language}</Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className={cn("py-1 text-sm border-0", project.analysisStatus === 'completed' ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20' : 'bg-muted text-muted-foreground')}>
                        {project.analysisStatus === 'completed' ? 'Verified Analysis' : project.analysisStatus}
                      </Badge>
                      {verdict.developerLevel && (
                        <Badge className="bg-violet-500/10 text-violet-500 ring-1 ring-violet-500/20 py-1 text-sm border-0">{verdict.developerLevel}</Badge>
                      )}

                      {complexity.scaleLabel && (
                        <Badge variant="outline" className="gap-1.5 py-1 text-sm"><Gauge className="h-3.5 w-3.5" />{complexity.scaleLabel}</Badge>
                      )}
                    </div>

                    {project.description && (
                      <p className="text-base text-muted-foreground/90 max-w-4xl leading-relaxed">{project.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                   <Button size="lg" className="shadow-lg shadow-primary/20 gap-2 w-full sm:w-auto">
                    <Star className="h-4 w-4" /> Follow Project
                   </Button>
                   <Button variant="outline" size="lg" asChild className="shrink-0 gap-2 w-full sm:w-auto">
                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />View Source
                    </a>
                  </Button>
                </div>
              </div>

              {/* Stats Grid - Now wider and cleaner */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <MiniStat icon={Star} label="Stars" value={formatNumber(project.stars)} />
                <MiniStat icon={GitFork} label="Forks" value={formatNumber(project.forks)} />
                <MiniStat icon={GitCommit} label="Commits" value={formatNumber(commits)} />
                <MiniStat icon={Code} label="Total Files" value={formatNumber(metrics.totalFiles || 0)} />
                <MiniStat icon={Hash} label="Lines of Code" value={formatNumber(metrics.totalLines || 0)} />
                <MiniStat icon={Zap} label="Aura Points" value={`+${formatNumber(project.auraContribution)}`} highlight />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* NAVIGATION TABS                                        */}
          {/* ═══════════════════════════════════════════════════════ */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full justify-start bg-card/50 border border-border/40 rounded-xl p-1 h-auto flex-wrap">
              <TabsTrigger value="overview" className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
                <Eye className="h-3.5 w-3.5" />Overview
              </TabsTrigger>
              <TabsTrigger value="skills" className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
                <Sparkles className="h-3.5 w-3.5" />Skills ({verifiedSkills.length})
              </TabsTrigger>
              <TabsTrigger value="architecture" className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
                <Layers className="h-3.5 w-3.5" />Architecture
              </TabsTrigger>
              <TabsTrigger value="quality" className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
                <ShieldCheck className="h-3.5 w-3.5" />Quality & Trust
              </TabsTrigger>
              <TabsTrigger value="intelligence" className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
                <Brain className="h-3.5 w-3.5" />Intelligence
              </TabsTrigger>
            </TabsList>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* TAB: OVERVIEW                                          */}
            {/* ═══════════════════════════════════════════════════════ */}
            <TabsContent value="overview" className="space-y-6">


              {/* Score + Dimensions Row */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Overall Score */}
                <Card className="border-border/40 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
                    <CircularScore value={Math.round(overallScore)} size={150} label="Overall" />
                    <div className="grid grid-cols-3 gap-3 w-full">
                      <ScorePill label="Skills" value={verifiedSkills.length} />
                      <ScorePill label="Resume" value={resumeReadyCount} color="emerald" />
                      <ScorePill label="High Conf" value={highConfCount} color="blue" />
                    </div>
                  </CardContent>
                </Card>

                {/* Dimensional Analysis */}
                <Card className="border-border/40 bg-card/50 lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4 text-primary" />6-Dimensional Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DimensionalSection dimensional={dimensionalAnalysis} />
                  </CardContent>
                </Card>
              </div>

              {/* Language Distribution + Complexity */}
              <div className="grid lg:grid-cols-2 gap-6">
                <LanguageCard languages={languagesData} />
                <ComplexityCard complexity={complexity} scores={scores} />
              </div>

              {/* Top Skills Preview */}
              {verifiedSkills.length > 0 && (
                <Card className="border-border/40 bg-card/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" />Top Verified Skills</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('skills')} className="text-xs gap-1">
                        View All <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {verifiedSkills.slice(0, 6).map((skill: any, i: number) => (
                        <SkillCardCompact key={i} skill={skill} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
                            {/* Verdict Card */}
              {verdict && Object.keys(verdict).length > 0 && (
                <VerdictCard verdict={verdict} />
              )}

            </TabsContent>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* TAB: SKILLS                                            */}
            {/* ═══════════════════════════════════════════════════════ */}
            <TabsContent value="skills" className="space-y-6">
              {/* Skills Summary */}
              <div className="grid sm:grid-cols-4 gap-4">
                <StatBox icon={Sparkles} label="Total Skills" value={verifiedSkills.length} color="primary" />
                <StatBox icon={Award} label="Resume Ready" value={resumeReadyCount} color="emerald" />
                <StatBox icon={Target} label="High Confidence" value={highConfCount} color="blue" />
                <StatBox icon={CheckCircle2} label="Usage Verified" value={verifiedSkills.filter((s: any) => s.usageVerified).length} color="violet" />
              </div>

              {/* Skills by Category */}
              {skillsByCategory.map(([category, skills]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <CategoryIcon category={category} />
                    <h3 className="text-sm font-semibold capitalize">{category.replace(/_/g, ' ')}</h3>
                    <Badge variant="outline" className="text-xs ml-1">{skills.length}</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(showAllSkills ? skills : skills.slice(0, 6)).map((skill: any, i: number) => (
                      <SkillCardFull key={i} skill={skill} />
                    ))}
                  </div>
                  {skills.length > 6 && !showAllSkills && (
                    <Button variant="ghost" size="sm" onClick={() => setShowAllSkills(true)} className="mt-2 text-xs">
                      +{skills.length - 6} more <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              ))}

              {showAllSkills && (
                <div className="flex justify-center">
                  <Button variant="outline" size="sm" onClick={() => setShowAllSkills(false)}>
                    Show Less <ChevronUp className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* TAB: ARCHITECTURE                                      */}
            {/* ═══════════════════════════════════════════════════════ */}
            <TabsContent value="architecture" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <ArchitectureCard architecture={architecture} />
                <TechStackCard techStack={techStack} />
              </div>

              {/* Tech Dependency Graph */}
              {techGraph && (techGraph.totalNodes > 0 || Object.keys(techGraph).length > 0) && (
                <TechGraphCard graph={techGraph} />
              )}

              {/* Folder Structure */}
              <FolderStructureCard structure={folderStructure} />

              {/* Infrastructure Signals */}
              {infraSignals.signals?.length > 0 && (
                <Card className="border-border/40 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><Server className="h-4 w-4 text-cyan-400" />Infrastructure Signals ({infraSignals.signals.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {infraSignals.signals.map((sig: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs capitalize">{sig.replace(/_/g, ' ')}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* React Analysis */}
              {reactAnalysis && <ReactAnalysisCard react={reactAnalysis} />}
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* TAB: QUALITY & TRUST                                   */}
            {/* ═══════════════════════════════════════════════════════ */}
            <TabsContent value="quality" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <CodeQualityCard codeQuality={codeQuality} metrics={metrics} />
                <TrustCard trust={trustAnalysis} />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <ExperienceCard experience={experienceAnalysis} />
                <BestPracticesCard practices={bestPractices} />
              </div>

              {/* Optimizations */}
              {optimizations.length > 0 && (
                <OptimizationsCard optimizations={optimizations} />
              )}
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* TAB: INTELLIGENCE                                      */}
            {/* ═══════════════════════════════════════════════════════ */}
            <TabsContent value="intelligence" className="space-y-6">
              {/* Confidence Report */}
              {confidenceReport && Object.keys(confidenceReport).length > 0 && (
                <ConfidenceReportCard report={confidenceReport} />
              )}

              {/* Git Details — from GitHub API */}
              {gitDetails && (
                <GitDetailsCard details={gitDetails} />
              )}

              {/* Bayesian Skill Confidences */}
              {confidenceReport.skillConfidences?.length > 0 && (
                <BayesianSkillsCard skills={confidenceReport.skillConfidences} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function MiniStat({ icon: Icon, label, value, highlight }: any) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl border border-border/30 bg-card/40",
      highlight && "border-primary/25 bg-primary/5"
    )}>
      <Icon className={cn("h-4 w-4 shrink-0", highlight ? "text-primary" : "text-muted-foreground")} />
      <div className="min-w-0">
        <p className={cn("text-lg font-bold leading-none", highlight && "text-primary")}>{value}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// HireSignalBadge removed — hire signal no longer generated by Go engine

function ScorePill({ label, value, color = 'primary' }: { label: string; value: number; color?: string }) {
  const colors: Record<string, string> = {
    primary: 'text-primary', emerald: 'text-emerald-400', blue: 'text-blue-400',
  }
  return (
    <div className="text-center p-2 rounded-lg bg-muted/20 border border-border/20">
      <p className={cn("text-xl font-bold", colors[color])}>{value}</p>
      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  )
}

function StatBox({ icon: Icon, label, value, color }: any) {
  const colorMap: Record<string, string> = {
    primary: 'from-primary/10 to-primary/5 border-primary/20 text-primary',
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400',
    violet: 'from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400',
    amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
  }
  return (
    <div className={cn("rounded-xl bg-gradient-to-br border p-4", colorMap[color])}>
      <div className="flex items-center gap-2 mb-1"><Icon className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</span></div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

function CategoryIcon({ category }: { category: string }) {
  const map: Record<string, any> = {
    language: <Code className="h-4 w-4 text-blue-400" />,
    framework: <Package className="h-4 w-4 text-violet-400" />,
    database: <Database className="h-4 w-4 text-emerald-400" />,
    devops: <Rocket className="h-4 w-4 text-orange-400" />,
    infrastructure: <Server className="h-4 w-4 text-cyan-400" />,
    cloud: <Box className="h-4 w-4 text-sky-400" />,
    testing: <TestTube className="h-4 w-4 text-green-400" />,
    messaging: <MessageSquare className="h-4 w-4 text-amber-400" />,
    architecture: <Layers className="h-4 w-4 text-purple-400" />,
    tool: <Wrench className="h-4 w-4 text-slate-400" />,
    security: <Shield className="h-4 w-4 text-red-400" />,
    observability: <Activity className="h-4 w-4 text-teal-400" />,
    library: <Package className="h-4 w-4 text-indigo-400" />,
    ml: <Brain className="h-4 w-4 text-pink-400" />,
  }
  return map[category] || <CircleDot className="h-4 w-4 text-muted-foreground" />
}


function TechIcon({ name, showName }: { name: string; showName?: boolean }) {
  const iconUrl = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name.toLowerCase()}/${name.toLowerCase()}-original.svg`
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/30">
      <img src={iconUrl} alt={name} className="w-3.5 h-3.5" onError={(e) => (e.currentTarget.style.display = 'none')} />
      {showName && <span className="text-[10px] font-medium text-muted-foreground capitalize">{name}</span>}
    </div>
  )
}

// ── VERDICT ──
function VerdictCard({ verdict }: any) {
  return (
    <Card className="border-border/40 bg-card/50 overflow-hidden shadow-sm">
      <CardHeader className="pb-4 border-b border-border/20 bg-muted/5">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 shadow-inner">
                <Brain className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Analysis Verdict</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">AI-Powered Assessment & Reasoning</p>
              </div>
           </div>

        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/20">
          
          {/* LEFT COLUMN: Summary & Justification */}
          <div className="lg:col-span-2 p-6 space-y-8">
            
            {/* Introduction Badges */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-violet-500/5 border border-violet-500/10">
                <div className="p-1.5 rounded-full bg-violet-500/10"><Zap className="h-4 w-4 text-violet-500" /></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-violet-500/70 tracking-wider">Level</p>
                  <p className="text-sm font-bold text-foreground">{verdict.developerLevel || 'Unknown'}</p>
                </div>
              </div>

               <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <div className="p-1.5 rounded-full bg-blue-500/10"><Target className="h-4 w-4 text-blue-500" /></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-blue-500/70 tracking-wider">Intent</p>
                  <p className="text-sm font-bold text-foreground">{verdict.projectIntent || 'General'}</p>
                </div>
              </div>

              {verdict.overallScore != null && (
                 <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
                  <CircularScore value={Math.round(verdict.overallScore)} size={32} strokeWidth={4} />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-primary/70 tracking-wider">Score</p>
                    <p className="text-sm font-bold text-foreground">{Math.round(verdict.overallScore)}/100</p>
                  </div>
                </div>
              )}
            </div>

            {/* AI Summary */}
            {verdict.summary && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Executive Summary</h4>
                <p className="text-sm leading-relaxed text-muted-foreground/90 bg-muted/5 p-4 rounded-xl border border-border/40">
                  {verdict.summary}
                </p>
              </div>
            )}

            {/* Senior Explanation */}
            {verdict.justification && (
              <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-blue-600/5 via-violet-600/5 to-primary/5 border border-blue-500/10">
                 <div className="absolute top-0 right-0 p-3 opacity-10"><Quote className="h-12 w-12 text-primary" /></div>
                 <h4 className="text-xs font-bold uppercase text-blue-500 mb-3 flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Senior Engineer Assessment</h4>
                 <p className="text-sm leading-relaxed text-foreground/80 italic relative z-10">"{verdict.justification}"</p>
              </div>
            )}
            
            {/* Tech Stack Icons */}
            {verdict.techStack?.length > 0 && (
               <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-4">Core Technology Stack</h4>
                  <div className="flex flex-wrap gap-4">
                    {verdict.techStack.map((t: string, i: number) => (
                      <TechIcon key={i} name={t} showName />
                    ))}
                  </div>
               </div>
            )}
          </div>

          {/* RIGHT COLUMN: Signals & Analysis */}
          <div className="p-6 space-y-6 bg-muted/5">
            {/* Strengths & Growth */}
            <div className="space-y-6">
               {verdict.strengths?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-emerald-600 mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Key Strengths</h4>
                  <ul className="space-y-2.5">
                    {verdict.strengths.slice(0, 4).map((s: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2.5 bg-card/50 p-2.5 rounded-lg border border-emerald-500/10">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {verdict.growthAreas?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-amber-600 mb-3 flex items-center gap-2"><Target className="h-4 w-4" /> Growth Focus</h4>
                  <ul className="space-y-2.5">
                    {verdict.growthAreas.slice(0, 3).map((g: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2.5 bg-card/50 p-2.5 rounded-lg border border-amber-500/10">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Signals Grid */}
            <div className="pt-4 border-t border-border/20 space-y-4">
               
               {(verdict.riskSignals?.length > 0 || verdict.strengthSignals?.length > 0) && (
                 <div className="grid grid-cols-1 gap-2">
                    {verdict.strengthSignals?.slice(0, 2).map((s: string, i: number) => (
                      <div key={`s-${i}`} className="px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-muted-foreground flex gap-2 items-center">
                        <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {s}
                      </div>
                    ))}
                    {verdict.riskSignals?.slice(0, 2).map((r: string, i: number) => (
                      <div key={`r-${i}`} className="px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10 text-[11px] text-muted-foreground flex gap-2 items-center">
                         <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" /> {r}
                      </div>
                    ))}
                 </div>
               )}

               {verdict.keySignals?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Platform Signals</p>
                  <div className="flex flex-wrap gap-1.5">
                    {verdict.keySignals.slice(0, 5).map((s: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-card text-[10px] px-2 py-0.5 font-normal text-muted-foreground">{s}</Badge>
                    ))}
                  </div>
                </div>
               )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── DIMENSIONAL ──
function DimensionalSection({ dimensional }: any) {
  const dims = [
    { key: 'fundamentals', label: 'Fundamentals', score: dimensional.fundamentalsScore, conf: dimensional.fundamentalsConfidence, icon: Code, color: '#3b82f6' },
    { key: 'engineeringDepth', label: 'Engineering', score: dimensional.engineeringDepthScore, conf: dimensional.engineeringDepthConfidence, icon: Wrench, color: '#8b5cf6' },
    { key: 'productionReadiness', label: 'Production', score: dimensional.productionReadinessScore, conf: dimensional.productionReadinessConfidence, icon: Rocket, color: '#10b981' },
    { key: 'testingMaturity', label: 'Testing', score: dimensional.testingMaturityScore, conf: dimensional.testingMaturityConfidence, icon: TestTube, color: '#f59e0b' },
    { key: 'architecture', label: 'Architecture', score: dimensional.architectureScore, conf: dimensional.architectureConfidence, icon: Layers, color: '#ec4899' },
    { key: 'infraDevOps', label: 'DevOps', score: dimensional.infraDevOpsScore, conf: dimensional.infraDevOpsConfidence, icon: Server, color: '#06b6d4' },
  ].filter(d => d.score != null)

  if (dims.length === 0) return <p className="text-sm text-muted-foreground">No dimensional data available</p>

  const radarData = dims.map(d => ({ subject: d.label, score: Math.round(d.score || 0), fullMark: 100 }))

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border)/0.4)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
            <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
            <RechartsTooltip contentStyle={{ borderRadius: '10px', backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: '12px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {dims.map(dim => {
          const score = Math.round(dim.score || 0)
          const Icon = dim.icon
          return (
            <div key={dim.key} className="group">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${dim.color}20` }}>
                  <Icon className="w-3 h-3" style={{ color: dim.color }} />
                </div>
                <span className="text-xs font-medium flex-1">{dim.label}</span>
                <span className={cn("text-sm font-bold tabular-nums", getScoreColor(score))}>{score}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/25 overflow-hidden ml-8">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: dim.color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── SKILL CARDS ──
function SkillCardCompact({ skill }: { skill: any }) {
  const conf = skill.confidence ? Math.round(skill.confidence * 100) : 0
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-card/40 hover:bg-card/60 transition">
      <CircularScore value={conf} size={44} strokeWidth={4} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{skill.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge variant="outline" className="text-[10px] capitalize h-4 px-1.5">{skill.category?.replace('_legacy', '')}</Badge>
          {skill.resumeReady && <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px] h-4 px-1.5">Resume ✓</Badge>}
        </div>
      </div>
    </div>
  )
}

function SkillCardFull({ skill }: { skill: any }) {
  const conf = skill.confidence ? Math.round(skill.confidence * 100) : 0
  return (
    <Card className="border-border/30 bg-card/40 hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm truncate">{skill.name}</h4>
            <div className="flex flex-wrap items-center gap-1 mt-1">
              <Badge variant="outline" className="text-[10px] capitalize h-4 px-1.5">{skill.category?.replace('_legacy', '')}</Badge>
              {skill.resumeReady && <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px] h-4 px-1.5">Resume Ready</Badge>}
              {skill.usageVerified && <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/20 text-[10px] h-4 px-1.5">Verified</Badge>}
            </div>
          </div>
          <CircularScore value={conf} size={48} strokeWidth={4} />
        </div>

        {/* Evidence */}
        {skill.richEvidence?.summary?.length > 0 && (
          <div className="mt-2 space-y-1 border-t border-border/15 pt-2">
            {skill.richEvidence.summary.slice(0, 3).map((s: string, i: number) => (
              <p key={i} className="text-[11px] text-muted-foreground leading-snug">• {s}</p>
            ))}
          </div>
        )}
        {!skill.richEvidence?.summary?.length && skill.evidence?.length > 0 && (
          <div className="mt-2 space-y-1 border-t border-border/15 pt-2">
            {skill.evidence.slice(0, 2).map((e: string, i: number) => (
              <p key={i} className="text-[11px] text-muted-foreground leading-snug">• {e}</p>
            ))}
          </div>
        )}

        {/* Usage Strength */}
        {skill.usageStrength != null && skill.usageStrength > 0 && (
          <div className="mt-2">
            <ConfidenceBar value={skill.usageStrength} label="Usage Strength" color="cyan" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── LANGUAGE CARD ──
function LanguageCard({ languages }: { languages: any[] }) {
  if (languages.length === 0) return null
  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base"><Code className="h-4 w-4 text-primary" />Languages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie data={languages} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={2} dataKey="percentage">
                {languages.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-1.5">
            {languages.slice(0, 6).map((lang, i) => (
              <div key={lang.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-xs flex-1 truncate">{lang.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{lang.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── COMPLEXITY CARD ──
function ComplexityCard({ complexity, scores }: any) {
  if (!complexity?.totalScore && Object.keys(scores || {}).length === 0) return null

  const scoreItems = [
    { label: 'Architecture', value: complexity?.architectureScore || scores?.structure || 0 },
    { label: 'Infrastructure', value: complexity?.infrastructureScore || scores?.techStack || 0 },
    { label: 'Code Quality', value: complexity?.codeQualityScore || scores?.codeQuality || 0 },
    { label: 'Testing', value: scores?.testing || 0 },
    { label: 'Documentation', value: scores?.documentation || 0 },
  ].filter(s => s.value > 0)

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-4 w-4 text-amber-400" />Complexity & Scores
          {complexity?.scaleLabel && <Badge variant="outline" className="ml-auto text-xs">{complexity.scaleLabel}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {complexity?.totalScore != null && (
          <div className="flex items-center justify-center mb-4">
            <CircularScore value={Math.min(100, complexity.totalScore)} size={100} label="Total" strokeWidth={6} />
          </div>
        )}
        <div className="space-y-2.5">
          {scoreItems.map(item => (
            <div key={item.label}>
              <div className="flex justify-between mb-0.5">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-xs font-semibold">{Math.round(item.value)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/25 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500" style={{ width: `${Math.min(100, item.value * 5)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ── ARCHITECTURE CARD ──
function ArchitectureCard({ architecture }: any) {
  if (!architecture || Object.keys(architecture).length === 0) return null
  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-4 w-4 text-violet-400" />System Architecture
          {architecture.serviceCount > 0 && <Badge variant="outline" className="ml-auto text-xs">{architecture.serviceCount} Services</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-violet-500/5 border border-violet-500/15 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Architecture Type</p>
            <p className="text-lg font-bold text-violet-400">{architecture.type || 'Standard'}</p>
          </div>
          <Layers className="h-8 w-8 text-violet-500/30" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {architecture.engineeringLevel && (
            <div className="p-3 rounded-lg bg-muted/15 border border-border/15 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Engineering Level</p>
              <p className="text-sm font-bold">{architecture.engineeringLevel}</p>
            </div>
          )}
          {architecture.gateway && (
            <div className="p-3 rounded-lg bg-muted/15 border border-border/15 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Gateway</p>
              <p className="text-sm font-bold text-cyan-400">{architecture.gateway}</p>
            </div>
          )}
        </div>

        {architecture.services?.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Services</p>
            <div className="flex flex-wrap gap-1.5">{architecture.services.map((s: string, i: number) => <Badge key={i} variant="secondary" className="text-xs gap-1"><Server className="h-2.5 w-2.5" />{s}</Badge>)}</div>
          </div>
        )}

        {architecture.communication?.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Communication</p>
            <div className="flex flex-wrap gap-1.5">{architecture.communication.map((c: string, i: number) => <Badge key={i} variant="outline" className="text-xs capitalize">{c.replace(/_/g, ' ')}</Badge>)}</div>
          </div>
        )}

        {architecture.patterns?.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Patterns</p>
            <div className="flex flex-wrap gap-1.5">{architecture.patterns.map((p: string, i: number) => <Badge key={i} className="bg-violet-500/10 text-violet-400 border-violet-500/15 text-xs">{p}</Badge>)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── TECH STACK CARD ──
function TechStackCard({ techStack }: any) {
  if (!techStack || Object.keys(techStack).length === 0) return null
  const sections = [
    { label: 'Frameworks', items: techStack.frameworks, color: 'violet' },
    { label: 'Databases', items: techStack.databases, color: 'emerald' },
    { label: 'Tools', items: techStack.tools, color: 'amber' },
    { label: 'Infrastructure', items: techStack.infrastructure, color: 'cyan' },
    { label: 'Languages', items: techStack.languages, color: 'blue' },
  ].filter(s => s.items?.length > 0)

  if (sections.length === 0) return null

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Workflow className="h-4 w-4 text-primary" />Tech Stack</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map(section => (
          <div key={section.label}>
            <p className="text-xs text-muted-foreground mb-1.5">{section.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {section.items.map((item: any, i: number) => {
                const label = typeof item === 'object' ? (item.name || JSON.stringify(item)) : item
                return (
                  <Badge key={i} variant="secondary" className="text-xs">{label}</Badge>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ── TECH GRAPH CARD ──
function TechGraphCard({ graph }: any) {
  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Network className="h-4 w-4 text-primary" />Tech Dependency Graph</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <MetricTile label="Nodes" value={graph.totalNodes || 0} color="primary" />
          <MetricTile label="Edges" value={graph.totalEdges || 0} color="blue" />
          <MetricTile label="Density" value={(graph.graphDensity || 0).toFixed(2)} color="emerald" />
        </div>

        {/* Clusters */}
        {graph.clusters?.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-primary" />Technology Clusters</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {graph.clusters.map((c: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-muted/10 border border-border/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{Math.round((c.strength || 0) * 100)}%</span>
                  </div>
                  <div className="flex flex-wrap gap-1">{c.technologies?.map((t: string, j: number) => <Badge key={j} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detected Stacks */}
        {graph.detectedStacks?.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-2">Detected Stacks</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {graph.detectedStacks.map((s: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-muted/10 border border-border/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{Math.round((s.confidence || 0) * 100)}%</span>
                  </div>
                  {s.matched?.length > 0 && <div className="flex flex-wrap gap-1">{s.matched.map((t: string, j: number) => <Badge key={j} variant="outline" className="text-[10px]">{t}</Badge>)}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inferred Skills */}
        {graph.inferredSkills?.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Brain className="h-3.5 w-3.5 text-violet-400" />Graph-Inferred Skills</p>
            <div className="space-y-2">
              {graph.inferredSkills.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 border border-border/15">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{s.reasoning}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize shrink-0">{s.level}</Badge>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">{Math.round(s.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MetricTile({ label, value, color }: { label: string; value: any; color: string }) {
  const colors: Record<string, string> = {
    primary: 'text-primary', blue: 'text-blue-400', emerald: 'text-emerald-400',
    violet: 'text-violet-400', amber: 'text-amber-400', rose: 'text-rose-400',
  }
  return (
    <div className="p-3 rounded-xl bg-muted/15 border border-border/20 text-center">
      <p className={cn("text-2xl font-bold tabular-nums", colors[color])}>{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  )
}

// ── CODE QUALITY CARD ──
function CodeQualityCard({ codeQuality, metrics }: any) {
  const checks = [
    { label: 'README', value: codeQuality.hasReadme, icon: '📄' },
    { label: 'License', value: codeQuality.hasLicense, icon: '📜' },
    { label: '.gitignore', value: codeQuality.hasGitignore, icon: '🔒' },
    { label: 'TypeScript', value: codeQuality.hasTypeScript, icon: '🔷' },
    { label: 'Linting', value: codeQuality.hasLinting, icon: '🧹' },
    { label: 'Prettier', value: codeQuality.hasPrettier, icon: '✨' },
    { label: 'Docker', value: codeQuality.hasDockerfile, icon: '🐳' },
    { label: 'Compose', value: codeQuality.hasDockerCompose, icon: '🔗' },
    { label: 'CI/CD', value: codeQuality.hasCI, icon: '⚡' },
    { label: 'Env Example', value: codeQuality.hasEnvExample, icon: '🔧' },
    { label: 'Makefile', value: codeQuality.hasMakefile, icon: '⚙️' },
  ].filter(c => c.value != null)

  const passed = checks.filter(c => c.value).length

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-3 border-b border-border/15">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileCheck className="h-4 w-4 text-emerald-400" />Code Quality
          <Badge variant="outline" className="ml-auto text-xs">{passed}/{checks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {metrics && (metrics.totalLines || metrics.totalFiles) && (
          <div className="grid grid-cols-3 gap-3">
            <MetricTile label="Lines" value={metrics.totalLines?.toLocaleString() || 0} color="primary" />
            <MetricTile label="Files" value={metrics.totalFiles || 0} color="blue" />
            <MetricTile label="Tests" value={codeQuality.testFilesCount || 0} color="emerald" />
          </div>
        )}
        {codeQuality.ciPlatform && (
          <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs">
            <span className="text-muted-foreground">CI Platform: </span><span className="font-medium">{codeQuality.ciPlatform}</span>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {checks.map((check, i) => (
            <div key={i} className={cn("flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs", check.value ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-muted/5 border-border/10 text-muted-foreground/60')}>
              <span>{check.icon}</span>
              <span className="flex-1 truncate">{check.label}</span>
              {check.value ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ── TRUST CARD ──
function TrustCard({ trust }: any) {
  if (!trust || Object.keys(trust).length === 0) return null
  const trustColors: Record<string, string> = {
    'HIGH': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    'VERIFIED': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    'MEDIUM': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    'LOW': 'bg-red-500/15 text-red-400 border-red-500/25',
    'UNVERIFIED': 'bg-muted text-muted-foreground',
  }

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-3 border-b border-border/15">
        <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4 text-emerald-400" />Trust & Authenticity</CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className={cn("p-3 rounded-xl border text-center", trustColors[trust.level] || trustColors.LOW)}>
            <ShieldCheck className="h-5 w-5 mx-auto mb-1" />
            <p className="text-[10px] opacity-70">Trust</p>
            <p className="text-sm font-bold">{trust.level || '—'}</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <CircularScore value={trust.score || 0} size={65} strokeWidth={5} />
            <p className="text-[10px] text-muted-foreground mt-1">Trust Score</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <CircularScore value={trust.authenticityScore || 0} size={65} strokeWidth={5} />
            <p className="text-[10px] text-muted-foreground mt-1">Authenticity</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {trust.effortClass && (
            <Badge className={cn(
              trust.effortClass === 'SUBSTANTIAL' || trust.effortClass === 'MAJOR' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' :
              trust.effortClass === 'MODERATE' || trust.effortClass === 'SIGNIFICANT' ? 'bg-blue-500/15 text-blue-400 border-blue-500/25' :
              'bg-amber-500/15 text-amber-400 border-amber-500/25'
            )}>
              <Activity className="h-3 w-3 mr-1" />Effort: {trust.effortClass}
            </Badge>
          )}
          {trust.hasOriginalWork != null && (
            <Badge className={trust.hasOriginalWork ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : 'bg-red-500/15 text-red-400 border-red-500/25'}>
              {trust.hasOriginalWork ? '✓ Original Work' : '✗ Not Original'}
            </Badge>
          )}
        </div>

        {trust.authenticityFlags?.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Authenticity Flags</p>
            <div className="space-y-1">
              {trust.authenticityFlags.map((flag: string, i: number) => {
                const isWarning = flag.includes('[CRITICAL]') || flag.includes('[high]')
                const isInfo = flag.includes('[INFO]')
                return (
                  <div key={i} className={cn("text-[11px] p-2 rounded-lg border", isWarning ? 'text-red-400 bg-red-500/5 border-red-500/10' : isInfo ? 'text-blue-400 bg-blue-500/5 border-blue-500/10' : 'text-muted-foreground bg-muted/5 border-border/10')}>
                    {flag}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── EXPERIENCE CARD ──
function ExperienceCard({ experience }: any) {
  if (!experience || Object.keys(experience).length === 0) return null
  const levelConfig: Record<string, { label: string; emoji: string; color: string }> = {
    'INTERN': { label: 'Intern', emoji: '🌱', color: 'bg-green-500/15 text-green-400 border-green-500/25' },
    'JUNIOR': { label: 'Junior', emoji: '🌱', color: 'bg-green-500/15 text-green-400 border-green-500/25' },
    'MID_LEVEL': { label: 'Mid-Level', emoji: '⚡', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
    'SENIOR': { label: 'Senior', emoji: '🔥', color: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
    'STAFF': { label: 'Staff', emoji: '👑', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
    'PRINCIPAL': { label: 'Principal', emoji: '🏆', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  }
  const info = levelConfig[experience.level] || { label: experience.level, emoji: '📊', color: 'bg-muted' }

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><GraduationCap className="h-4 w-4 text-blue-400" />Experience</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={cn("px-5 py-3 rounded-2xl border text-center", info.color)}>
            <p className="text-2xl mb-0.5">{info.emoji}</p>
            <p className="text-sm font-bold">{info.label}</p>
            {experience.yearRange && <p className="text-[10px] mt-0.5 opacity-70">{experience.yearRange}</p>}
          </div>
          {experience.confidence != null && (
            <CircularScore value={Math.round(experience.confidence * 100)} size={80} label="Confidence" strokeWidth={5} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ── BEST PRACTICES CARD ──
function BestPracticesCard({ practices }: any) {
  if (!practices || ((!practices.followed || practices.followed.length === 0) && (!practices.missing || practices.missing.length === 0))) return null

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />Best Practices
          {practices.score != null && <Badge variant="outline" className="ml-auto text-xs">Score: {Math.round(practices.score)}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {practices.followed?.length > 0 && (
          <div>
            <p className="text-xs text-emerald-400 font-medium mb-1.5">✓ Followed ({practices.followed.length})</p>
            <div className="space-y-1">{practices.followed.map((p: string, i: number) => <p key={i} className="text-[11px] text-muted-foreground pl-3">• {p}</p>)}</div>
          </div>
        )}
        {practices.missing?.length > 0 && (
          <div>
            <p className="text-xs text-amber-400 font-medium mb-1.5">✗ Missing ({practices.missing.length})</p>
            <div className="space-y-1">{practices.missing.map((p: string, i: number) => <p key={i} className="text-[11px] text-muted-foreground pl-3">• {p}</p>)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── OPTIMIZATIONS CARD ──
function OptimizationsCard({ optimizations }: any) {
  const priorityColors: Record<number, string> = {
    1: 'bg-red-500/10 text-red-400 border-red-500/15',
    2: 'bg-amber-500/10 text-amber-400 border-amber-500/15',
    3: 'bg-blue-500/10 text-blue-400 border-blue-500/15',
  }

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="h-4 w-4 text-amber-400" />Improvement Suggestions ({optimizations.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {optimizations.map((opt: any, i: number) => (
            <div key={i} className={cn("p-3 rounded-xl border", priorityColors[opt.priority] || priorityColors[3])}>
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-medium">{opt.title || opt.category}</p>
                <Badge variant="outline" className="text-[10px] shrink-0 ml-2">P{opt.priority || 3}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{opt.description}</p>
              {opt.impact && <p className="text-[10px] text-muted-foreground mt-1 italic">Impact: {opt.impact}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ── REACT ANALYSIS CARD ──
function ReactAnalysisCard({ react }: any) {
  const hooks = [
    { label: 'Hooks', value: react.usesHooks },
    { label: 'Context', value: react.usesContext },
    { label: 'Reducer', value: react.usesReducer },
    { label: 'Memo', value: react.usesMemo },
    { label: 'Callback', value: react.usesCallback },
    { label: 'Ref', value: react.usesRef },
    { label: 'Lazy Loading', value: react.usesLazyLoading },
    { label: 'Error Boundary', value: react.usesErrorBoundary },
  ].filter(h => h.value != null)

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">⚛️ React Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {react.componentCount != null && <MetricTile label="Components" value={react.componentCount} color="primary" />}
          {react.customHooksCount != null && <MetricTile label="Custom Hooks" value={react.customHooksCount} color="blue" />}
          {react.stateManagement && <div className="p-3 rounded-xl bg-muted/15 border border-border/20 text-center col-span-2"><p className="text-sm font-bold">{react.stateManagement}</p><p className="text-[10px] text-muted-foreground uppercase">State Mgmt</p></div>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {hooks.map((h, i) => (
            <div key={i} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs", h.value ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-muted/5 border-border/10 text-muted-foreground/50')}>
              {h.value ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <AlertTriangle className="h-3 w-3 text-muted-foreground/30" />}
              {h.label}
            </div>
          ))}
        </div>
        {react.patternsDetected?.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Patterns</p>
            <div className="flex flex-wrap gap-1.5">{react.patternsDetected.map((p: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── FOLDER STRUCTURE CARD ──
function FolderStructureCard({ structure }: any) {
  if (!structure || Object.keys(structure).length === 0) return null
  const dirs = [
    { label: 'src/', value: structure.hasSrcFolder },
    { label: 'components/', value: structure.hasComponents },
    { label: 'utils/', value: structure.hasUtils },
    { label: 'tests/', value: structure.hasTests },
    { label: 'types/', value: structure.hasTypes },
    { label: 'config/', value: structure.hasConfig },
    { label: 'docs/', value: structure.hasDocs },
    { label: 'api/', value: structure.hasApi },
    { label: 'services/', value: structure.hasServices },
    { label: 'models/', value: structure.hasModels },
    { label: 'middleware/', value: structure.hasMiddleware },
    { label: 'controllers/', value: structure.hasControllers },
    { label: 'internal/', value: structure.hasInternal },
    { label: 'pkg/', value: structure.hasPkg },
    { label: 'cmd/', value: structure.hasCmd },
    { label: 'gateway/', value: structure.hasGateway },
  ].filter(d => d.value != null)

  if (dirs.length === 0) return null

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Terminal className="h-4 w-4 text-primary" />Project Structure
          {structure.maxDepth && <Badge variant="outline" className="ml-auto text-xs">Depth: {structure.maxDepth}</Badge>}
          {structure.organizationScore && <Badge variant="outline" className="text-xs ml-1">Org: {Math.round(structure.organizationScore)}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
          {dirs.map((dir, i) => (
            <div key={i} className={cn("flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-mono", dir.value ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-muted/5 border-border/10 text-muted-foreground/50')}>
              {dir.value ? <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" /> : <span className="w-3 h-3 shrink-0" />}
              {dir.label}
            </div>
          ))}
        </div>
        {structure.topLevelFolders?.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1">Top-Level Folders</p>
            <div className="flex flex-wrap gap-1">{structure.topLevelFolders.map((f: string, i: number) => <Badge key={i} variant="outline" className="text-[10px] font-mono">{f}/</Badge>)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── CONFIDENCE REPORT CARD ──
function ConfidenceReportCard({ report }: any) {
  const qm = report.qualityMetrics || {}
  const es = report.evolutionSignals || {}
  const ev = report.ensembleVerdict || {}

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="h-4 w-4 text-violet-400" />Bayesian Confidence Report
          {ev.scoreLabel && <Badge className="ml-auto">{ev.scoreLabel}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Ensemble Scores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'AST', value: ev.astScore },
            { label: 'Graph', value: ev.graphScore },
            { label: 'Infra', value: ev.infraScore },
            { label: 'Intelligence', value: ev.intelligenceScore },
            { label: 'Quality', value: ev.qualityScore },
            { label: 'Git', value: ev.gitScore },
            { label: 'Final Score', value: ev.finalScore },
            { label: 'Confidence', value: ev.confidence },
          ].filter(i => i.value != null).map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-muted/15 border border-border/20 text-center">
              <p className={cn("text-xl font-bold tabular-nums", getScoreColor(item.value || 0))}>{Math.round(item.value || 0)}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Skills Summary */}
        <div className="flex items-center justify-around p-3 rounded-xl border border-border/20 bg-muted/10">
          <div className="text-center">
            <p className="text-xl font-bold text-primary tabular-nums">{ev.totalSkills || 0}</p>
            <p className="text-[10px] text-muted-foreground">Total Skills</p>
          </div>
          <div className="w-px h-8 bg-border/20" />
          <div className="text-center">
            <p className="text-xl font-bold text-emerald-400 tabular-nums">{ev.resumeReadySkills || 0}</p>
            <p className="text-[10px] text-muted-foreground">Resume Ready</p>
          </div>
          <div className="w-px h-8 bg-border/20" />
          <div className="text-center">
            <p className="text-xl font-bold text-blue-400 tabular-nums">{ev.highConfSkills || 0}</p>
            <p className="text-[10px] text-muted-foreground">High Conf</p>
          </div>
        </div>

        {/* Top/Risk Factors */}
        <div className="grid sm:grid-cols-2 gap-3">
          {ev.topFactors?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-emerald-400 mb-1.5">Top Factors</p>
              <div className="space-y-1">{ev.topFactors.map((f: string, i: number) => <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5"><TrendingUp className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />{f}</p>)}</div>
            </div>
          )}
          {ev.riskFactors?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-400 mb-1.5">Risk Factors</p>
              <div className="space-y-1">{ev.riskFactors.map((f: string, i: number) => <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5"><AlertTriangle className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />{f}</p>)}</div>
            </div>
          )}
        </div>

        {/* Quality Metrics */}
        {Object.keys(qm).length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-2">Quality Metrics</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: 'Organization', value: qm.organizationScore },
                { label: 'Modularity', value: qm.modularityScore },
                { label: 'Test Coverage', value: qm.testCoverageProxy },
                { label: 'Documentation', value: qm.documentationScore },
                { label: 'Complexity', value: qm.complexityScore },
                { label: 'Prod Ready', value: qm.productionReadiness },
                { label: 'Overall Quality', value: qm.overallQuality },
              ].filter(m => m.value != null).map((m, i) => (
                <ConfidenceBar key={i} value={m.value} label={m.label} color={m.value >= 70 ? 'emerald' : m.value >= 40 ? 'amber' : 'rose'} />
              ))}
            </div>
            {qm.qualityTier && <Badge variant="outline" className="text-xs mt-2 capitalize">Tier: {qm.qualityTier}</Badge>}
          </div>
        )}

        {/* Evolution Signals */}
        {Object.keys(es).length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-2">Evolution Signals</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {es.authorshipLevel && <div className="p-2 rounded-lg bg-muted/10 border border-border/15 text-center"><p className="text-xs font-bold">{es.authorshipLevel}</p><p className="text-[9px] text-muted-foreground">Authorship</p></div>}
              {es.developmentPattern && <div className="p-2 rounded-lg bg-muted/10 border border-border/15 text-center"><p className="text-xs font-bold capitalize">{es.developmentPattern}</p><p className="text-[9px] text-muted-foreground">Pattern</p></div>}
              {es.projectAge && <div className="p-2 rounded-lg bg-muted/10 border border-border/15 text-center"><p className="text-xs font-bold capitalize">{es.projectAge}</p><p className="text-[9px] text-muted-foreground">Age</p></div>}
              {es.iterationCount != null && <div className="p-2 rounded-lg bg-muted/10 border border-border/15 text-center"><p className="text-xs font-bold">{es.iterationCount}</p><p className="text-[9px] text-muted-foreground">Iterations</p></div>}
              {es.refactorRatio != null && <div className="p-2 rounded-lg bg-muted/10 border border-border/15 text-center"><p className="text-xs font-bold">{(es.refactorRatio * 100).toFixed(0)}%</p><p className="text-[9px] text-muted-foreground">Refactor</p></div>}
              {es.commitConsistency != null && <div className="p-2 rounded-lg bg-muted/10 border border-border/15 text-center"><p className="text-xs font-bold">{(es.commitConsistency * 100).toFixed(0)}%</p><p className="text-[9px] text-muted-foreground">Consistency</p></div>}
            </div>
          </div>
        )}

        {/* Analysis Confidence */}
        {report.analysisConfidence != null && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-primary/5 border border-violet-500/15 flex items-center gap-4">
            <CircularScore value={Math.round(report.analysisConfidence * 100)} size={60} strokeWidth={4} label="Meta" />
            <div>
              <p className="text-sm font-semibold">Analysis Confidence</p>
              <p className="text-xs text-muted-foreground">How confident the engine is in this analysis</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── GIT DETAILS CARD (GitHub API Data) ──
function GitDetailsCard({ details }: { details: any }) {
  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return '—' } }
  const contributors = details.contributors || []
  const commitFrequency = details.commitFrequency || []
  const languageBreakdown = details.languageBreakdown || {}
  const primaryAuthorPct = details.primaryAuthorPct != null
    ? (details.primaryAuthorPct <= 1 ? Math.round(details.primaryAuthorPct * 100) : Math.round(details.primaryAuthorPct))
    : 0

  // Commit activity chart data (last 12 weeks)
  const commitChartData = commitFrequency.slice(-12).map((week: any, i: number) => ({
    week: `W${i + 1}`,
    commits: week.total || 0,
  }))

  // Language pie data
  const langEntries = Object.entries(languageBreakdown).map(([name, bytes]) => ({ name, value: bytes as number, percentage: 0 }))
  const langTotal = langEntries.reduce((sum, l) => sum + l.value, 0)
  langEntries.forEach(l => { l.percentage = langTotal > 0 ? (l.value / langTotal) * 100 : 0 })
  const langData = langEntries.sort((a, b) => b.value - a.value).slice(0, 8)

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-3 border-b border-border/20">
        <CardTitle className="flex items-center gap-2 text-base">
          <Github className="h-4 w-4 text-primary" />GitHub Repository Insights
        </CardTitle>
        <p className="text-xs text-muted-foreground">Live data from GitHub API</p>
      </CardHeader>
      <CardContent className="p-0">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-6 pb-4">
          <MetricTile label="Total Commits" value={formatNumber(details.totalCommits || 0)} color="primary" />
          <MetricTile label="Contributors" value={details.totalContributors || 0} color="violet" />
          <MetricTile label="Primary Author" value={`${primaryAuthorPct}%`} color="emerald" />
          <MetricTile label="Stars" value={formatNumber(details.stars || 0)} color="amber" />
          <MetricTile label="Forks" value={formatNumber(details.forks || 0)} color="blue" />
          <MetricTile label="Open Issues" value={details.openIssues || 0} color="rose" />
        </div>

        {/* Date range */}
        <div className="flex gap-4 px-6 pb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/5 border border-purple-500/10">
            <span className="text-[10px] text-muted-foreground uppercase">First Commit</span>
            <span className="text-xs font-semibold text-purple-400">{formatDate(details.firstCommitDate)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
            <span className="text-[10px] text-muted-foreground uppercase">Last Commit</span>
            <span className="text-xs font-semibold text-cyan-400">{formatDate(details.lastCommitDate)}</span>
          </div>
          {details.isActive != null && (
            <Badge className={cn("text-xs border-0 py-1", details.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground')}>
              {details.isActive ? '● Active' : '○ Inactive'}
            </Badge>
          )}
        </div>

        {/* Two-column layout: Commit Activity + Contributors */}
        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/20">
          {/* Commit Activity Chart */}
          {commitChartData.length > 0 && (
            <div className="p-6 space-y-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-primary" />Weekly Commit Activity
              </h4>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={commitChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.15)" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={30} />
                  <RechartsTooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="commits" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Contributors */}
          {contributors.length > 0 && (
            <div className="p-6 space-y-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5 text-emerald-400" />Top Contributors ({contributors.length})
              </h4>
              <div className="space-y-2">
                {contributors.slice(0, 5).map((c: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/8 border border-border/10 hover:bg-muted/15 transition">
                    {c.avatarUrl && (
                      <img src={c.avatarUrl} alt={c.login} className="w-7 h-7 rounded-full ring-1 ring-border/30" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.login}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {c.commits} commits · <span className="text-emerald-400">+{formatNumber(c.additions || 0)}</span> <span className="text-red-400">-{formatNumber(c.deletions || 0)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Language Breakdown */}
        {langData.length > 0 && (
          <div className="p-6 border-t border-border/20 space-y-3">
            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Language Breakdown</h4>
            <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted/20">
              {langData.map((lang, i) => (
                <div
                  key={lang.name}
                  className="h-full transition-all duration-500"
                  style={{ width: `${lang.percentage}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  title={`${lang.name}: ${lang.percentage.toFixed(1)}%`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {langData.map((lang, i) => (
                <div key={lang.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-[11px] text-muted-foreground">{lang.name}</span>
                  <span className="text-[10px] font-medium text-foreground/70">{lang.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── BAYESIAN SKILLS CARD ──
function BayesianSkillsCard({ skills }: { skills: any[] }) {
  const sorted = [...skills].sort((a, b) => (b.posterior || 0) - (a.posterior || 0))

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Flame className="h-4 w-4 text-orange-400" />Bayesian Skill Posteriors ({skills.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sorted.map((skill, i) => {
            const posterior = Math.round((skill.posterior || 0) * 100)
            return (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/8 border border-border/10 hover:bg-muted/15 transition">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{skill.skillName}</p>
                    {skill.resumeReady && <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[9px] capitalize h-4 px-1">{skill.category}</Badge>
                    <span className="text-[10px] text-muted-foreground">Prior: {Math.round((skill.prior || 0) * 100)}%</span>
                    {skill.usageVerified && <span className="text-[10px] text-blue-400">✓ Used</span>}
                  </div>
                </div>
                <div className="w-24 shrink-0">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[10px] text-muted-foreground">Posterior</span>
                    <span className={cn("text-xs font-bold tabular-nums", getScoreColor(posterior))}>{posterior}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/25 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${posterior}%`, backgroundColor: getScoreStroke(posterior) }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
