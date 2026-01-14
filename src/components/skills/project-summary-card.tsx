"use client"

/**
 * Project Summary Card Component
 * Displays overall score, engineering level, architecture style, and hire signal
 */

import { TrendingUp, Award, Layers, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { HireSignalBadge, type HireSignal } from './hire-signal-badge'

interface ProjectSummaryCardProps {
  overallScore: number
  engineeringLevel: string
  architectureStyle: string
  hireSignal: HireSignal
  topSkills?: string[]
  analysisTimeMs?: number
  className?: string
}

// Engineering level config
const levelConfig: Record<string, {
  color: string
  bgColor: string
}> = {
  EXPERT: {
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  SENIOR: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  INTERMEDIATE: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  JUNIOR: {
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
  },
}

export function ProjectSummaryCard({
  overallScore,
  engineeringLevel,
  architectureStyle,
  hireSignal,
  topSkills = [],
  analysisTimeMs,
  className,
}: ProjectSummaryCardProps) {
  const level = levelConfig[engineeringLevel] || levelConfig.JUNIOR
  
  // Score color
  const scoreColor = 
    overallScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
    overallScore >= 60 ? 'text-blue-600 dark:text-blue-400' :
    overallScore >= 40 ? 'text-amber-600 dark:text-amber-400' :
    'text-slate-600 dark:text-slate-400'

  const progressColor =
    overallScore >= 80 ? '[&>div]:bg-emerald-500' :
    overallScore >= 60 ? '[&>div]:bg-blue-500' :
    overallScore >= 40 ? '[&>div]:bg-amber-500' :
    '[&>div]:bg-slate-400'

  return (
    <div className={cn(
      'p-6 rounded-xl border bg-card',
      className
    )}>
      {/* Top row: Score and Hire Signal */}
      <div className="flex items-start justify-between mb-6">
        {/* Score */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Overall Score
          </p>
          <div className="flex items-baseline gap-1">
            <span className={cn('text-4xl font-bold tabular-nums', scoreColor)}>
              {Math.round(overallScore)}
            </span>
            <span className="text-lg text-muted-foreground">/100</span>
          </div>
          <Progress 
            value={overallScore} 
            className={cn('h-2 w-32', progressColor)}
          />
        </div>
        
        {/* Hire Signal */}
        <div className="text-right space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Hire Signal
          </p>
          <HireSignalBadge signal={hireSignal} size="lg" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        {/* Engineering Level */}
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', level.bgColor)}>
            <Award className={cn('h-4 w-4', level.color)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Engineering Level</p>
            <p className={cn('text-sm font-semibold capitalize', level.color)}>
              {engineeringLevel.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Architecture */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Architecture</p>
            <p className="text-sm font-semibold capitalize">
              {architectureStyle.toLowerCase().replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Top skills */}
      {topSkills.length > 0 && (
        <div className="pt-4 mt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Top Skills</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topSkills.slice(0, 5).map((skill, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {topSkills.length > 5 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{topSkills.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Analysis time (subtle) */}
      {analysisTimeMs !== undefined && (
        <p className="text-[10px] text-muted-foreground mt-4 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Analyzed in {analysisTimeMs}ms
        </p>
      )}
    </div>
  )
}

export default ProjectSummaryCard
