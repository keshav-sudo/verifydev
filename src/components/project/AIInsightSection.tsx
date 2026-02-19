"use client"

import { useState } from 'react'
import {
  Brain, TrendingUp, Target, Briefcase, User, ArrowRight, CheckSquare,
  Sparkles, Code2, Rocket, Star, Lightbulb, AlertCircle,
  ChevronDown, ChevronUp, Zap, BookOpen, MessageSquare, ShieldCheck, Flag, Copy, AlertTriangle, GitFork,
  Terminal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AIInsightSectionProps {
  aiInsight?: any
  intelligenceVerdict?: any
  overallScore?: number
}

// ----------------------------------------------------------------------------
// CONFIGURATION Constants (Updated to match VerifyDev Theme)
// ----------------------------------------------------------------------------
const RECOMMENDATION_CONFIG: Record<string, { label: string; icon: any; bg: string; text: string; border: string; desc: string }> = {
  STRONG_HIRE: { label: 'Strong Hire',  icon: Rocket, bg: 'bg-[#ADFF2F]/10', text: 'text-[#65A30D]', border: 'border-[#ADFF2F]/20', desc: 'Production-ready engineer' },
  HIRE:        { label: 'Hire',         icon: ShieldCheck, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', desc: 'Solid mid-level candidate' },
  LEAN_HIRE:   { label: 'Lean Hire',    icon: Zap, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', desc: 'Junior, needs mentorship' },
  MAYBE:       { label: 'Maybe',        icon: Brain, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', desc: 'Needs further evaluation' },
  NO_HIRE:     { label: 'No Hire',      icon: AlertCircle, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', desc: 'Not ready for this role' },
}

const IMPACT_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; badgeText: string }> = {
  HIGH:   { label: 'High Priority',   icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50/50 border-amber-100', badgeText: 'text-amber-700 bg-amber-100' },
  MEDIUM: { label: 'Medium Priority', icon: Zap,           color: 'text-blue-600',  bg: 'bg-blue-50/50 border-blue-100', badgeText: 'text-blue-700 bg-blue-100' },
  LOW:    { label: 'Low Priority',    icon: Lightbulb,     color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', badgeText: 'text-slate-600 bg-slate-200' },
}

// ----------------------------------------------------------------------------
// HELPER Components
// ----------------------------------------------------------------------------
function CollapsibleCard({
  title, icon: Icon, iconColor = "text-slate-500", headerBg = "bg-slate-50/30", children, defaultOpen = true
}: {
  title: string; icon: any; iconColor?: string; headerBg?: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn("w-full px-6 py-4 flex items-center justify-between transition-colors border-b border-transparent hover:border-slate-100", headerBg)}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-white border border-slate-200 shadow-sm">
            <Icon className={cn("w-4 h-4", iconColor)} />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-900">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="border-t border-slate-100 bg-white">{children}</div>}
    </div>
  )
}

// ----------------------------------------------------------------------------
// MAIN Component
// ----------------------------------------------------------------------------
export default function AIInsightSection({ aiInsight, intelligenceVerdict, overallScore = 0 }: AIInsightSectionProps) {
  const insight = aiInsight || intelligenceVerdict
  if (!insight) return null

  // Data Extraction
  const projectTitle       = insight.projectTitle       || insight.title           || 'Project Analysis'
  const projectSummary     = insight.projectSummary     || insight.summary         || ''
  const whatYouBuilt       = insight.whatYouBuilt       || insight.skillsNarrative || ''
  const techHighlights     = insight.techHighlights     || []
  const impressivePatterns = insight.impressivePatterns || []
  const growthAreas        = insight.growthAreas        || []
  const learningPath       = insight.learningPath       || []
  const projectMaturity    = insight.projectMaturity    || ''

  const recruiterVerdict = insight.recruiterVerdict || {
    headline:        insight.title              || '',
    recommendation:  insight.hireRecommendation || 'MAYBE',
    confidenceLevel: insight.riskAnalysis       || '',
    oneLineSummary:  insight.summary            || '',
    topStrengths:    insight.strengths          || [],
    topConcerns:     insight.weaknesses         || [],
    estimatedLevel:  '',
    interviewFocus:  insight.interviewQuestions || [],
  }

  // Aura Calculation (Matched to dashboard logic visually)
  const auraPoints = Math.min(100, Math.max(0,
    Math.floor(overallScore * 0.35)
    + Math.min(techHighlights.length * 4, 20)
    + Math.min(impressivePatterns.length * 5, 25)
    + (learningPath.length > 0 ? 10 : 0)
    - Math.min(growthAreas.length * 2, 10)
  ))

  const recRaw = (recruiterVerdict.recommendation || 'MAYBE').toUpperCase().replace(/-/g, '_')
  const recCfg = RECOMMENDATION_CONFIG[recRaw] || RECOMMENDATION_CONFIG['MAYBE']
  const RecIcon = recCfg.icon

  return (
    <div className="space-y-6 w-full max-w-[1536px] mx-auto overflow-hidden font-sans text-slate-800">
      
      {/* ═══ 1. DARK COMMAND CENTER HERO (Matched to Dashboard) ═══ */}
      <div className="bg-[#0A0A0A] rounded-2xl p-8 lg:p-12 shadow-xl relative overflow-hidden border border-slate-800 min-h-[280px] flex items-center w-full">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ADFF2F]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between w-full">
          
          {/* Left: Content */}
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 rounded-[4px] bg-white/10 border border-white/5 text-[#ADFF2F] text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] animate-pulse" /> AI Verified Insight
              </div>
              {projectMaturity && (
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-700/50 px-2 py-1 rounded-[4px]">
                  {projectMaturity}
                </span>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {projectTitle}
              </h1>
              {projectSummary && (
                <p className="text-sm text-slate-400 font-medium max-w-2xl leading-relaxed border-l-2 border-slate-800 pl-4 py-1">
                  {projectSummary}
                </p>
              )}
            </div>
          </div>

          {/* Right: Premium Metric Card */}
          <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md self-start lg:self-center shadow-lg min-w-[180px] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Zap className="w-16 h-16 text-[#ADFF2F] -rotate-12" />
             </div>
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2">
                 <div className="p-1 bg-[#ADFF2F]/10 rounded border border-[#ADFF2F]/20">
                   <Zap className="w-3 h-3 text-[#ADFF2F]" />
                 </div>
                 <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Aura Impact</span>
               </div>
               <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-black text-white tracking-tight">{auraPoints}</span>
                 <span className="text-xs font-bold text-slate-500">/100</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* ═══ 2. TABS NAVIGATION ═══ */}
      <Tabs defaultValue="developer" className="space-y-6 w-full">
        <TabsList className="bg-white border border-slate-200 p-1.5 rounded-xl w-full grid grid-cols-2 shadow-sm">
          <TabsTrigger
            value="developer"
            className="rounded-lg py-3 text-xs font-extrabold uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900"
          >
            <Code2 className="w-4 h-4" /> Technical Analysis
          </TabsTrigger>
          <TabsTrigger
            value="recruiter"
            className="rounded-lg py-3 text-xs font-extrabold uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900"
          >
            <Briefcase className="w-4 h-4" /> Recruiter Verdict
          </TabsTrigger>
        </TabsList>

        {/* ─── DEVELOPER TAB ─── */}
        <TabsContent value="developer" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

          {/* Narrative Card (Matched to Terminal Style) */}
          {whatYouBuilt && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 md:p-8 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Terminal className="w-32 h-32 text-white rotate-12" />
               </div>
               <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-[#ADFF2F] mb-4 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] animate-pulse" /> Architecture Narrative
               </h3>
               <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium relative z-10 font-mono tracking-tight">
                 {whatYouBuilt}
               </p>
            </div>
          )}

          {/* Grid Layout for Tech & Patterns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tech Highlights */}
            {techHighlights.length > 0 && (
              <CollapsibleCard title="Tech Highlights" icon={Code2} iconColor="text-blue-600" headerBg="bg-blue-50/30">
                <div className="p-6 space-y-4 bg-white">
                  {techHighlights.map((h: string, i: number) => (
                    <div key={i} className="flex gap-4 group">
                       <span className="flex-shrink-0 text-[10px] font-extrabold text-blue-400 mt-1 uppercase tracking-widest w-6">
                         {(i + 1).toString().padStart(2, '0')}
                       </span>
                       <p className="text-xs font-medium text-slate-700 leading-relaxed border-b border-slate-100 pb-3 group-last:border-0">{h}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
            )}

            {/* Impressive Patterns */}
            {impressivePatterns.length > 0 && (
              <CollapsibleCard title="Impressive Patterns" icon={Star} iconColor="text-[#65A30D]" headerBg="bg-[#ADFF2F]/10">
                <div className="p-6 space-y-4 bg-white">
                  {impressivePatterns.map((p: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 group">
                       <div className="mt-0.5 text-slate-300 group-hover:text-[#65A30D] transition-colors">
                         <CheckSquare className="w-4 h-4" />
                       </div>
                       <p className="text-xs font-medium text-slate-700 leading-relaxed border-b border-slate-100 pb-3 group-last:border-0">{p}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
            )}
          </div>

          {/* Growth Areas (Action Plan style) */}
          {growthAreas.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" /> Optimization Targets
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {growthAreas.map((area: any, i: number) => {
                  const impactKey = (area.impact || 'MEDIUM').toUpperCase()
                  const cfg = IMPACT_CONFIG[impactKey] || IMPACT_CONFIG['MEDIUM']
                  const AreaIcon = cfg.icon
                  return (
                    <div key={i} className="p-6 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-1.5 rounded-md border", cfg.bg)}>
                            <AreaIcon className={cn("w-4 h-4", cfg.color)} />
                          </div>
                          <span className="text-sm font-bold text-slate-900">{area.area || String(area)}</span>
                        </div>
                        <span className={cn('text-[9px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-[4px]', cfg.badgeText)}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="ml-11 space-y-3">
                         {area.current && (
                           <div>
                             <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Current State</p>
                             <p className="text-xs text-slate-600 font-medium">{area.current}</p>
                           </div>
                         )}
                         {area.suggestion && (
                           <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                             <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-900 mb-1 flex items-center gap-1"><ArrowRight className="w-3 h-3 text-[#65A30D]" /> Resolution</p>
                             <p className="text-xs text-slate-700 font-medium">{area.suggestion}</p>
                           </div>
                         )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </TabsContent>

        {/* ─── RECRUITER TAB ─── */}
        <TabsContent value="recruiter" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          
          {/* Verdict Card (Premium Styling) */}
          <div className={cn("rounded-xl border p-8 relative overflow-hidden shadow-sm bg-white", recCfg.border)}>
             <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                <RecIcon className={cn("w-full h-full -rotate-12", recCfg.text)} />
             </div>
             
             <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("p-2 rounded-lg border", recCfg.bg, recCfg.border)}>
                      <RecIcon className={cn("w-5 h-5", recCfg.text)} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Final Verdict</span>
                  </div>
                  <h2 className={cn("text-3xl font-black mb-1 tracking-tight uppercase", recCfg.text)}>{recCfg.label}</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{recCfg.desc}</p>
                </div>
             </div>

             {/* Headline */}
             {recruiterVerdict.headline && (
               <div className="mt-8 pt-6 border-t border-slate-100">
                 <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Executive Summary</p>
                 <p className="text-lg font-bold text-slate-800 leading-snug">"{recruiterVerdict.headline}"</p>
               </div>
             )}
          </div>

          {/* Strengths & Concerns Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            {recruiterVerdict.topStrengths?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#65A30D]" /> Key Strengths
                    </h3>
                 </div>
                 <div className="p-6 space-y-4">
                   {recruiterVerdict.topStrengths.map((s: string, i: number) => (
                     <div key={i} className="flex gap-3 group">
                       <div className="mt-0.5 text-slate-300 group-hover:text-[#65A30D] transition-colors">
                         <CheckSquare className="w-4 h-4" />
                       </div>
                       <span className="text-xs text-slate-700 font-medium leading-relaxed">{s}</span>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {/* Concerns */}
            {recruiterVerdict.topConcerns?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> Risk Factors
                    </h3>
                 </div>
                 <div className="p-6 space-y-4">
                   {recruiterVerdict.topConcerns.map((s: string, i: number) => (
                     <div key={i} className="flex gap-3 group">
                       <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                       <span className="text-xs text-slate-700 font-medium leading-relaxed">{s}</span>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>

        </TabsContent>
      </Tabs>
    </div>
  )
}