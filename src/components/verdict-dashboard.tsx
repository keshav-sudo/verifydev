"use client"

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  Brain, 
  Zap, 
  ShieldCheck, 
  Code2, 
  Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerdictDashboardProps {
  verdict: {
    summary: string
    justification: string
    developerLevel: string
    hireSignal: string
    strengths: string[]
    growthAreas: string[]
    keySignals?: string[]
    overallScore: number
  }
  confidenceReport?: {
    qualityMetrics: {
      overallQuality: number
      qualityTier: string
      organizationScore: number
      modularityScore: number
      documentationScore: number
    }
    ensembleVerdict: {
      confidence: number
      scoreLabel: string
      riskFactors: string[]
    }
  }
  className?: string
}

export function VerdictDashboard({ verdict, confidenceReport, className }: VerdictDashboardProps) {
  // Hire Signal Styling
  const getSignalConfig = (signal: string) => {
    switch (signal) {
      case 'STRONG_HIRE':
        return { label: 'Strong Hire', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: Zap }
      case 'HIRE':
        return { label: 'Hire', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20', icon: CheckCircle2 }
      case 'BORDERLINE':
        return { label: 'Borderline', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', icon: AlertCircle }
      case 'NO_HIRE':
      default:
        return { label: 'No Hire', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', icon: AlertCircle }
    }
  }

  const signalConfig = getSignalConfig(verdict.hireSignal)
  const SignalIcon = signalConfig.icon

  return (
    <Card className={cn("border-border/50 bg-gradient-to-br from-card via-card/50 to-muted/20 backdrop-blur-sm overflow-hidden", className)}>
      {/* Decorative top border */}
      <div className={cn("h-1 w-full bg-gradient-to-r", 
        verdict.hireSignal === 'STRONG_HIRE' ? 'from-emerald-500 via-teal-500 to-emerald-500' :
        verdict.hireSignal === 'HIRE' ? 'from-blue-500 via-indigo-500 to-blue-500' :
        verdict.hireSignal === 'BORDERLINE' ? 'from-amber-500 via-orange-500 to-amber-500' :
        'from-red-500 via-rose-500 to-red-500'
      )} />

      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Analyst Verdict
            </h2>
            <p className="text-muted-foreground text-sm">
              Autonomous assessment based on code patterns, architecture, and infrastructure.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="text-sm text-muted-foreground font-medium">Predicted Level</div>
              <div className="text-lg font-bold">{verdict.developerLevel}</div>
            </div>
            <Separator orientation="vertical" className="h-8 hidden md:block" />
            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border", signalConfig.bg)}>
              <SignalIcon className={cn("h-5 w-5", signalConfig.color)} />
              <span className={cn("font-bold", signalConfig.color)}>{signalConfig.label}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {/* Main Justification */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
          <p className="text-lg font-medium leading-relaxed">
            "{verdict.summary}"
          </p>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {verdict.justification}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Strengths */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Key Strengths
            </h3>
            <div className="space-y-2">
              {verdict.strengths.map((strength, i) => (
                <div key={i} className="flex items-start gap-2 text-sm p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Areas */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-4 w-4" />
              Growth Areas
            </h3>
            <div className="space-y-2">
              {verdict.growthAreas.map((area, i) => (
                <div key={i} className="flex items-start gap-2 text-sm p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <span className="text-amber-500 mt-0.5">↑</span>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence & Quality Metrics */}
          {confidenceReport && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="h-4 w-4" />
                Assessment Confidence
              </h3>
              
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                {/* Confidence Score */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-muted-foreground">Confidence Score</span>
                    <span className="font-bold text-primary">{Math.round(confidenceReport.ensembleVerdict.confidence * 100)}%</span>
                  </div>
                  <Progress value={confidenceReport.ensembleVerdict.confidence * 100} className="h-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Code2 className="h-3 w-3" /> Code Quality
                    </span>
                    <div className="text-sm font-bold">{Math.round(confidenceReport.qualityMetrics.overallQuality)}/100</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Layers className="h-3 w-3" /> Structure
                    </span>
                    <div className="text-sm font-bold">{Math.round(confidenceReport.qualityMetrics.organizationScore)}/100</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-500/10">
                   <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">Risk Factors</div>
                   {confidenceReport.ensembleVerdict.riskFactors.length > 0 ? (
                      <ul className="text-[10px] text-muted-foreground space-y-1">
                        {confidenceReport.ensembleVerdict.riskFactors.slice(0, 2).map((risk, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-indigo-500/50">•</span> {risk}
                          </li>
                        ))}
                      </ul>
                   ) : (
                     <div className="text-[10px] text-muted-foreground italic">No significant risks detected</div>
                   )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
