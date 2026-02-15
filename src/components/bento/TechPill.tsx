'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TechPillProps {
  tech: string
  className?: string
  animated?: boolean
}

export function TechPill({ tech, className, animated = true }: TechPillProps) {
  const pillClasses = cn(
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
    'bg-tech/10 text-tech border border-tech/20',
    'transition-all duration-200',
    'hover:bg-tech/20 hover:border-tech/40',
    className
  )

  if (!animated) {
    return <span className={pillClasses}>{tech}</span>
  }

  return (
    <motion.span
      className={pillClasses}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {tech}
    </motion.span>
  )
}
