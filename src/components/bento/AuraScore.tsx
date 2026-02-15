'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AuraScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  animated?: boolean
}

const sizeClasses = {
  sm: 'text-2xl w-16 h-16',
  md: 'text-4xl w-24 h-24',
  lg: 'text-6xl w-32 h-32',
  xl: 'text-8xl w-48 h-48',
}

export function AuraScore({ score, size = 'md', showLabel = true, animated = true }: AuraScoreProps) {
  const displayScore = Math.min(Math.max(score, 0), 100)

  const glowClass = animated ? 'animate-pulse-glow' : ''

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className={cn(
          'relative flex items-center justify-center rounded-full bg-gradient-to-br from-aura/20 to-aura/5 border-2 border-aura',
          sizeClasses[size]
        )}
        initial={animated ? { scale: 0.9, opacity: 0 } : {}}
        animate={animated ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-aura opacity-20 blur-xl',
            glowClass
          )}
          style={{ boxShadow: '0 0 24px rgba(173, 255, 47, 0.3)' }}
        />
        <span className={cn('relative font-black text-aura', size === 'xl' && 'tracking-tighter')}>
          {displayScore}
        </span>
      </motion.div>
      {showLabel && (
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
            AURA SCORE
          </p>
        </div>
      )}
    </div>
  )
}
