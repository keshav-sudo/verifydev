/**
 * Risk Panel Component
 * Displays risk assessment with unknowns and hiring recommendations
 */

import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  FileQuestion,
  Lightbulb
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { RiskProfile, Uncertainty, UncertaintyType, RiskLevel } from '@/types/intelligence-v2'

interface RiskPanelProps {
  riskProfile: RiskProfile
  className?: string
}

// Risk level config
const riskLevelConfig: Record<RiskLevel, {
  label: string
  subtext: string
  className: string
  badgeClassName: string
}> = {
  LOW: {
    label: 'Low Risk',
    subtext: 'Strong evidence supports claims',
    className: 'border-emerald-200 dark:border-emerald-800/50',
    badgeClassName: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  },
  MODERATE: {
    label: 'Moderate Risk',
    subtext: 'Some uncertainty requires validation',
    className: 'border-amber-200 dark:border-amber-800/50',
    badgeClassName: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  },
  HIGH: {
    label: 'High Uncertainty',
    subtext: 'Thorough interview recommended',
    className: 'border-red-200 dark:border-red-800/50',
    badgeClassName: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
}

// Uncertainty type icons
function getUncertaintyIcon(type: UncertaintyType) {
  switch (type) {
    case 'MISSING': return AlertCircle
    case 'AMBIGUOUS': return HelpCircle
    case 'ASSUMPTION': return Lightbulb
    case 'LIMITED': return FileQuestion
    default: return AlertTriangle
  }
}

// Impact badge
function ImpactBadge({ impact }: { impact: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const config = {
    HIGH: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    MEDIUM: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    LOW: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  }
  
  return (
    <span className={cn(
      'text-[10px] px-1.5 py-0.5 rounded font-medium',
      config[impact]
    )}>
      {impact}
    </span>
  )
}

// Uncertainty item
function UncertaintyItem({ uncertainty }: { uncertainty: Uncertainty }) {
  const Icon = getUncertaintyIcon(uncertainty.type)
  
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm">{uncertainty.description}</p>
          <ImpactBadge impact={uncertainty.impact} />
        </div>
        {uncertainty.affects.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Affects: {uncertainty.affects.join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}

export function RiskPanel({ riskProfile, className }: RiskPanelProps) {
  const config = riskLevelConfig[riskProfile.riskLevel]
  
  return (
    <div className={cn(
      'p-5 rounded-xl border bg-card space-y-4',
      config.className,
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Risk Assessment</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={cn('font-medium', config.badgeClassName)}>
                {config.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{config.subtext}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Unknowns */}
      {riskProfile.unknowns.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Unknowns</h4>
          <div className="divide-y divide-border">
            {riskProfile.unknowns.map((uncertainty, i) => (
              <UncertaintyItem key={i} uncertainty={uncertainty} />
            ))}
          </div>
        </div>
      )}

      {/* No unknowns */}
      {riskProfile.unknowns.length === 0 && (
        <div className="flex items-center gap-2 py-3 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <p className="text-sm">No significant unknowns detected</p>
        </div>
      )}

      {/* Hiring impact */}
      <div className="pt-3 border-t">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Hiring Recommendation
        </h4>
        <p className="text-sm text-foreground leading-relaxed">
          {riskProfile.hiringImpact}
        </p>
      </div>

      {/* Recommendations */}
      {riskProfile.recommendations.length > 0 && riskProfile.recommendations[0] !== 'Standard interview process recommended' && (
        <div className="pt-3 border-t">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Suggested Actions
          </h4>
          <ul className="space-y-1.5">
            {riskProfile.recommendations.map((rec, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-primary">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default RiskPanel
