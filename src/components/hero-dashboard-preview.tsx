"use client"

/**
 * HeroDashboardPreview - Interactive dashboard mockup for landing page
 * Lightweight, pure CSS/Framer Motion animations - NO external dependencies
 * Features: animated stats, charts, skill bars, hover effects
 */

import { motion } from 'framer-motion'
import { 
  Sparkles, 
  FolderGit2, 
  Code2, 
  Target, 
  TrendingUp,
  CheckCircle2,
  Github,
  Star,
  Zap,
  Award,
  MousePointerClick
} from 'lucide-react'
import { useState, useEffect } from 'react'

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
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
  }, [end, duration])
  
  return count
}

// Interactive Circular Progress Component
function CircularProgress({ value, size = 80, delay = 0 }: { value: number, size?: number, delay?: number }) {
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const [animatedValue, setAnimatedValue] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedValue(value)
    }, delay)
    return () => clearTimeout(timeout)
  }, [value, delay])
  
  const offset = circumference - (animatedValue / 100) * circumference

  return (
    <motion.div 
      className="relative cursor-pointer" 
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isHovered ? "hsl(var(--primary))" : "hsl(var(--primary))"}
          strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, delay: delay / 1000, ease: "easeOut" }}
        />
      </svg>
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: delay / 1000 + 0.5 }}
      >
        <span className={`font-bold text-foreground transition-all ${isHovered ? 'text-2xl text-primary' : 'text-xl'}`}>
          {animatedValue}
        </span>
      </motion.div>
    </motion.div>
  )
}

// Interactive Skill Bar with click animation
function SkillBar({ name, percentage, delay = 0 }: { name: string, percentage: number, delay?: number }) {
  const [isClicked, setIsClicked] = useState(false)
  
  return (
    <motion.div 
      className="flex items-center gap-3 cursor-pointer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        setIsClicked(true)
        setTimeout(() => setIsClicked(false), 300)
      }}
    >
      <motion.div 
        className="w-2 h-2 rounded-full bg-primary shrink-0"
        animate={{ scale: isClicked ? [1, 1.5, 1] : 1 }}
        transition={{ duration: 0.3 }}
      />
      <span className="text-xs font-medium text-foreground w-20 truncate">{name}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: delay / 1000, ease: "easeOut" }}
          whileHover={{ filter: "brightness(1.2)" }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{percentage}%</span>
    </motion.div>
  )
}

// Interactive Mini Chart Bar
function ChartBar({ height, delay = 0 }: { height: number, delay?: number }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.div 
      className="w-6 bg-gradient-to-t from-primary/50 to-primary rounded-t-sm cursor-pointer relative group"
      initial={{ height: 0 }}
      animate={{ height: `${height}%` }}
      transition={{ duration: 0.8, delay: delay / 1000, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ filter: "brightness(1.3)", scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {isHovered && (
        <motion.div 
          className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-[10px] rounded whitespace-nowrap"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {height} pts
        </motion.div>
      )}
    </motion.div>
  )
}

// Stat Mini Card with interactive effects
function StatMini({ icon: Icon, label, value, delay = 0 }: { icon: any, label: string, value: number | string, delay?: number }) {
  const numericValue = typeof value === 'number' ? value : 0
  const animatedValue = useAnimatedCounter(numericValue, 1500 + delay)
  const displayValue = typeof value === 'number' ? animatedValue : value
  const [clicks, setClicks] = useState(0)
  
  return (
    <motion.div 
      className="p-3 rounded-xl bg-card/80 border border-border/50 backdrop-blur-sm cursor-pointer select-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      whileHover={{ scale: 1.05, borderColor: 'hsl(var(--primary) / 0.5)', boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.3)' }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setClicks(c => c + 1)}
    >
      <div className="flex items-center gap-2 mb-1">
        <motion.div 
          className="p-1.5 rounded-lg bg-primary/10"
          animate={{ rotate: clicks * 360 }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-3 h-3 text-primary" />
        </motion.div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-lg font-bold text-foreground">{displayValue}</div>
    </motion.div>
  )
}

// Interactive Project Card Mini
function ProjectMini({ name, score, tech, delay = 0 }: { name: string, score: number, tech: string, delay?: number }) {
  const [isStarred, setIsStarred] = useState(false)
  
  return (
    <motion.div 
      className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/30 hover:border-primary/30 transition-colors cursor-pointer"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      whileHover={{ x: 4, backgroundColor: 'hsl(var(--muted) / 0.5)' }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div 
        className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"
        whileHover={{ rotate: 10 }}
      >
        <Github className="w-4 h-4 text-blue-400" />
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-foreground truncate">{name}</div>
        <div className="text-[10px] text-muted-foreground">{tech}</div>
      </div>
      <motion.div 
        className="flex items-center gap-1 text-xs cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          setIsStarred(!isStarred)
        }}
        whileTap={{ scale: 1.3 }}
      >
        <motion.div animate={{ scale: isStarred ? [1, 1.3, 1] : 1 }}>
          <Star className={`w-3 h-3 ${isStarred ? 'text-amber-500 fill-amber-500' : 'text-amber-500'}`} />
        </motion.div>
        <span className="text-muted-foreground">{score + (isStarred ? 1 : 0)}</span>
      </motion.div>
    </motion.div>
  )
}

