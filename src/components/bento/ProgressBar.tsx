'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  color?: 'aura' | 'tech' | 'gray'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

const colorClasses = {
  aura: 'bg-aura',
  tech: 'bg-tech',
  gray: 'bg-gray-400',
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'aura',
  size = 'md',
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-xs font-semibold text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-xs font-bold text-gray-900">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', sizeClasses[size])}>
        <motion.div
          className={cn('h-full rounded-full', colorClasses[color])}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 0.8 : 0, ease: 'easeOut', delay: animated ? 0.2 : 0 }}
        />
      </div>
    </div>
  )
}
