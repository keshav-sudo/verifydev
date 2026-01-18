"use client"

/**
 * SkillPill - Animated skill badge with hover reveal
 * Features: Fill animation, percentage reveal, glow effect
 */

import { motion } from 'framer-motion'
import { useState } from 'react'

export interface SkillPillProps {
  name: string
  level: number
  delay?: number
  showLevel?: boolean
  variant?: 'default' | 'compact' | 'large'
}

export function SkillPill({ 
  name, 
  level, 
  delay = 0,
  showLevel = true,
  variant = 'default'
}: SkillPillProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const sizeClasses = {
    compact: 'px-2 py-1 text-[10px]',
    default: 'px-3 py-1.5 text-xs',
    large: 'px-4 py-2 text-sm'
  }
  
  const getLevelColor = () => {
    if (level >= 90) return 'from-emerald-500/30 to-emerald-500/10'
    if (level >= 80) return 'from-primary/30 to-primary/10'
    if (level >= 70) return 'from-amber-500/30 to-amber-500/10'
    return 'from-muted to-muted/50'
  }
  
  return (
    <motion.div
      className={`relative overflow-hidden rounded-full bg-muted/50 border border-border/50 hover:border-primary/50 cursor-pointer ${sizeClasses[variant]}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Progress fill background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${getLevelColor()}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        style={{ transformOrigin: 'left' }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '200%' : '-100%' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      
      {/* Content */}
      <span className="relative font-medium flex items-center gap-1.5">
        <span className={isHovered ? 'text-foreground' : 'text-muted-foreground'}>{name}</span>
        
        {/* Level reveal */}
        {showLevel && (
          <motion.span 
            className="text-primary font-bold"
            initial={{ opacity: 0, width: 0, x: -5 }}
            animate={{ 
              opacity: isHovered ? 1 : 0, 
              width: isHovered ? 'auto' : 0,
              x: isHovered ? 0 : -5
            }}
            transition={{ duration: 0.2 }}
          >
            {level}%
          </motion.span>
        )}
      </span>
      
      {/* Glow effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ 
            boxShadow: '0 0 15px hsl(var(--primary) / 0.4), inset 0 0 10px hsl(var(--primary) / 0.1)' 
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  )
}

/**
 * SkillPillGroup - Container for multiple skill pills
 */
export function SkillPillGroup({ 
  skills, 
  baseDelay = 0 
}: { 
  skills: Array<{ name: string; level: number }>
  baseDelay?: number 
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, i) => (
        <SkillPill 
          key={skill.name} 
          {...skill} 
          delay={baseDelay + i * 0.06} 
        />
      ))}
    </div>
  )
}
