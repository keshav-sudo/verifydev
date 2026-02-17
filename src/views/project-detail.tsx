"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { get } from '@/api/client'
import { formatNumber, cn } from '@/lib/utils'
import {
  ArrowLeft, ExternalLink, Star, GitFork, GitCommit,
  Github, Sparkles, Code, Layers, Server, Zap,
  TrendingUp, AlertTriangle, Target, Brain, Eye, BarChart3,
  ShieldCheck, FileCheck, TestTube,
  Wrench, Rocket, Activity,
  Gauge,
  CheckSquare, Square, Users, Search
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { Input } from '@/components/ui/input'

// ============================================
// CONSTANTS & HELPERS
// ============================================
const CHART_COLORS = ['#3178C6', '#EAB308', '#00ADD8', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-[#65A30D]' 
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-amber-500'
  return 'text-red-500'
}

const getScoreStroke = (score: number) => {
  if (score >= 80) return '#84CC16'
  if (score >= 60) return '#3B82F6'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}

// ============================================
// SHARP COMPONENTS
// ============================================
function CircularScore({ value, size = 80, label, strokeWidth = 6 }: { value: number; size?: number; label?: string; strokeWidth?: number }) {
  const safeValue = isNaN(value) ? 0 : Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth * 2) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (safeValue / 100) * circumference

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={getScoreStroke(safeValue)} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-black tracking-tight", size >= 80 ? "text-2xl" : "text-lg")}>
          {Math.round(safeValue)}
        </span>
        {label && <span className="text-[8px] text-slate-500 mt-0.5 font-extrabold uppercase tracking-widest">{label}</span>}
      </div>
    </div>
  )
}

