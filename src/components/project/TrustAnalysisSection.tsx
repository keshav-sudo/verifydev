"use client"

import { ShieldCheck, ShieldAlert, AlertTriangle, Clock, GitBranch, TrendingUp, Activity, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustAnalysisSectionProps {
  trustAnalysis: any
  evolutionSignals?: any
}

function CircularScore({ value, size = 80, strokeWidth = 6 }: { value: number; size?: number; strokeWidth?: number }) {
  const safeValue = isNaN(value) ? 0 : Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth * 2) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (safeValue / 100) * circumference

  const getStroke = (score: number) => {
    if (score >= 80) return '#84CC16'
    if (score >= 60) return '#3B82F6'
    if (score >= 40) return '#F59E0B'
    return '#EF4444'
  }

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={getStroke(safeValue)} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-black tracking-tight", size >= 80 ? "text-2xl" : "text-lg")}>
          {Math.round(safeValue)}
        </span>
      </div>
    </div>
  )
}

export default function TrustAnalysisSection({ trustAnalysis, evolutionSignals }: TrustAnalysisSectionProps) {
  if (!trustAnalysis) return null

  const trustLevel = trustAnalysis.level || 'UNKNOWN'
  const trustScore = trustAnalysis.score || 0
  const effortClass = trustAnalysis.effortClass || trustAnalysis.effort?.class || 'UNKNOWN'
  const authenticityScore = trustAnalysis.authenticityScore || trustAnalysis.authenticity?.score || 0
  const authenticityFlags = trustAnalysis.authenticityFlags || trustAnalysis.authenticity?.flags || []
  const hasOriginalWork = trustAnalysis.hasOriginalWork ?? trustAnalysis.authenticity?.hasOriginalWork ?? true

  const effort = trustAnalysis.effort || {}
  const estimatedHours = effort.estimatedHours
  const commitFrequency = effort.commitFrequency
  const averageCommitSize = effort.averageCommitSize

  const evolution = evolutionSignals || trustAnalysis.evolutionSignals || {}
  const authorshipLevel = evolution.authorshipLevel || 'UNKNOWN'
  const developmentPattern = evolution.developmentPattern || 'unknown'
  const refactorRatio = evolution.refactorRatio || 0
  const commitConsistency = evolution.commitConsistency || 0

  const getTrustLevelColor = (level: string) => {
    const normalized = level?.toUpperCase() || ''
    if (normalized === 'HIGH') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (normalized === 'MEDIUM') return 'bg-blue-50 text-blue-700 border-blue-200'
    if (normalized === 'LOW') return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  const getEffortColor = (effort: string) => {
    const normalized = effort?.toUpperCase() || ''
    if (normalized === 'SIGNIFICANT') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (normalized === 'MODERATE') return 'bg-blue-50 text-blue-700 border-blue-200'
    if (normalized === 'MINIMAL') return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  const getPatternColor = (pattern: string) => {
    if (pattern === 'iterative') return 'text-emerald-600'
    if (pattern === 'sporadic') return 'text-amber-600'
    return 'text-slate-600'
  }

  const getFlagSeverity = (flag: string) => {
    if (flag.includes('[CRITICAL]')) return 'critical'
    if (flag.includes('[high]')) return 'high'
    if (flag.includes('[INFO]')) return 'info'
    return 'medium'
  }

  const getFlagIcon = (severity: string) => {
    if (severity === 'critical') return <AlertTriangle className="h-4 w-4 text-red-600" />
    if (severity === 'high') return <ShieldAlert className="h-4 w-4 text-amber-600" />
    return <Info className="h-4 w-4 text-blue-500" />
  }

  return (
    <div className="space-y-4">
      {/* Trust Score Overview */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-500" />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900">Trust & Authenticity Score</h2>
        </div>
        <div className="p-5">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Trust Score */}
            <div className="flex flex-col items-center text-center">
              <CircularScore value={trustScore} size={90} strokeWidth={7} />
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mt-3 mb-1">Trust Level</p>
              <span className={cn("text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-md border", getTrustLevelColor(trustLevel))}>
                {trustLevel}
              </span>
            </div>

            {/* Authenticity Score */}
            <div className="flex flex-col items-center text-center">
              <CircularScore value={authenticityScore} size={90} strokeWidth={7} />
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mt-3 mb-1">Authenticity</p>
              <span className={cn("text-xs font-medium text-slate-700 flex items-center gap-1")}>
                {hasOriginalWork ? (
                  <>
                    <ShieldCheck className="h-3 w-3 text-emerald-500" /> Original Work
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-3 w-3 text-amber-500" /> Needs Review
                  </>
                )}
              </span>
            </div>

            {/* Effort Classification */}
            <div className="flex flex-col items-center justify-center text-center">
              <Clock className="h-10 w-10 text-blue-500 mb-3" />
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Effort Class</p>
              <span className={cn("text-xs font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-md border", getEffortColor(effortClass))}>
                {effortClass}
              </span>
              {estimatedHours !== undefined && (
                <p className="text-[10px] font-medium text-slate-500 mt-2">~{estimatedHours}h estimated</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Development Pattern */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <Activity className="h-4 w-4 text-purple-500" />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900">Development Patterns</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Authorship */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 text-blue-500" />
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Authorship</p>
              </div>
              <p className="text-sm font-black text-slate-900">{authorshipLevel}</p>
            </div>

            {/* Pattern */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Pattern</p>
              </div>
              <p className={cn("text-sm font-black capitalize", getPatternColor(developmentPattern))}>
                {developmentPattern}
              </p>
            </div>

            {/* Refactor Ratio */}
            {refactorRatio > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Refactoring</p>
                </div>
                <p className="text-sm font-black text-slate-900">{(refactorRatio * 100).toFixed(0)}%</p>
              </div>
            )}

            {/* Consistency */}
            {commitConsistency > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Consistency</p>
                </div>
                <p className="text-sm font-black text-slate-900">{(commitConsistency * 100).toFixed(0)}%</p>
              </div>
            )}
          </div>

          {/* Additional Metrics */}
          {(commitFrequency !== undefined || averageCommitSize !== undefined) && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
              {commitFrequency !== undefined && (
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Commit Frequency</p>
                  <p className="text-xs font-bold text-slate-700">{commitFrequency.toFixed(1)} commits/week</p>
                </div>
              )}
              {averageCommitSize !== undefined && (
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Avg Commit Size</p>
                  <p className="text-xs font-bold text-slate-700">{averageCommitSize} lines</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Authenticity Flags */}
      {authenticityFlags.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900">Analysis Flags</h2>
          </div>
          <div className="p-5">
            <div className="space-y-2">
              {authenticityFlags.map((flag: string, i: number) => {
                const severity = getFlagSeverity(flag)
                const cleanFlag = flag.replace(/\[(CRITICAL|high|INFO|MEDIUM)\]\s*/gi, '')
                
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-md border",
                      severity === 'critical' ? 'bg-red-50 border-red-200' :
                      severity === 'high' ? 'bg-amber-50 border-amber-200' :
                      severity === 'info' ? 'bg-blue-50 border-blue-200' :
                      'bg-slate-50 border-slate-200'
                    )}
                  >
                    {getFlagIcon(severity)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700">{cleanFlag}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
