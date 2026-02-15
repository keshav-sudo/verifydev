'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface BentoCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  noPadding?: boolean
}

export function BentoCard({ children, className, hover = true, noPadding = false }: BentoCardProps) {
  const baseClasses = cn(
    'bg-white rounded-2xl border border-gray-200/60 shadow-bento',
    !noPadding && 'p-6',
    className
  )

  if (!hover) {
    return <div className={baseClasses}>{children}</div>
  }

  return (
    <motion.div
      className={baseClasses}
      whileHover={{ 
        y: -2, 
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' 
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
