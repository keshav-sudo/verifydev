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
    progress: 15,
    description: 'Waiting in queue...',
    animate: true,
  },
  analyzing: {
    label: 'Analyzing',
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    progress: 50,
    description: 'Engine analyzing your code...',
    animate: true,
  },
  processing: {
    label: 'Processing',
    icon: Sparkles,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    progress: 80,
    description: 'Calculating metrics...',
    animate: true,
  },
  completed: {
    label: 'Verified',
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
    description: 'Analysis failed',
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

  // Animate progress smoothly
  useEffect(() => {
    const targetProgress = config.progress
    
    if (config.animate) {
      // For animating states, pulse between current and target
      const interval = setInterval(() => {
        setAnimatedProgress((prev) => {
          if (prev >= targetProgress) return targetProgress - 10
          return prev + 2
        })
      }, 100)
      return () => clearInterval(interval)
    } else {
      // For completed/failed, go directly to target
      setAnimatedProgress(targetProgress)
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('space-y-2', className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', config.color, config.animate && 'animate-spin')} />
          <span className={cn('text-xs font-medium', config.color)}>
            {config.label}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {animatedProgress}%
        </span>
      </div>
      
      <Progress 
        value={animatedProgress} 
        className="h-1.5"
      />
      
      {/* Analysis stages - icons only on mobile */}
      {config.animate && (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground overflow-hidden">
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-1"
          >
            <Code2 className="h-3 w-3" />
            <span className="hidden sm:inline">Code</span>
          </motion.span>
          <span>→</span>
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            className="flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" />
            <span className="hidden sm:inline">Engine</span>
          </motion.span>
          <span>→</span>
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            className="flex items-center gap-1"
          >
            <Zap className="h-3 w-3" />
            <span className="hidden sm:inline">Aura</span>
          </motion.span>
        </div>
      )}

      {/* Success message when completed */}
      {normalizedStatus === 'completed' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5 text-green-500 text-xs font-medium"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Skills verified!
        </motion.div>
      )}
    </motion.div>
  )
}
