"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Brain,
  CheckCircle,
  AlertTriangle,
  Zap,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  GraduationCap,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Target,
  Rocket,
  MessageSquare,
  Eye,
} from 'lucide-react'
import { IntelligenceVerdict, AIProjectInsight, GrowthArea } from '@/types'
import { cn } from '@/lib/utils'

// ════════════════════════════════════════════
// MAIN COMPONENT — Handles both old and new format
// ════════════════════════════════════════════

interface Props {
  verdict?: IntelligenceVerdict    // Legacy
  aiInsight?: AIProjectInsight     // New enhanced format
}

export function IntelligenceVerdictCard({ verdict, aiInsight }: Props) {
  // Prefer new format, fallback to legacy
  if (aiInsight) {
    return <EnhancedInsightCard insight={aiInsight} />
  }
  if (verdict) {
    return <LegacyVerdictCard verdict={verdict} />
  }
  return null
}

// ════════════════════════════════════════════
// NEW: Enhanced Project Insight Card
// ════════════════════════════════════════════

function EnhancedInsightCard({ insight }: { insight: AIProjectInsight }) {
  const [showRecruiter, setShowRecruiter] = useState(false)
  const [expandedGrowth, setExpandedGrowth] = useState<number | null>(null)
  const rv = insight.recruiterVerdict

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background via-card to-primary/5 overflow-hidden">
      {/* ═══ HEADER ═══ */}
      <CardHeader className="pb-3 relative">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Project Analysis</span>
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary/70">
            {insight.projectTitle}
          </h2>
          <p className="text-sm text-muted-foreground/90 mt-2 leading-relaxed max-w-3xl">
            {insight.projectSummary}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative">
        {/* ═══ WHAT YOU BUILT ═══ */}
        {insight.whatYouBuilt && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4" /> What You Built
            </h3>
            <p className="text-sm text-foreground/85 leading-relaxed">
              {insight.whatYouBuilt}
            </p>
          </div>
        )}

        {/* ═══ TECH HIGHLIGHTS ═══ */}
        {insight.techHighlights?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-amber-400" /> Tech Highlights
            </h3>
            <div className="flex flex-wrap gap-2">
              {insight.techHighlights.map((highlight, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-300 border border-amber-500/20 hover:border-amber-500/40 transition-colors"
                >
                  <Zap className="h-3 w-3 mr-1.5 text-amber-400" />
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* ═══ IMPRESSIVE PATTERNS + MATURITY ═══ */}
        <div className="grid md:grid-cols-2 gap-4">
          {insight.impressivePatterns?.length > 0 && (
            <div className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5">
              <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4" /> Impressive Patterns
              </h3>
              <ul className="space-y-2">
                {insight.impressivePatterns.map((pattern, i) => (
                  <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    <span>{pattern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insight.projectMaturity && (
            <div className="p-4 rounded-xl border border-blue-500/15 bg-blue-500/5">
              <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4" /> Project Maturity
              </h3>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {insight.projectMaturity}
              </p>
            </div>
          )}
        </div>

        {/* ═══ GROWTH AREAS ═══ */}
        {insight.growthAreas?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-violet-400" /> Growth Opportunities
            </h3>
            <div className="space-y-2">
              {insight.growthAreas.map((area, i) => (
                <GrowthAreaCard
                  key={i}
                  area={area}
                  expanded={expandedGrowth === i}
                  onToggle={() => setExpandedGrowth(expandedGrowth === i ? null : i)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ═══ LEARNING PATH ═══ */}
        {insight.learningPath?.length > 0 && (
          <div className="p-4 rounded-xl border border-border/30 bg-card/50">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Rocket className="h-4 w-4 text-cyan-400" /> Next Steps to Level Up
            </h3>
            <div className="space-y-2">
              {insight.learningPath.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-500/25 shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-cyan-400">{i + 1}</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ RECRUITER VERDICT (Collapsible) ═══ */}
        <div className="border-t border-border/30 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRecruiter(!showRecruiter)}
            className="w-full justify-between text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-purple-400" />
              Recruiter View
              <RecommendationBadge recommendation={rv.recommendation} size="sm" />
            </span>
            {showRecruiter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showRecruiter && (
            <div className="mt-4 p-5 rounded-xl border border-purple-500/15 bg-gradient-to-br from-purple-500/5 to-transparent space-y-4 animate-in slide-in-from-top-2 duration-200">
              {/* Headline + Badge */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-foreground">{rv.headline}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{rv.oneLineSummary}</p>
                </div>
                <RecommendationBadge recommendation={rv.recommendation} />
              </div>

              {/* Level + Confidence */}
              <div className="flex flex-wrap gap-3">
                {rv.estimatedLevel && (
                  <Badge variant="outline" className="text-xs gap-1.5 py-1">
                    <GraduationCap className="h-3 w-3" /> {rv.estimatedLevel}
                  </Badge>
                )}
                {rv.confidenceLevel && (
                  <Badge variant="outline" className="text-xs gap-1.5 py-1 text-muted-foreground">
                    <ShieldAlert className="h-3 w-3" /> {rv.confidenceLevel}
                  </Badge>
                )}
              </div>

              {/* Strengths + Concerns */}
              <div className="grid md:grid-cols-2 gap-4">
                {rv.topStrengths?.length > 0 && (
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Strengths
                    </h5>
                    {rv.topStrengths.map((s, i) => (
                      <p key={i} className="text-xs text-foreground/75 flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span> {s}
                      </p>
                    ))}
                  </div>
                )}
                {rv.topConcerns?.length > 0 && (
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-medium text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Concerns
                    </h5>
                    {rv.topConcerns.map((c, i) => (
                      <p key={i} className="text-xs text-foreground/75 flex items-start gap-1.5">
                        <span className="text-amber-400 mt-0.5">•</span> {c}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Interview Focus */}
              {rv.interviewFocus?.length > 0 && (
                <div className="pt-3 border-t border-border/20">
                  <h5 className="text-xs font-medium text-purple-400 flex items-center gap-1.5 mb-2">
                    <MessageSquare className="h-3 w-3" /> Interview Focus Areas
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {rv.interviewFocus.map((q, i) => (
                      <Badge key={i} variant="secondary" className="text-[11px] bg-purple-500/10 text-purple-300 border border-purple-500/15">
                        {q}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════

function GrowthAreaCard({ area, expanded, onToggle }: { area: GrowthArea; expanded: boolean; onToggle: () => void }) {
  const impactColor = {
    HIGH: 'text-red-400 bg-red-500/10 border-red-500/20',
    MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    LOW: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  }[area.impact] || 'text-muted-foreground bg-muted/10 border-border/20'

  return (
    <div
      className="p-3 rounded-lg border border-border/20 bg-card/30 hover:bg-card/50 transition-colors cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Lightbulb className="h-3.5 w-3.5 text-violet-400 shrink-0" />
          <span className="text-xs font-semibold truncate">{area.area}</span>
          <Badge variant="outline" className={cn("text-[9px] px-1.5 h-4 shrink-0", impactColor)}>
            {area.impact}
          </Badge>
        </div>
        {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      {expanded && (
        <div className="mt-2.5 pl-5.5 space-y-1.5 animate-in slide-in-from-top-1 duration-150">
          <p className="text-[11px] text-muted-foreground"><span className="font-medium text-foreground/60">Current:</span> {area.current}</p>
          <p className="text-[11px] text-foreground/80 flex items-start gap-1.5">
            <ArrowUpRight className="h-3 w-3 text-violet-400 mt-0.5 shrink-0" />
            {area.suggestion}
          </p>
        </div>
      )}
    </div>
  )
}

function RecommendationBadge({ recommendation, size = 'md' }: { recommendation: string; size?: 'sm' | 'md' }) {
  const config = {
    STRONG_HIRE: { label: '🔥 Strong Hire', class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
    HIRE: { label: '✅ Hire', class: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
    LEAN_HIRE: { label: '🤔 Lean Hire', class: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
    NO_HIRE: { label: '❌ No Hire', class: 'bg-red-500/15 text-red-400 border-red-500/25' },
    // Legacy compat
    MAYBE: { label: '🤔 Maybe', class: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
    NO: { label: '❌ No', class: 'bg-red-500/15 text-red-400 border-red-500/25' },
  }[recommendation] || { label: recommendation, class: 'bg-muted text-muted-foreground' }

  return (
    <Badge className={cn(
      "border font-semibold shrink-0",
      config.class,
      size === 'sm' ? 'text-[10px] px-1.5 h-4' : 'text-xs px-2.5 py-1'
    )}>
      {config.label}
    </Badge>
  )
}

// ════════════════════════════════════════════
// LEGACY: Backward-compatible verdict card
// ════════════════════════════════════════════

function LegacyVerdictCard({ verdict }: { verdict: IntelligenceVerdict }) {
  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-500'
    if (score < 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Verdict
          </CardTitle>
          <RecommendationBadge recommendation={verdict.hireRecommendation} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            {verdict.title}
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed">
            {verdict.summary}
          </p>
        </div>

        {verdict.riskScore != null && (
          <div className="space-y-2 p-4 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2">
                <ShieldAlert className={`h-4 w-4 ${getRiskColor(verdict.riskScore)}`} />
                Risk Score
              </span>
              <span className={`font-bold ${getRiskColor(verdict.riskScore)}`}>
                {verdict.riskScore}/100
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500 transition-all duration-700"
                style={{ width: `${verdict.riskScore}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2 italic">
              &quot;{verdict.riskAnalysis}&quot;
            </p>
          </div>
        )}

        {verdict.skillsNarrative && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-primary flex items-center gap-2">
              <Zap className="h-4 w-4" /> Technical Narrative
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/20 pl-4">
              {verdict.skillsNarrative}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {verdict.strengths?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Strengths
              </h4>
              <ul className="space-y-1">
                {verdict.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {verdict.weaknesses?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> Weaknesses
              </h4>
              <ul className="space-y-1">
                {verdict.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {verdict.interviewQuestions?.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-dashed">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              Interview Questions
            </h4>
            <div className="space-y-2">
              {verdict.interviewQuestions.map((q, i) => (
                <div key={i} className="p-3 rounded-md bg-purple-500/5 border border-purple-500/10 text-sm text-foreground/90">
                  {q}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
