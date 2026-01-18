"use client"

/**
 * ProjectCard - Interactive project card with star animation
 * Features: GitHub-style project display, star toggle, slide hover
 */

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Github, Star, GitFork, Eye } from 'lucide-react'

export interface ProjectCardProps {
  name: string
  stars: number
  tech: string
  delay?: number
  forks?: number
  views?: number
}

export function ProjectCard({ 
  name, 
  stars, 
  tech, 
  delay = 0,
  forks = 45,
  views = 1240,
}: ProjectCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [starCount, setStarCount] = useState(stars)
  
  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    setStarCount(prev => isLiked ? prev - 1 : prev + 1)
  }
  
  return (
    <motion.div
      className="relative flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/30 cursor-pointer group overflow-hidden"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Hover gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
      />
      
      {/* GitHub icon with animation */}
      <motion.div 
        className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden shadow-lg"
        whileHover={{ rotate: 10, scale: 1.1 }}
      >
        {/* Inner glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/10"
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
        <Github className="w-5 h-5 text-white relative z-10" />
      </motion.div>
      
      <div className="flex-1 min-w-0">
        {/* Repo name */}
        <motion.h4 
          className="text-sm font-semibold truncate transition-colors"
          animate={{ color: isHovered ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}
        >
          {name}
        </motion.h4>
        
        {/* Tech stack */}
        <p className="text-[10px] text-muted-foreground">{tech}</p>
        
        {/* Stats row - revealed on hover */}
        <motion.div 
          className="flex items-center gap-3 mt-1.5 text-[9px] text-muted-foreground"
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isHovered ? 1 : 0, 
            height: isHovered ? 'auto' : 0 
          }}
          transition={{ duration: 0.2 }}
        >
          <span className="flex items-center gap-1">
            <GitFork className="w-3 h-3" />
            {forks}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {views.toLocaleString()}
          </span>
        </motion.div>
      </div>
      
      {/* Star button with animation */}
      <motion.button
        onClick={handleStar}
        className="relative flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs hover:bg-muted/50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 1.3 }}
      >
        <motion.div
          animate={{ 
            rotate: isLiked ? [0, -15, 15, -10, 10, 0] : 0,
            scale: isLiked ? [1, 1.3, 1] : 1
          }}
          transition={{ duration: 0.5 }}
        >
          <Star 
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'fill-amber-500 text-amber-500' : 'text-amber-500'
            }`} 
          />
        </motion.div>
        
        <motion.span 
          className="text-muted-foreground font-medium"
          key={starCount}
          initial={{ y: isLiked ? 10 : -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {starCount.toLocaleString()}
        </motion.span>
        
        {/* Star particles on click */}
        {isLiked && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-amber-400"
                initial={{ 
                  scale: 0, 
                  x: 0, 
                  y: 0 
                }}
                animate={{ 
                  scale: [0, 1, 0], 
                  x: (Math.random() - 0.5) * 30,
                  y: (Math.random() - 0.5) * 30
                }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              />
            ))}
          </>
        )}
      </motion.button>
    </motion.div>
  )
}
