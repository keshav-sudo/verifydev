"use client"

/**
 * InteractiveDashboardShowcase - Lightweight, optimized dashboard preview components
 * Removed heavy framer-motion animations for better performance and stability
 */

import { 
  Sparkles, 
  Code2, 
  Target, 
  TrendingUp,
  CheckCircle2,
  Github,
  Star,
  Award,
  Users,
  Eye,
  MessageSquare,
  MapPin,
  DollarSign,
  Share2,
  Activity,
  BarChart3,
  Shield,
  Rocket,
  Send
} from 'lucide-react'
import { useState } from 'react'

// ========== STATIC VALUES (no animations for stability) ==========
const STATIC_VALUES = {
  auraScore: 847,
  matchScore: 94,
  commits: 2847,
  contributions: 156
}

// ========== SIMPLE LINE CHART ==========

function SimpleLineChart() {
  const points = [20, 45, 30, 50, 35, 60, 45, 70, 55, 80, 65, 85]
  
  const pathD = points.map((point, i) => {
    const x = (i / (points.length - 1)) * 280
    const y = 100 - point
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')
  
  return (
    <div className="relative h-24 w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 to-transparent p-3">
      <svg className="w-full h-full" viewBox="0 0 280 100" preserveAspectRatio="none">
        {[25, 50, 75].map((y) => (
          <line
            key={y}
            x1="0" y1={y} x2="280" y2={y}
            stroke="hsl(var(--muted))"
            strokeWidth="0.5"
            strokeDasharray="4 4"
            opacity={0.3}
          />
        ))}
        
        <path
          d={`${pathD} L 280 100 L 0 100 Z`}
          fill="url(#areaGradient)"
          opacity={0.2}
        />
        
        <path
          d={pathD}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        <circle
          cx={280}
          cy={100 - points[points.length - 1]}
          r={4}
          fill="hsl(var(--primary))"
        />
        
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold">
        +27% Growth
      </div>
    </div>
  )
}

// ========== SIMPLE SKILL RADAR ==========

function SimpleSkillRadar() {
  const skills = [
    { name: 'Frontend', value: 90, angle: 0 },
    { name: 'Backend', value: 85, angle: 60 },
    { name: 'DevOps', value: 70, angle: 120 },
    { name: 'Mobile', value: 65, angle: 180 },
    { name: 'AI/ML', value: 75, angle: 240 },
    { name: 'Database', value: 80, angle: 300 },
  ]
  
  const getPoint = (value: number, angle: number) => {
    const radian = (angle - 90) * (Math.PI / 180)
    const radius = (value / 100) * 40
    return {
      x: 50 + radius * Math.cos(radian),
      y: 50 + radius * Math.sin(radian)
    }
  }
  
  const polygonPoints = skills.map(s => {
    const p = getPoint(s.value, s.angle)
    return `${p.x},${p.y}`
  }).join(' ')
  
  return (
    <div className="relative w-full aspect-square max-w-[120px] mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {[20, 40, 60, 80, 100].map((r) => (
          <circle
            key={r}
            cx="50" cy="50" r={r * 0.4}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="0.5"
            opacity={0.3}
          />
        ))}
        
        {skills.map((skill, i) => {
          const end = getPoint(100, skill.angle)
          return (
            <line
              key={i}
              x1="50" y1="50"
              x2={end.x} y2={end.y}
              stroke="hsl(var(--muted))"
              strokeWidth="0.5"
              opacity={0.3}
            />
          )
        })}
        
        <polygon
          points={polygonPoints}
          fill="hsl(var(--primary))"
          fillOpacity={0.2}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
        
        {skills.map((skill, i) => {
          const p = getPoint(skill.value, skill.angle)
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="hsl(var(--primary))"
            />
          )
        })}
      </svg>
      
      {skills.map((skill, i) => {
        const labelPoint = getPoint(130, skill.angle)
        return (
          <div
            key={i}
            className="absolute text-[7px] font-medium text-muted-foreground whitespace-nowrap"
            style={{
              left: `${labelPoint.x}%`,
              top: `${labelPoint.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {skill.name}
          </div>
        )
      })}
    </div>
  )
}

// ========== SIMPLE ACTIVITY HEATMAP ==========

function SimpleActivityHeatmap() {
  const weeks = 8
  const days = 7
  
  const getIntensity = (week: number, day: number) => {
    const seed = (week * 7 + day) * 13 % 100
    if (seed < 20) return 0
    if (seed < 40) return 1
    if (seed < 60) return 2
    if (seed < 80) return 3
    return 4
  }
  
  const intensityColors = [
    'bg-muted/30',
    'bg-primary/20',
    'bg-primary/40',
    'bg-primary/60',
    'bg-primary/80',
  ]
  
  return (
    <div className="space-y-1">
      <div className="flex gap-[2px]">
        {Array.from({ length: weeks }).map((_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[2px]">
            {Array.from({ length: days }).map((_, dayIndex) => {
              const intensity = getIntensity(weekIndex, dayIndex)
              return (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm ${intensityColors[intensity]}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-2">
        <span>Less</span>
        <div className="flex gap-1">
          {intensityColors.map((color, i) => (
            <div key={i} className={`w-2 h-2 rounded-sm ${color}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

// ========== ANALYTICS DASHBOARD PREVIEW ==========

export function AnalyticsDashboardPreview() {
  const auraScore = STATIC_VALUES.auraScore
  
  const metrics = [
    { label: 'Code Quality', value: 94, icon: Code2, color: 'text-blue-500' },
    { label: 'Consistency', value: 87, icon: Activity, color: 'text-green-500' },
    { label: 'Innovation', value: 92, icon: Rocket, color: 'text-purple-500' },
  ]
  
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-primary/15 to-purple-500/20 rounded-3xl blur-2xl opacity-60" />
      
      <div className="relative rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden h-[520px]">
        {/* Window controls */}
        <div className="flex items-center justify-between p-3 border-b border-border/40">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart3 className="w-3 h-3 text-primary" />
            <span>Analytics Dashboard</span>
          </div>
          <div className="w-12" />
        </div>
        
        <div className="p-4 space-y-3">
          {/* AURA Score Hero */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent border border-primary/20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">AURA Score</span>
              </div>
              <div className="text-3xl font-black text-foreground">
                {auraScore}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-500 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>Top 5% globally</span>
              </div>
            </div>
            <SimpleSkillRadar />
          </div>
          
          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-2">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="p-2.5 rounded-xl bg-muted/30 border border-transparent"
              >
                <metric.icon className={`w-3.5 h-3.5 ${metric.color} mb-1.5`} />
                <div className="text-base font-bold">{metric.value}%</div>
                <div className="text-[9px] text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
          
          {/* Chart */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-medium text-muted-foreground">Skill Growth Trend</span>
            <SimpleLineChart />
          </div>
          
          {/* Activity Heatmap */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-medium text-muted-foreground">Coding Activity</span>
            <SimpleActivityHeatmap />
          </div>
        </div>
      </div>
    </div>
  )
}

// ========== JOB CARD COMPONENT ==========

interface JobCardProps {
  company: string
  role: string
  location: string
  salary: string
  match: number
  logo: string
  tags: string[]
}

function JobCard({ company, role, location, salary, match, logo, tags }: JobCardProps) {
  return (
    <div className="p-3 rounded-xl bg-card/80 border border-border/50 hover:border-primary/40 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-base font-bold">
          {logo}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h4 className="font-semibold text-xs truncate">{role}</h4>
            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              match >= 90 ? 'bg-emerald-500/20 text-emerald-500' :
              match >= 80 ? 'bg-primary/20 text-primary' :
              'bg-muted text-muted-foreground'
            }`}>
              {match}%
            </div>
          </div>
          
          <p className="text-[10px] text-muted-foreground mb-1.5">{company}</p>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 3).map((tag) => (
              <span 
                key={tag} 
                className="px-1.5 py-0.5 rounded bg-muted/50 text-[8px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />
              {location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-2.5 h-2.5" />
              {salary}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ========== JOB MATCHING PREVIEW ==========

export function JobMatchingPreview() {
  const matchScore = STATIC_VALUES.matchScore
  
  const jobs = [
    { company: 'Stripe', role: 'Senior Frontend Engineer', location: 'Remote', salary: '$180-220K', match: 94, logo: '💳', tags: ['React', 'TypeScript', 'Node.js'] },
    { company: 'Vercel', role: 'Full Stack Developer', location: 'San Francisco', salary: '$160-200K', match: 89, logo: '▲', tags: ['Next.js', 'GraphQL', 'AWS'] },
  ]
  
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 via-primary/15 to-blue-500/20 rounded-3xl blur-2xl opacity-60" />
      
      <div className="relative rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden h-[520px]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/40">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Target className="w-3 h-3 text-green-500" />
            <span>Smart Job Matching</span>
          </div>
          <div className="w-12" />
        </div>
        
        <div className="p-4 space-y-3">
          {/* Match Score Hero */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-transparent border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold">Your Match Score</span>
                </div>
                <div className="text-3xl font-black text-emerald-500">
                  {matchScore}%
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Based on verified skills</p>
              </div>
              
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30" />
                <div className="absolute inset-2 rounded-full border-2 border-emerald-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Target className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Filter Tags */}
          <div className="flex gap-1.5 flex-wrap">
            {['Remote', 'Full-time', '$150K+', 'Frontend'].map((filter) => (
              <button
                key={filter}
                className="px-2.5 py-1 rounded-full text-[9px] font-medium bg-primary/10 text-primary"
              >
                {filter}
              </button>
            ))}
          </div>
          
          {/* Job Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-muted-foreground">Top Matches</span>
              <span className="text-[10px] text-primary font-medium">View all →</span>
            </div>
            {jobs.map((job) => (
              <JobCard key={job.company} {...job} />
            ))}
          </div>
          
          {/* Quick Apply */}
          <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold text-xs flex items-center justify-center gap-2">
            <Send className="w-3.5 h-3.5" />
            Quick Apply to All
          </button>
        </div>
      </div>
    </div>
  )
}

// ========== SKILL PILL ==========

function SkillPill({ name }: { name: string }) {
  return (
    <div className="px-2.5 py-1 rounded-full bg-muted/50 border border-border/50 text-[10px] font-medium">
      {name}
    </div>
  )
}

// ========== PROJECT CARD ==========

function ProjectCard({ name, stars, tech }: { name: string; stars: number; tech: string }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30 border border-border/30">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
        <Github className="w-4 h-4 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold truncate">{name}</h4>
        <p className="text-[9px] text-muted-foreground">{tech}</p>
      </div>
      
      <div className="flex items-center gap-1 text-[10px]">
        <Star className="w-3 h-3 text-amber-500" />
        <span className="text-muted-foreground">{stars.toLocaleString()}</span>
      </div>
    </div>
  )
}

// ========== PROFILE SHOWCASE PREVIEW ==========

export function ProfileShowcasePreview() {
  const commits = STATIC_VALUES.commits
  const contributions = STATIC_VALUES.contributions
  
  const skills = ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS']
  
  const projects = [
    { name: 'verify-stack', stars: 1247, tech: 'TypeScript • Full Stack' },
    { name: 'ai-code-review', stars: 892, tech: 'Python • ML' },
    { name: 'react-animations', stars: 534, tech: 'React • Framer Motion' },
  ]
  
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-primary/15 to-pink-500/20 rounded-3xl blur-2xl opacity-60" />
      
      <div className="relative rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden h-[520px]">
        {/* Header with gradient */}
        <div className="relative h-20 bg-gradient-to-r from-primary via-purple-500 to-pink-500">
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
          </div>
          
          <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] text-white/70">
            <Eye className="w-3 h-3" />
            <span>Profile Preview</span>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="relative px-4 pb-4">
          {/* Avatar */}
          <div className="absolute -top-8 left-4 w-16 h-16 rounded-xl border-4 border-card bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-xl">
            KS
          </div>
          
          {/* Verified badge */}
          <div className="absolute -top-2 left-[3.5rem] w-6 h-6 rounded-full bg-card flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-1.5 pt-2 pb-6">
            <button className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground">
              Follow
            </button>
          </div>
          
          {/* Name & Bio */}
          <div className="mb-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              Keshav Sharma
              <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-medium">Pro</span>
            </h3>
            <p className="text-xs text-muted-foreground">Full Stack Developer • Open Source Enthusiast</p>
          </div>
          
          {/* Stats Row */}
          <div className="flex gap-4 mb-3 pb-3 border-b border-border/50">
            <div className="text-center">
              <div className="text-base font-bold">{commits.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">Commits</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold">{contributions}</div>
              <div className="text-[9px] text-muted-foreground">Contributions</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-primary">847</div>
              <div className="text-[9px] text-muted-foreground">AURA</div>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-1 text-[10px] text-emerald-500">
              <TrendingUp className="w-3 h-3" />
              <span>+15%</span>
            </div>
          </div>
          
          {/* Skills */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">Verified Skills</span>
              <Shield className="w-3 h-3 text-emerald-500" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <SkillPill key={skill} name={skill} />
              ))}
            </div>
          </div>
          
          {/* Projects */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-muted-foreground">Top Projects</span>
              <span className="text-[10px] text-primary font-medium">View all →</span>
            </div>
            {projects.map((project) => (
              <ProjectCard key={project.name} {...project} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ========== MAIN SHOWCASE COMPONENT ==========

export function InteractiveDashboardShowcase() {
  const [activePreview, setActivePreview] = useState(0)
  
  const previews = [
    { name: 'Analytics', icon: BarChart3, gradient: 'from-blue-500 to-primary' },
    { name: 'Job Matching', icon: Target, gradient: 'from-green-500 to-emerald-500' },
    { name: 'Profile', icon: Users, gradient: 'from-purple-500 to-pink-500' },
  ]
  
  return (
    <div className="relative">
      {/* Preview Selector */}
      <div className="flex justify-center gap-2 mb-6">
        {previews.map((preview, i) => (
          <button
            key={preview.name}
            onClick={() => setActivePreview(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
              activePreview === i
                ? 'bg-gradient-to-r ' + preview.gradient + ' text-white shadow-lg'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <preview.icon className="w-4 h-4" />
            {preview.name}
          </button>
        ))}
      </div>
      
      {/* Active Preview - Only render ONE component */}
      <div className="h-[560px] flex items-start justify-center">
        {activePreview === 0 && <AnalyticsDashboardPreview />}
        {activePreview === 1 && <JobMatchingPreview />}
        {activePreview === 2 && <ProfileShowcasePreview />}
      </div>
      
      {/* Progress indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {previews.map((preview, i) => (
          <button
            key={i}
            className={`h-1.5 rounded-full ${
              i === activePreview 
                ? 'bg-gradient-to-r ' + preview.gradient + ' w-8' 
                : 'bg-muted/60 w-2'
            }`}
            onClick={() => setActivePreview(i)}
            aria-label={`View ${preview.name} preview`}
          />
        ))}
      </div>
    </div>
  )
}

