"use client"

/**
 * JobMatchingPreview - Job matching dashboard preview
 * Features: Match score ring, job cards, filters, quick apply
 */

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Target, Sparkles, Send, Filter, ArrowRight } from 'lucide-react'
import { JobCard } from './shared'

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000, delay: number = 0) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let startTime: number
      let animationFrame: number
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        setCount(Math.floor(progress * end))
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        }
      }
      
      animationFrame = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationFrame)
    }, delay)
    
    return () => clearTimeout(timeout)
  }, [end, duration, delay])
  
  return count
}

// Animated match ring component
function MatchRing({ percentage, size = 80 }: { percentage: number; size?: number }) {
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
      </svg>
      
      {/* Progress ring */}
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.5))' }}
        />
      </svg>
      
      {/* Center icon */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
      >
        <Target className="w-7 h-7 text-emerald-500" />
      </motion.div>
    </div>
  )
}

export function JobMatchingPreview() {
  const matchScore = useAnimatedCounter(94, 1500, 800)
  const [activeFilter, setActiveFilter] = useState(0)
  
  const jobs = [
    { company: 'Stripe', role: 'Senior Frontend Engineer', location: 'Remote', salary: '$180-220K', match: 94, logo: '💳', tags: ['React', 'TypeScript', 'Node.js'] },
    { company: 'Vercel', role: 'Full Stack Developer', location: 'San Francisco', salary: '$160-200K', match: 89, logo: '▲', tags: ['Next.js', 'GraphQL', 'AWS'] },
    { company: 'Linear', role: 'Software Engineer', location: 'Remote', salary: '$150-190K', match: 85, logo: '📐', tags: ['React', 'Rust', 'PostgreSQL'] },
  ]
  
  const filters = ['Remote', 'Full-time', '$150K+', 'Frontend']
  
  return (
    <motion.div 
      className="relative w-[480px] h-[600px] mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Enhanced depth with stronger shadows */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-green-600/20 rounded-2xl blur-xl opacity-50" />
      
      <div className="relative rounded-2xl border-2 border-border/80 bg-card/98 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Target className="w-3 h-3 text-green-500" />
            <span className="font-medium">Smart Job Matching</span>
          </div>
          <div className="w-16" />
        </div>
        
        <div className="p-4 space-y-4">
          {/* Match Score Hero */}
          <motion.div 
            className="relative p-5 rounded-xl bg-card border-2 border-border overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold">Your Match Score</span>
                </div>
                <motion.div 
                  className="text-4xl font-black text-emerald-500"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  {matchScore}%
                </motion.div>
                <p className="text-xs text-muted-foreground mt-1">Based on verified skills</p>
              </div>
              
              <MatchRing percentage={matchScore} />
            </div>
          </motion.div>
          
          {/* Filter Tags */}
          <div className="flex gap-2 flex-wrap">
            <motion.button
              className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted/80 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-4 h-4" />
            </motion.button>
            {filters.map((filter, i) => (
              <motion.button
                key={filter}
                className={`px-3 py-1.5 rounded-full text-[10px] font-medium transition-all ${
                  activeFilter === i 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(i)}
              >
                {filter}
              </motion.button>
            ))}
          </div>
          
          {/* Job Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Top Matches</span>
              <motion.button 
                className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                whileHover={{ x: 3 }}
              >
                View all
                <ArrowRight className="w-3 h-3" />
              </motion.button>
            </div>
            {jobs.map((job, i) => (
              <JobCard key={job.company} {...job} delay={0.8 + i * 0.12} />
            ))}
          </div>
          
          {/* Quick Apply Button */}
          <motion.button
            className="relative w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Send className="w-4 h-4" />
            Quick Apply to All
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
