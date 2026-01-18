"use client"

/**
 * ProfilePreview - Developer profile showcase preview
 * Features: 3D card tilt, animated stats, skill pills, projects
 */

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { 
  Eye, CheckCircle2, MessageSquare, Share2, 
  TrendingUp, Shield, Github, Award
} from 'lucide-react'
import { SkillPillGroup, ProjectCard } from './shared'

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

export function ProfilePreview() {
  const [isFollowing, setIsFollowing] = useState(false)
  const commits = useAnimatedCounter(2847, 2000, 600)
  const contributions = useAnimatedCounter(156, 1500, 800)
  const cardRef = useRef<HTMLDivElement>(null)
  
  // 3D tilt effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const rotateX = useTransform(y, [-100, 100], [8, -8])
  const rotateY = useTransform(x, [-100, 100], [-8, 8])
  
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 })
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 })
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(e.clientX - centerX)
    y.set(e.clientY - centerY)
  }
  
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }
  
  const skills = [
    { name: 'TypeScript', level: 95 },
    { name: 'React', level: 92 },
    { name: 'Node.js', level: 88 },
    { name: 'PostgreSQL', level: 85 },
    { name: 'Docker', level: 78 },
    { name: 'AWS', level: 75 },
  ]
  
  const projects = [
    { name: 'verify-stack', stars: 1247, tech: 'TypeScript • Full Stack' },
    { name: 'ai-code-review', stars: 892, tech: 'Python • ML' },
    { name: 'react-animations', stars: 534, tech: 'React • Framer Motion' },
  ]
  
  return (
    <motion.div 
      ref={cardRef}
      className="relative w-[480px] h-[600px] mx-auto perspective-1000"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transformStyle: 'preserve-3d',
        rotateX: springRotateX,
        rotateY: springRotateY
      }}
    >
      {/* Enhanced depth with stronger shadows */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-violet-600/20 rounded-2xl blur-xl opacity-50" />
      
      <div className="relative rounded-2xl border-2 border-border/80 bg-card/98 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden h-full">
        {/* Gradient header with pattern */}
        <div className="relative h-24 bg-purple-600 dark:bg-purple-700 overflow-hidden">
          {/* Pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjBMMjAgMEwwIDIwTDIwIDIwWiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50" />
          
          {/* Window controls */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/30" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
          </div>
          
          <div className="absolute top-3 right-3 flex items-center gap-2 text-xs text-white/70">
            <Eye className="w-3 h-3" />
            <span>Profile Preview</span>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="relative px-4 pb-4">
          {/* Avatar */}
          <motion.div 
            className="absolute -top-10 left-4 w-20 h-20 rounded-2xl border-4 border-card bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            KS
          </motion.div>
          
          {/* Verified badge */}
          <motion.div 
            className="absolute -top-4 left-[4.5rem] w-8 h-8 rounded-full bg-card flex items-center justify-center shadow-lg"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </motion.div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-3 pb-8">
            <motion.button
              className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageSquare className="w-4 h-4" />
            </motion.button>
            <motion.button
              className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isFollowing 
                  ? 'bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive' 
                  : 'bg-primary text-primary-foreground'
              }`}
              onClick={() => setIsFollowing(!isFollowing)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isFollowing ? 'Following ✓' : 'Follow'}
            </motion.button>
          </div>
          
          {/* Name & Bio */}
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-bold flex items-center gap-2">
              Keshav Sharma
              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-medium flex items-center gap-1">
                <Award className="w-3 h-3" />
                Pro
              </span>
            </h3>
            <p className="text-sm text-muted-foreground">Full Stack Developer • Open Source Enthusiast</p>
          </motion.div>
          
          {/* Stats Row */}
          <motion.div 
            className="flex gap-4 mb-4 pb-4 border-b border-border/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-lg font-bold">{commits.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">Commits</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-lg font-bold">{contributions}</div>
              <div className="text-[10px] text-muted-foreground">Contributions</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-lg font-bold text-primary">847</div>
              <div className="text-[10px] text-muted-foreground">AURA</div>
            </motion.div>
            <div className="flex-1" />
            <div className="flex items-center gap-1 text-xs text-emerald-500">
              <TrendingUp className="w-3 h-3" />
              <span className="font-medium">+15%</span>
            </div>
          </motion.div>
          
          {/* Skills */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Verified Skills</span>
              <Shield className="w-3 h-3 text-emerald-500" />
            </div>
            <SkillPillGroup skills={skills} baseDelay={0.6} />
          </div>
          
          {/* Projects */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Github className="w-3 h-3" />
                Top Projects
              </span>
              <motion.span 
                className="text-xs text-primary font-medium cursor-pointer"
                whileHover={{ x: 3 }}
              >
                View all →
              </motion.span>
            </div>
            {projects.map((project, i) => (
              <ProjectCard key={project.name} {...project} delay={1 + i * 0.12} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
