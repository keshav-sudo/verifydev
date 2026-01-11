/**
 * ProjectAnalysisProgress Component
 * Real-time visual feedback for project analysis
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Code2, 
  Sparkles,
  Zap,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectAnalysisProgressProps {
  status: string
  className?: string
  showDetails?: boolean
}

const statusConfig = {
  pending: {
    label: 'Queued',
    icon: Loader2,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    progress: 0,
    description: 'Waiting in queue...',
    animate: false,
  },
  analyzing: {
    label: 'Analyzing',
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    progress: 50,
    description: 'AI is analyzing your code...',
    animate: true,
  },
  processing: {
    label: 'Processing',
    icon: BarChart3,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    progress: 75,
    description: 'Calculating metrics...',
    animate: true,
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    progress: 100,
    description: 'Analysis complete!',
    animate: false,
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    progress: 0,
    description: 'Analysis failed. Try again.',
    animate: false,
  },
}

export function ProjectAnalysisProgress({ 
  status, 
  className,
  showDetails = false,
}: ProjectAnalysisProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const normalizedStatus = status?.toLowerCase() || 'pending'
  const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.pending
  const Icon = config.icon

  // Animate progress
  useEffect(() => {
    if (config.animate) {
      const interval = setInterval(() => {
        setAnimatedProgress((prev) => {
          if (prev >= config.progress) return config.progress
          return prev + 1
        })
      }, 50)
      return () => clearInterval(interval)
    } else {
      setAnimatedProgress(config.progress)
    }
  }, [config.progress, config.animate])

  if (!showDetails) {
    // Compact badge view
    return (
      <Badge 
        variant="outline" 
        className={cn(
          'gap-1.5 font-medium border',
          config.bgColor,
          config.color,
          className
        )}
      >
        <Icon className={cn('h-3 w-3', config.animate && 'animate-spin')} />
        {config.label}
      </Badge>
    )
  }

  // Detailed view with progress bar
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-2', className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', config.color, config.animate && 'animate-spin')} />
          <span className={cn('text-sm font-medium', config.color)}>
            {config.label}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {animatedProgress}%
        </span>
      </div>
      
      <Progress 
        value={animatedProgress} 
        className="h-1.5"
      />
      
      {config.description && (
        <p className="text-xs text-muted-foreground">
          {config.description}
        </p>
      )}

      {/* Analysis stages animation - simplified for mobile */}
      {config.animate && (
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mt-2 overflow-hidden">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-1 shrink-0"
          >
            <Code2 className="h-3 w-3" />
            <span className="hidden sm:inline">Code</span>
          </motion.span>
          <span className="text-muted-foreground/50">→</span>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            className="flex items-center gap-1 shrink-0"
          >
            <Sparkles className="h-3 w-3" />
            <span className="hidden sm:inline">AI</span>
          </motion.span>
          <span className="text-muted-foreground/50">→</span>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            className="flex items-center gap-1 shrink-0"
          >
            <Zap className="h-3 w-3" />
            <span className="hidden sm:inline">Aura</span>
          </motion.span>
        </div>
      )}
    </motion.div>
  )
}