function ConfidenceBar({ value, label, color = 'primary' }: { value: number; label?: string; color?: string }) {
  const pct = Math.round(value > 1 ? value : value * 100)
  const colorMap: Record<string, string> = {
    primary: 'bg-slate-900', emerald: 'bg-[#84CC16]', blue: 'bg-blue-500',
    amber: 'bg-amber-500', purple: 'bg-purple-500', cyan: 'bg-cyan-500',
    rose: 'bg-rose-500', orange: 'bg-orange-500',
  }
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        {label && <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{label}</span>}
        <span className={cn("text-[10px] font-black", getScoreColor(pct))}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-sm bg-slate-100 overflow-hidden">
        <div className={cn("h-full rounded-sm transition-all duration-700", colorMap[color] || 'bg-slate-900')} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value, highlight }: any) {
  return (
    <div className={cn(
      "flex items-center gap-2.5 px-3 py-2 rounded-md border bg-white/5 backdrop-blur-sm transition-colors",
      highlight ? "border-[#84CC16]/30 bg-[#84CC16]/5" : "border-white/10"
    )}>
      <div className={cn("p-1.5 rounded-sm", highlight ? "bg-[#84CC16]/10" : "bg-white/5")}>
        <Icon className={cn("h-3.5 w-3.5", highlight ? "text-[#84CC16]" : "text-slate-400")} />
      </div>
      <div className="min-w-0">
        <p className={cn("text-sm font-black leading-none tabular-nums", highlight ? "text-[#ADFF2F]" : "text-white")}>{value}</p>
        <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5 font-bold">{label}</p>
      </div>
    </div>
  )
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function ProjectDetail() {
  const params = useParams()
  const id = params?.id as string
  const [activeTab, setActiveTab] = useState('overview')
  const [skillSearch, setSkillSearch] = useState('')

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await get<{ project: any }>(`/v1/projects/${id}`)
      return response.project
    },
    enabled: !!id,
  })

  if (isLoading) return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center"><Activity className="w-8 h-8 animate-spin text-slate-400" /></div>
  if (error || !project) return <div className="text-center py-20 font-bold text-slate-500">Project not found</div>

  // Data Extraction
  const fa = project.fullAnalysis || {}
  const industry = project.industryAnalysis || {}
  const verifiedSkills = industry.verifiedSkills || fa.verifiedSkills || []
  const overallScore = project.overallScore || 0
  const gitDetails = project.gitDetails || null
  const metrics = project.metrics || fa.metrics || {}
  const codeQuality = fa.codeQuality || {}
  const architecture = fa.architecture || {}
  const dimensionalAnalysis = fa.dimensionalAnalysis || {}
  const trustAnalysis = fa.trustAnalysis || {}
  const complexity = project.complexity || fa.complexity || {}
  const infraSignals = fa.infraSignals || {}
  const verdict = fa.verdict || {}
  const commits = gitDetails?.totalCommits || project.commits || 0

  const languagesData = Object.entries(project.languages || {}).map(([name, bytes]) => ({ name, value: bytes as number, percentage: 0 }))
  const totalBytes = languagesData.reduce((sum, l) => sum + l.value, 0)
  languagesData.forEach(l => { l.percentage = totalBytes > 0 ? (l.value / totalBytes) * 100 : 0 })
  languagesData.sort((a, b) => b.value - a.value)

  const filteredSkills = verifiedSkills.filter((s: any) => s.name.toLowerCase().includes(skillSearch.toLowerCase()))

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#F0F2F5] relative font-['Plus_Jakarta_Sans'] text-slate-800 pb-20">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>

        <div className="max-w-[1536px] mx-auto px-4 md:px-6 lg:px-8 py-6 relative z-10 space-y-4">

          {/* ═══════════════════════════════════════════════════════ */}
          {/* COMPACT TERMINAL HERO                                   */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div className="bg-[#0A0A0A] rounded-lg border border-slate-800 p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ADFF2F]/5 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row gap-5 items-start justify-between relative z-10">
              {/* Left Side: Identity */}
              <div className="flex items-start gap-4">
                  <Link href="/projects" className="mt-1 h-8 w-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-white line-clamp-1 mb-1">{project.repoName}</h1>
                    <p className="text-xs text-slate-400 leading-snug font-medium line-clamp-1 max-w-2xl">{project.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {project.language && (
                        <div className="px-2 py-0.5 bg-white/10 text-white border border-white/10 rounded-sm text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />{project.language}
                        </div>
                      )}
                      <div className={cn("px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-sm border", project.analysisStatus === 'completed' ? 'bg-[#84CC16]/20 text-[#ADFF2F] border-[#84CC16]/30' : 'bg-slate-800 text-slate-400 border-slate-700')}>
                        {project.analysisStatus === 'completed' ? '✓ Verified' : project.analysisStatus}
                      </div>
                      {trustAnalysis?.level === 'LOW' && (
                        <div className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-sm text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Warning
                        </div>
                      )}
                    </div>
                  </div>
              </div>
              
              {/* Right Side: Stats & Action */}
              <div className="flex flex-col items-end gap-3 w-full lg:w-auto">
                 <Button asChild className="bg-[#ADFF2F] hover:bg-[#84CC16] text-slate-900 gap-1.5 rounded-sm h-8 px-4 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" />View Source</a>
                </Button>
                
                {/* Horizontal Minified Stats */}
                <div className="flex items-center gap-2">
                  <MiniStat icon={Star} label="Stars" value={formatNumber(project.stars || 0)} />
                  <MiniStat icon={GitFork} label="Forks" value={formatNumber(project.forks || 0)} />
                  <MiniStat icon={GitCommit} label="Commits" value={formatNumber(commits)} />
                  <MiniStat icon={Zap} label="Aura" value={`+${formatNumber(project.auraContribution)}`} highlight />
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* COMPACT TABS                                          */}
          {/* ═══════════════════════════════════════════════════════ */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="w-full justify-start bg-transparent p-0 h-auto flex-wrap gap-1 border-b border-slate-200 pb-0 rounded-none">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'skills', label: 'Skills & Tech', icon: Sparkles, count: verifiedSkills.length },
                { id: 'git', label: 'Git Insights', icon: Github },
                { id: 'architecture', label: 'Architecture', icon: Layers },
                { id: 'quality', label: 'Health & Trust', icon: ShieldCheck },
              ].map(tab => (
                <TabsTrigger 
                  key={tab.id} value={tab.id} 
                  className="gap-1.5 px-4 py-2.5 data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-slate-900 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent hover:text-slate-700 transition-all font-extrabold text-slate-500 text-[10px] uppercase tracking-widest"
                >
                  <tab.icon className="h-3.5 w-3.5" />{tab.label}
                  {tab.count != null && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm text-[8px] ml-1">{tab.count}</span>}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* TAB: OVERVIEW                                         */}
            {/* ═══════════════════════════════════════════════════════ */}
            <TabsContent value="overview" className="space-y-4">
              
              <div className="grid lg:grid-cols-12 gap-4">
                
                {/* Left Col: Main Scores & Verdict */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Score Board */}
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Project Score</h2>
                      <div className="text-5xl font-black text-slate-900 leading-none">{overallScore}</div>
                      {industry.engineeringLevel && <div className="mt-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-100 inline-block uppercase tracking-wider">{industry.engineeringLevel}</div>}
                    </div>
                    <CircularScore value={overallScore} size={90} strokeWidth={6} />
                  </div>

                  {/* Verdict Block */}
                  {verdict.summary && (
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900">AI Verdict</h2>
                      </div>
                      <div className="p-5 space-y-4">
                        <p className="text-xs font-bold text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">"{verdict.summary}"</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {verdict.strengths?.length > 0 && (
                            <div>
                              <p className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Strengths</p>
                              <ul className="space-y-1">{verdict.strengths.map((s:string, i:number) => <li key={i} className="text-[10px] font-medium text-slate-600 flex items-start gap-1"><span className="text-emerald-500 mt-0.5">•</span>{s}</li>)}</ul>
                            </div>
                          )}
                          {verdict.growthAreas?.length > 0 && (
                            <div>
                              <p className="text-[9px] font-extrabold text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Target className="w-3 h-3" /> Growth</p>
                              <ul className="space-y-1">{verdict.growthAreas.map((s:string, i:number) => <li key={i} className="text-[10px] font-medium text-slate-600 flex items-start gap-1"><span className="text-amber-500 mt-0.5">•</span>{s}</li>)}</ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Complexity Block */}
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
                    <div className="flex justify-between items-center mb-4">
                       <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 flex items-center gap-1.5"><Gauge className="w-4 h-4 text-amber-500" /> Complexity</h2>
                       {complexity.scaleLabel && <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{complexity.scaleLabel}</span>}
                    </div>
                    <div className="space-y-3">
                       <ConfidenceBar value={complexity.totalScore || 0} label="Total Complexity" color="orange" />
                       <ConfidenceBar value={complexity.architectureScore || 0} label="Architecture" color="purple" />
                       <ConfidenceBar value={complexity.codeQualityScore || 0} label="Code Quality" color="blue" />
                    </div>
                  </div>
                </div>

                {/* Right Col: Dimensions & Languages */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Dimensional Analysis Radar */}
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100">
                      <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-900"><BarChart3 className="h-4 w-4 text-slate-400" />6-Dimensional Analysis</h2>
                    </div>
                    <div className="p-5">
                       <DimensionalSection dimensional={dimensionalAnalysis} />
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100">
                      <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-900"><Code className="h-4 w-4 text-blue-500" />Language Distribution</h2>
                    </div>
                    <div className="p-5 flex items-center gap-6">
                      <div className="w-24 h-24 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={languagesData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={2} dataKey="percentage">
                              {languagesData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        {languagesData.slice(0, 6).map((lang, i) => (
                          <div key={lang.name} className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-100 rounded-sm">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                              <span className="text-[10px] font-bold text-slate-700 truncate max-w-[80px]">{lang.name}</span>
                            </div>
                            <span className="text-[9px] font-black text-slate-500">{lang.percentage.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* TAB: SKILLS & TECH (List/Grid View)                     */}
            {/* ═══════════════════════════════════════════════════════ */}
            <TabsContent value="skills" className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-900">
                    <Sparkles className="h-4 w-4 text-purple-500" /> Extracted Skills
                  </h2>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input 
                      placeholder="Search skills..." 
                      value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)}
                      className="h-8 pl-8 text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-sm"
                    />
                  </div>
                </div>

                <div className="p-5">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredSkills.map((skill: any, i: number) => (
                         <div key={i} className="flex flex-col p-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-white transition-colors hover:shadow-sm">
                           <div className="flex justify-between items-start mb-2">
                             <div className="min-w-0 pr-2">
                               <h4 className="text-sm font-extrabold text-slate-900 truncate">{skill.name}</h4>
                               <div className="flex items-center gap-1.5 mt-1">
                                 <span className="text-[8px] font-extrabold uppercase tracking-widest bg-white border border-slate-200 px-1.5 py-0.5 rounded-[2px] text-slate-600">{skill.category?.replace('_legacy', '')}</span>
                                 <span className={cn("text-[8px] font-extrabold uppercase tracking-widest border px-1.5 py-0.5 rounded-[2px]", skill.level === 'expert' ? 'bg-purple-50 text-purple-700 border-purple-200' : skill.level === 'advanced' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200')}>{skill.level}</span>
                               </div>
                             </div>
                             <div className="shrink-0 bg-white border border-slate-100 p-1 rounded-sm shadow-sm">
                               <CircularScore value={skill.verifiedScore || skill.score || 0} size={32} strokeWidth={3} />
                             </div>
                           </div>
                           
                           {skill.evidence && skill.evidence.length > 0 && (
                             <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                               {skill.evidence.slice(0,2).map((e: string, j: number) => (
                                 <p key={j} className="text-[9px] text-slate-500 font-medium truncate flex items-center gap-1">
                                   <CheckSquare className="w-2.5 h-2.5 text-[#84CC16] shrink-0" /> {e}
                                 </p>
                               ))}
                             </div>
                           )}
                         </div>
                      ))}
                      {filteredSkills.length === 0 && <div className="col-span-full py-10 text-center text-xs font-bold text-slate-500">No skills match your search.</div>}
                   </div>
                </div>
              </div>
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* TAB: GIT INSIGHTS                                     */}
            {/* ═══════════════════════════════════════════════════════ */}
            <TabsContent value="git" className="space-y-4">
               {gitDetails ? (
                 <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-900"><Users className="h-4 w-4 text-blue-500" />Git Contributors</h2>
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">{gitDetails.totalContributors} Total</span>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {(gitDetails.contributors || []).slice(0, 12).map((c: any, i: number) => (
                           <div key={i} className="flex items-center gap-3 p-2.5 border border-slate-100 bg-slate-50 rounded-md hover:border-slate-300 transition-colors">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={c.avatarUrl} alt={c.login} className="w-8 h-8 rounded-sm border border-slate-200 bg-white" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-extrabold text-xs text-slate-900 truncate">{c.login}</h4>
                                <div className="flex items-center gap-2 mt-0.5 text-[9px] font-bold">
                                  <span className="text-slate-500"><GitCommit className="w-2.5 h-2.5 inline mr-0.5" />{c.commits}</span>
                                  <span className="text-emerald-600">+{formatNumber(c.additions)}</span>
                                  <span className="text-red-500">-{formatNumber(c.deletions)}</span>
                                </div>
                              </div>
                           </div>
                        ))}
                      </div>
                    </div>
                 </div>
               ) : (
                 <div className="text-center py-10 bg-white rounded-lg border border-slate-200 text-slate-500 text-xs font-bold">Git details are processing or unavailable.</div>
               )}
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* TAB: ARCHITECTURE                                     */}
            {/* ═══════════════════════════════════════════════════════ */}
            <TabsContent value="architecture" className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-4">
                 {/* Architecture Core */}
                 <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100">
                      <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-900"><Layers className="h-4 w-4 text-purple-500" />Architecture</h2>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md">
                        <div>
                           <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-0.5">Pattern</p>
                           <p className="text-sm font-black text-slate-900">{architecture.type || 'Standard'}</p>
                        </div>
                        <Layers className="h-5 w-5 text-slate-300" />
                      </div>
                      
                      {architecture.patterns && architecture.patterns.length > 0 && (
                        <div>
                          <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Patterns Detected</p>
                          <div className="flex flex-wrap gap-1">
                            {architecture.patterns.map((p: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-sm text-[9px] font-bold">{p}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                 </div>

                 {/* Infra Signals */}
                 <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100">
                      <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-900"><Server className="h-4 w-4 text-cyan-500" />Infra Signals</h2>
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap gap-1.5">
                        {(infraSignals.signals || []).map((sig: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-sm text-[9px] font-bold text-slate-700 uppercase tracking-wider">
                            {sig.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                 </div>
              </div>
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* TAB: HEALTH & TRUST                                   */}
            {/* ═══════════════════════════════════════════════════════ */}
            <TabsContent value="quality" className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-4">
                 
                 {/* Quality Metrics Render */}
                 <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100">
                      <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-900"><FileCheck className="h-4 w-4 text-emerald-500" />Code Health</h2>
                    </div>
                    <div className="p-5 space-y-4">
                      
                      <div className="grid grid-cols-3 gap-2 mb-4">
                         <div className="text-center p-2 bg-slate-50 border border-slate-100 rounded-sm">
                           <p className="text-lg font-black text-slate-900">{metrics.codeQuality || 0}</p>
                           <p className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest mt-0.5">Quality</p>
                         </div>
                         <div className="text-center p-2 bg-slate-50 border border-slate-100 rounded-sm">
                           <p className="text-lg font-black text-slate-900">{metrics.documentation || 0}</p>
                           <p className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest mt-0.5">Docs</p>
                         </div>
                         <div className="text-center p-2 bg-slate-50 border border-slate-100 rounded-sm">
                           <p className="text-lg font-black text-slate-900">{metrics.testCoverage || 0}</p>
                           <p className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest mt-0.5">Tests</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { label: 'README', val: codeQuality.hasReadme },
                          { label: 'License', val: codeQuality.hasLicense },
                          { label: 'Dockerfile', val: codeQuality.hasDockerfile },
                          { label: 'CI/CD', val: codeQuality.hasCI },
                          { label: 'Env Example', val: codeQuality.hasEnvExample },
                          { label: 'Docker Compose', val: codeQuality.hasDockerCompose }
                        ].map((chk, i) => (
                          <div key={i} className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-sm border text-[10px] font-bold", chk.val ? 'bg-emerald-50/50 border-emerald-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400')}>
                            <span className="flex-1 truncate uppercase tracking-wider">{chk.label}</span>
                            {chk.val ? <CheckSquare className="w-3 h-3 text-emerald-600" /> : <Square className="w-3 h-3 text-slate-300" />}
                          </div>
                        ))}
                      </div>
                    </div>
                 </div>

                 {/* Trust Analysis */}
                 <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100">
                      <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-900"><ShieldCheck className="h-4 w-4 text-blue-500" />Trust & Auth</h2>
                    </div>
                    <div className="p-5">
                       <div className="grid grid-cols-2 gap-3 items-center mb-4">
                         <div className={cn("text-center p-3 border rounded-md", trustAnalysis.level === 'LOW' ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200")}>
                            <p className={cn("text-xl font-black", trustAnalysis.level === 'LOW' ? "text-red-600" : "text-slate-900")}>{trustAnalysis.level || '—'}</p>
                            <p className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500 mt-1">Trust Level</p>
                         </div>
                         <div className="flex justify-center">
                           <CircularScore value={trustAnalysis.score || 0} size={70} strokeWidth={4} label="Score" />
                         </div>
                       </div>
                       
                       {trustAnalysis.authenticityFlags && trustAnalysis.authenticityFlags.length > 0 && (
                         <div className="space-y-1.5">
                           <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Alerts</p>
                           {trustAnalysis.authenticityFlags.map((flag: string, i: number) => (
                             <div key={i} className="flex items-start gap-1.5 p-2 rounded-sm bg-red-50/50 border border-red-100 text-[9px] font-bold text-red-800">
                               <AlertTriangle className="w-3 h-3 shrink-0 text-red-500" />
                               <span className="leading-tight">{flag}</span>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                 </div>
              </div>
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

function DimensionalSection({ dimensional }: any) {
  const dims = [
    { key: 'fundamentals', label: 'Fundamentals', score: dimensional.fundamentalsScore, icon: Code, color: '#3B82F6' },
    { key: 'engineeringDepth', label: 'Engineering', score: dimensional.engineeringDepthScore, icon: Wrench, color: '#8B5CF6' },
    { key: 'productionReadiness', label: 'Production', score: dimensional.productionReadinessScore, icon: Rocket, color: '#10B981' },
    { key: 'testingMaturity', label: 'Testing', score: dimensional.testingMaturityScore, icon: TestTube, color: '#F59E0B' },
    { key: 'architecture', label: 'Architecture', score: dimensional.architectureScore, icon: Layers, color: '#EC4899' },
    { key: 'infraDevOps', label: 'DevOps', score: dimensional.infraDevOpsScore, icon: Server, color: '#06B6D4' },
  ].filter(d => d.score != null)

  if (dims.length === 0) return <p className="text-sm text-slate-500">No dimensional data available</p>
  const radarData = dims.map(d => ({ subject: d.label, score: Math.round(d.score || 0), fullMark: 100 }))

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="flex items-center justify-center bg-slate-50 rounded-md border border-slate-100 p-1">
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 8, fontWeight: 800 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
            <Radar name="Score" dataKey="score" stroke="#0f172a" fill="#0f172a" fillOpacity={0.1} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3 justify-center flex flex-col">
        {dims.map(dim => {
          const score = Math.round(dim.score || 0)
          return (
            <div key={dim.key}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-[4px] flex items-center justify-center border" style={{ backgroundColor: `${dim.color}10`, borderColor: `${dim.color}30` }}>
                  <dim.icon className="w-2.5 h-2.5" style={{ color: dim.color }} />
                </div>
                <span className="text-[10px] font-extrabold text-slate-800 flex-1 uppercase tracking-wider">{dim.label}</span>
                <span className={cn("text-xs font-black tabular-nums", getScoreColor(score))}>{score}</span>
              </div>
              <div className="h-1 rounded-sm bg-slate-100 overflow-hidden ml-7">
                <div className="h-full rounded-sm transition-all duration-700" style={{ width: `${score}%`, backgroundColor: dim.color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}