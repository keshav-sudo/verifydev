'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: {
    value: number
    label: string
  }
  className?: string
}

export function StatCard({ icon: Icon, label, value, trend, className }: StatCardProps) {
  const isPositive = trend && trend.value > 0

  return (
    <motion.div
      className={cn(
        'bg-white rounded-xl border border-gray-200/60 shadow-bento p-5',
        'hover:shadow-bento-hover transition-all duration-200',
        className
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold mb-2">
            {label}
          </p>
          <p className="text-3xl font-black text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-xs font-semibold',
                  isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
