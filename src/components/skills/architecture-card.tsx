/**
 * Architecture Card Component
 * Displays architecture analysis with justification scoring and cargo-cult warnings
 */

import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info,
  Server,
  Network,
  Cloud,
  Box,
  Layers,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useState } from 'react'
import type { 
  ArchitectureVerdict, 
  ArchitectureStyle, 
  JustificationLevel,
  CargoCultWarning,
  ArchitectureTradeoff
} from '@/types/intelligence-v2'

interface ArchitectureCardProps {
  architecture: ArchitectureVerdict
  className?: string
}

// Style icon mapping
function getStyleIcon(style: ArchitectureStyle) {
  switch (style) {
    case 'MICROSERVICES': return Network
    case 'SERVERLESS': return Cloud
    case 'MONOLITH': return Box
    case 'MODULAR': return Layers
    case 'EVENT_DRIVEN': return Server
    default: return Server
  }
}

// Justification level config
const justificationConfig: Record<JustificationLevel, {
  icon: typeof CheckCircle2
  label: string
  className: string
}> = {
  FULLY_JUSTIFIED: {
    icon: CheckCircle2,
    label: 'Justified',
    className: 'text-emerald-600 dark:text-emerald-400',
  },
  PARTIALLY_JUSTIFIED: {
    icon: Info,
    label: 'Partially Justified',
    className: 'text-amber-600 dark:text-amber-400',
  },
  WEAKLY_JUSTIFIED: {
    icon: AlertTriangle,
    label: 'Weakly Justified',
    className: 'text-orange-600 dark:text-orange-400',
  },
  NOT_JUSTIFIED: {
    icon: XCircle,
    label: 'Not Justified',
    className: 'text-red-600 dark:text-red-400',
  },
}

// Cargo-cult warning component
function CargoCultWarningItem({ warning }: { warning: CargoCultWarning }) {
  const severityColor = {
    HIGH: 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800',
    MEDIUM: 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800',
    LOW: 'border-slate-200 bg-slate-50 dark:bg-slate-900/10 dark:border-slate-700',
  }

  return (
    <div className={cn(
      'p-3 rounded-lg border text-sm',
      severityColor[warning.severity]
    )}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium">{warning.pattern}</p>
          <p className="text-muted-foreground text-xs">{warning.explanation}</p>
          <div className="flex gap-4 text-xs text-muted-foreground mt-2">
            <span>Expected: {warning.expected}</span>
            <span>Found: {warning.found}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tradeoff item component
function TradeoffItem({ tradeoff }: { tradeoff: ArchitectureTradeoff }) {
  return (
    <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-900/30 text-sm">
      <div className="flex items-start gap-2">
        {tradeoff.isAppropriate ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <p className="font-medium">{tradeoff.decision}</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
            <div>
              <span className="text-emerald-600 dark:text-emerald-400">Benefit:</span> {tradeoff.benefit}
            </div>
            <div>
              <span className="text-amber-600 dark:text-amber-400">Cost:</span> {tradeoff.cost}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ArchitectureCard({ architecture, className }: ArchitectureCardProps) {
  const [warningsOpen, setWarningsOpen] = useState(false)
  const [tradeoffsOpen, setTradeoffsOpen] = useState(false)
  
  const StyleIcon = getStyleIcon(architecture.style)
  const justification = justificationConfig[architecture.justificationLevel]
  const JustificationIcon = justification.icon

  const hasWarnings = architecture.cargoCultWarnings && architecture.cargoCultWarnings.length > 0
  const hasTradeoffs = architecture.tradeoffAnalysis && architecture.tradeoffAnalysis.length > 0

  return (
    <div className={cn(
      'p-5 rounded-xl border bg-card space-y-4',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <StyleIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold capitalize">
              {architecture.style.toLowerCase().replace('_', ' ')}
            </h3>
            <p className="text-xs text-muted-foreground">Architecture Style</p>
          </div>
        </div>
        
        {/* Justification badge */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn('flex items-center gap-1.5', justification.className)}>
                <JustificationIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{justification.label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Justification Score: {Math.round(architecture.justificationScore * 100)}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Maturity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Maturity</span>
          <span className="font-semibold">{architecture.maturity}/10</span>
        </div>
        <Progress 
          value={architecture.maturity * 10} 
          className={cn(
            'h-2',
            architecture.maturity >= 7 ? '[&>div]:bg-emerald-500' :
            architecture.maturity >= 5 ? '[&>div]:bg-blue-500' :
            architecture.maturity >= 3 ? '[&>div]:bg-amber-500' :
            '[&>div]:bg-red-500'
          )}
        />
      </div>

      {/* Explanation */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {architecture.explanation}
      </p>

      {/* Strengths */}
      {architecture.strengths && architecture.strengths.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {architecture.strengths.map((strength, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {strength}
            </Badge>
          ))}
        </div>
      )}

      {/* Cargo-cult warnings */}
      {hasWarnings && (
        <Collapsible open={warningsOpen} onOpenChange={setWarningsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-accent text-sm">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">
                {architecture.cargoCultWarnings!.length} Warning{architecture.cargoCultWarnings!.length > 1 ? 's' : ''}
              </span>
            </div>
            {warningsOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2">
            {architecture.cargoCultWarnings!.map((warning, i) => (
              <CargoCultWarningItem key={i} warning={warning} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Tradeoff analysis */}
      {hasTradeoffs && (
        <Collapsible open={tradeoffsOpen} onOpenChange={setTradeoffsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-accent text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="h-4 w-4" />
              <span className="font-medium">Tradeoff Analysis</span>
            </div>
            {tradeoffsOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2">
            {architecture.tradeoffAnalysis!.map((tradeoff, i) => (
              <TradeoffItem key={i} tradeoff={tradeoff} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}

export default ArchitectureCard
