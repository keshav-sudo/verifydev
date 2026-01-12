/**
 * Hire Signal Badge Component
 * Displays STRONG_HIRE, HIRE, BORDERLINE, NO_HIRE with appropriate styling
 */

import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type HireSignal = 'STRONG_HIRE' | 'HIRE' | 'BORDERLINE' | 'NO_HIRE'

interface HireSignalBadgeProps {
  signal: HireSignal
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}

const signalConfig: Record<HireSignal, {
  label: string
  className: string
  tooltip: string
}> = {
  STRONG_HIRE: {
    label: 'Strong Hire',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    tooltip: 'Exceeds expectations with strong engineering signals and verified skills',
  },
  HIRE: {
    label: 'Hire',
    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    tooltip: 'Meets expectations with solid engineering practices and verified skills',
  },
  BORDERLINE: {
    label: 'Borderline',
    className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    tooltip: 'Mixed signals - recommend additional technical screening',
  },
  NO_HIRE: {
    label: 'No Hire',
    className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    tooltip: 'Does not meet minimum requirements based on code analysis',
  },
}

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5 font-semibold',
}

export function HireSignalBadge({ 
  signal, 
  size = 'md', 
  showTooltip = true,
  className 
}: HireSignalBadgeProps) {
  const config = signalConfig[signal]
  
  const badge = (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium transition-colors',
      config.className,
      sizeConfig[size],
      className
    )}>
      {config.label}
    </span>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-[200px]">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default HireSignalBadge