export function HeroDashboardPreview() {
  const chartData = [65, 45, 80, 55, 90, 70, 85]
  const skills = [
    { name: 'TypeScript', percentage: 92 },
    { name: 'React', percentage: 88 },
    { name: 'Node.js', percentage: 85 },
    { name: 'PostgreSQL', percentage: 78 },
  ]
  const projects = [
    { name: 'verify-stack', score: 847, tech: 'TypeScript' },
    { name: 'ai-chatbot', score: 723, tech: 'Python' },
    { name: 'e-commerce', score: 612, tech: 'React' },
  ]

  return (
    <motion.div 
      className="relative w-full max-w-lg mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      {/* Glow Effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-orange-500/10 to-pink-500/20 rounded-3xl blur-2xl opacity-60" />
      
      {/* Main Dashboard Card */}
      <div className="relative rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <motion.div className="w-3 h-3 rounded-full bg-red-500" whileHover={{ scale: 1.3 }} />
            <motion.div className="w-3 h-3 rounded-full bg-yellow-500" whileHover={{ scale: 1.3 }} />
            <motion.div className="w-3 h-3 rounded-full bg-green-500" whileHover={{ scale: 1.3 }} />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <MousePointerClick className="w-3 h-3" />
            <span>Interactive Preview</span>
          </div>
          <div className="w-16" />
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          
          {/* AURA Score Hero */}
          <motion.div 
            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-orange-500/5 to-transparent border border-primary/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ borderColor: 'hsl(var(--primary) / 0.5)' }}
          >
            <CircularProgress value={85} size={70} delay={800} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">AURA Score</span>
              </div>
              <motion.div 
                className="text-2xl font-bold text-foreground"
                whileHover={{ scale: 1.05 }}
              >
                847
              </motion.div>
              <div className="flex items-center gap-1 text-xs text-emerald-500">
                <TrendingUp className="w-3 h-3" />
                <span>+12% this week</span>
              </div>
            </div>
          </motion.div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <StatMini icon={FolderGit2} label="Projects" value={12} delay={600} />
            <StatMini icon={Code2} label="Skills" value={24} delay={700} />
            <StatMini icon={Target} label="Matches" value={8} delay={800} />
          </div>
          
          {/* Weekly Activity Chart */}
          <motion.div 
            className="p-3 rounded-xl bg-muted/30 border border-border/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            whileHover={{ borderColor: 'hsl(var(--primary) / 0.3)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">Weekly Activity</span>
              <Zap className="w-3 h-3 text-primary" />
            </div>
            <div className="flex items-end justify-between h-16 gap-1">
              {chartData.map((height, i) => (
                <ChartBar key={i} height={height} delay={1000 + i * 100} />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <span key={i} className="text-[10px] text-muted-foreground w-6 text-center">{day}</span>
              ))}
            </div>
          </motion.div>
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Skills */}
            <div className="p-3 rounded-xl bg-muted/20 border border-border/30 space-y-2">
              <div className="flex items-center gap-1 mb-2">
                <Code2 className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-foreground">Top Skills</span>
              </div>
              {skills.map((skill, i) => (
                <SkillBar key={skill.name} {...skill} delay={1200 + i * 150} />
              ))}
            </div>
            
            {/* Projects */}
            <div className="p-3 rounded-xl bg-muted/20 border border-border/30 space-y-2">
              <div className="flex items-center gap-1 mb-2">
                <FolderGit2 className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-foreground">Projects</span>
              </div>
              {projects.map((project, i) => (
                <ProjectMini key={project.name} {...project} delay={1400 + i * 150} />
              ))}
            </div>
          </div>
          
          {/* Verified Badge */}
          <motion.div 
            className="flex items-center justify-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 cursor-pointer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2 }}
            whileHover={{ scale: 1.02, backgroundColor: 'hsl(142 76% 36% / 0.15)' }}
            whileTap={{ scale: 0.98 }}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-500">Profile Verified</span>
            <Sparkles className="w-3 h-3 text-emerald-500" />
          </motion.div>
          
        </div>
      </div>
      
      {/* Floating Elements */}
      <motion.div 
        className="absolute -top-4 -right-4 p-3 rounded-xl bg-card/95 border border-border/60 shadow-xl backdrop-blur-sm cursor-pointer"
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Code Quality</div>
            <div className="text-sm font-bold text-emerald-500">Excellent</div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="absolute -bottom-2 -left-4 p-3 rounded-xl bg-card/95 border border-border/60 shadow-xl backdrop-blur-sm cursor-pointer"
        initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Skill Growth</div>
            <div className="text-sm font-bold text-primary">+23%</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
