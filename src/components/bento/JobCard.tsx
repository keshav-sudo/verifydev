'use client'

import { motion } from 'framer-motion'
import { TechPill } from './TechPill'
import { cn } from '@/lib/utils'
import { MapPin, DollarSign, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface JobCardProps {
  id: string
  title: string
  company: string
  location: string
  salary?: {
    min: number
    max: number
    currency: string
  }
  type: string
  technologies: string[]
  postedAt: string
  isSaved?: boolean
  className?: string
}

export function JobCard({
  id,
  title,
  company,
  location,
  salary,
  type,
  technologies,
  postedAt,
  isSaved = false,
  className,
}: JobCardProps) {
  return (
    <Link href={`/jobs/${id}`}>
      <motion.div
        className={cn(
          'group bg-white rounded-xl border border-gray-200/60 shadow-bento p-5',
          'hover:shadow-bento-hover transition-all duration-200 cursor-pointer',
          className
        )}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                {title}
              </h3>
              {isSaved && (
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-aura/10 text-aura rounded">
                  Saved
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-3">{company}</p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{location}</span>
              </div>
              {salary && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>
                    {salary.currency}{salary.min}k - {salary.currency}{salary.max}k
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{type}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {technologies.slice(0, 5).map((tech) => (
                <TechPill key={tech} tech={tech} animated={false} />
              ))}
              {technologies.length > 5 && (
                <span className="text-xs text-gray-500 self-center">+{technologies.length - 5} more</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">{postedAt}</span>
              <motion.div
                className="flex items-center gap-1 text-sm font-semibold text-gray-900"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <span>View Details</span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
