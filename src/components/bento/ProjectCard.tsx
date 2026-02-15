'use client'

import { motion } from 'framer-motion'
import { TechPill } from './TechPill'
import { cn } from '@/lib/utils'
import { ExternalLink, Github } from 'lucide-react'
import Link from 'next/link'

interface ProjectCardProps {
  id: string
  name: string
  description: string
  auraContribution: number
  technologies: string[]
  githubUrl?: string
  liveUrl?: string
  stats?: {
    commits?: number
    stars?: number
    forks?: number
  }
  className?: string
}

export function ProjectCard({
  id,
  name,
  description,
  auraContribution,
  technologies,
  githubUrl,
  liveUrl,
  stats,
  className,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`}>
      <motion.div
        className={cn(
          'group bg-white rounded-xl border border-gray-200/60 shadow-bento p-6',
          'hover:shadow-bento-hover transition-all duration-200 cursor-pointer',
          className
        )}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
              {name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-4 h-4 text-gray-600" />
              </a>
            )}
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4 text-gray-600" />
              </a>
            )}
          </div>
        </div>

        {stats && (
          <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
            {stats.commits && <span>{stats.commits} commits</span>}
            {stats.stars && <span>★ {stats.stars}</span>}
            {stats.forks && <span>⑂ {stats.forks}</span>}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {technologies.slice(0, 4).map((tech) => (
              <TechPill key={tech} tech={tech} animated={false} />
            ))}
            {technologies.length > 4 && (
              <span className="text-xs text-gray-500">+{technologies.length - 4} more</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-aura">+{auraContribution}</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-400">AURA</span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
