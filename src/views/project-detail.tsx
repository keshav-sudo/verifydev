"use client"

/**
 * Project Detail Page - Premium Analytics Edition
 * Shows comprehensive project analysis with detailed skill breakdown
 * Skills displayed with percentages (Redis 80%, TypeScript 95%, etc.)
 */

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AnalysisResults } from '@/components/features/project/AnalysisResults'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { get } from '@/api/client'
import { formatNumber, getLanguageColor, cn } from '@/lib/utils'
import { IntelligenceVerdictCard } from '@/components/intelligence-verdict-card'
import {
  ArrowLeft,
  ExternalLink,
  Star,
  GitFork,
  Users,
  GitCommit,
  Loader2,
  Code,

  TestTube,
  Gauge,
  Activity,
  Github,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  Server,
  Database,
  Shield,
  Box,
  Cloud,
  AlertTriangle,
  Lightbulb,
  Target,
  Layers,
  Building2,
  Network,
  BookOpen,
  Cpu,
  Lock,
  ChevronDown,
  ChevronUp,
  FolderTree,
  Brain,
  Award,
  Clock,
  Eye,
  Fingerprint,
  BarChart3,
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  FileCheck,
  Wrench,
  Rocket,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// V2 UI Components
import { 
  ProjectSummaryCard, 
  SkillCardV2, 
  ArchitectureCard, 
  RiskPanel
} from '@/components/skills'

import type { 
  SkillNode, 
  ArchitectureVerdict, 
  RiskProfile, 
  EvidenceChain
} from '@/types/intelligence-v2'

// Skill category icons
const categoryIcons: Record<string, typeof Code> = {
  language: Code,
  framework: Box,
  database: Database,
  infrastructure: Server,
  security: Shield,
  devops: GitCommit,
  tool: Gauge,
  architecture: Building2,
  cloud: Cloud,
  testing: TestTube,
  messaging: Network,
  observability: Activity,
  performance: Zap,
}

// Skill category colors
const categoryColors: Record<string, string> = {
  language: 'from-indigo-500 to-purple-500',
  framework: 'from-emerald-500 to-teal-500',
  database: 'from-blue-500 to-cyan-500',
  infrastructure: 'from-orange-500 to-amber-500',
  security: 'from-red-500 to-pink-500',
  devops: 'from-violet-500 to-purple-500',
  tool: 'from-gray-500 to-slate-500',
  architecture: 'from-purple-500 to-indigo-500',
  cloud: 'from-sky-500 to-blue-500',
  testing: 'from-green-500 to-emerald-500',
  messaging: 'from-pink-500 to-rose-500',
  observability: 'from-yellow-500 to-orange-500',
  performance: 'from-amber-500 to-yellow-500',
}

// Priority colors for optimizations
const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  low: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
}

// ============================================
// DATA MAPPING HELPERS (Bridge API to V2 Types)
// ============================================

// Map API skill to SkillNode for SkillCardV2
const mapToSkillNode = (skill: any, category: string): SkillNode => {
  if (!skill) {
    return {
      id: 'unknown',
      name: 'Unknown',
      category: category || 'tool',
      tier: 1,
      isClaimed: false,
      isInferred: false,
      rawConfidence: 0,
      netConfidence: 0
    }
  }

  // API returns confidence as 0-1, convert to 0-100 for display
  const rawConfidence = skill.confidence != null ? skill.confidence * 100 : 0
  const isVerified = skill.resumeReady || rawConfidence >= 80
  const isInferred = !isVerified && rawConfidence > 0
  
  // Filter out warning messages from evidence (those with ⚠️)
  const cleanEvidence = Array.isArray(skill.evidence) 
    ? skill.evidence.filter((e: string) => !e.includes('⚠️'))
    : []
  
  const evidence: EvidenceChain | undefined = cleanEvidence.length > 0 ? {
    skillName: skill.name || 'Unknown',
    items: cleanEvidence.map((e: any) => ({
      type: 'PATTERN',
      description: typeof e === 'string' ? e : (e?.label || e?.description || 'Evidence item'),
      strength: 'STRONG',
      isAnti: false
    })),
    antiItems: [],
    netConfidence: rawConfidence,
    totalStrength: cleanEvidence.length,
    antiStrength: 0
  } : undefined

  return {
    id: (skill.name || 'unknown').toLowerCase().replace(/\s+/g, '-'),
    name: skill.name || 'Unknown Skill',
    category: skill.category || category || 'tool',
    tier: 1,
    isClaimed: isVerified,
    isInferred: isInferred,
    rawConfidence: rawConfidence,
    netConfidence: rawConfidence,
    evidence
  }
}

// Map API architecture data to ArchitectureVerdict
const mapToArchitectureVerdict = (arch: any): ArchitectureVerdict => {
  if (!arch || !arch.type) {
    return {
      style: 'UNKNOWN',
      maturity: 3,
      isJustified: false,
      justificationScore: 0,
      justificationLevel: 'PARTIALLY_JUSTIFIED',
      explanation: 'No architecture information available',
      strengths: [],
      cargoCultWarnings: [],
      tradeoffAnalysis: []
    }
  }

  const justificationScore = arch.justificationScore != null ? arch.justificationScore : 0.8
  const maturityMap: Record<string, number> = {
    'SENIOR': 8,
    'INTERMEDIATE': 5,
    'JUNIOR': 3,
    'PRODUCTION': 7,
    'ADVANCED': 6,
    'EXPERT': 9,
  }
  const maturity = maturityMap[arch.engineeringLevel?.toUpperCase()] || 5
  
  return {
    style: (arch.type?.toUpperCase() as any) || 'UNKNOWN',
    maturity,
    isJustified: justificationScore > 0.6,
    justificationScore,
    justificationLevel: justificationScore > 0.8 ? 'FULLY_JUSTIFIED' : 'PARTIALLY_JUSTIFIED',
    explanation: arch.explanation || `Detected ${arch.type} architecture${arch.patterns?.length ? ` with ${arch.patterns.length} recognized patterns` : ''}.`,
    strengths: Array.isArray(arch.patterns) ? arch.patterns : [],
    cargoCultWarnings: [],
    tradeoffAnalysis: []
  }
}

// Map API data to RiskProfile
const mapToRiskProfile = (verdict: any): RiskProfile => {
  if (!verdict) {
    return {
      riskLevel: 'LOW',
      unknowns: [],
      highRiskCount: 0,
      mediumRiskCount: 0,
      hiringImpact: "No assessment data available.",
      recommendations: [],
      confidenceAdjust: 0
    }
  }

  const risks = Array.isArray(verdict?.riskSignals) ? verdict.riskSignals : []
  
  return {
    riskLevel: risks.length > 2 ? 'HIGH' : risks.length > 0 ? 'MODERATE' : 'LOW',
    unknowns: risks.map((r: any) => ({
      type: 'AMBIGUOUS',
      description: typeof r === 'string' ? r : (r?.message || r?.description || 'Unknown risk'),
      impact: r?.severity || 'MEDIUM',
      affects: []
    })),
    highRiskCount: risks.filter((r: any) => r?.severity === 'HIGH').length,
    mediumRiskCount: risks.filter((r: any) => !r?.severity || r?.severity === 'MEDIUM').length,
    hiringImpact: risks.length > 0 
      ? "Standard interview recommended with focus on identified risk areas."
      : "Strong technical signals suggest low hiring risk.",
    recommendations: [],
    confidenceAdjust: 0
  }
}

// ============================================
// SKILLS RADAR CHART
// ============================================
function SkillsDistributionChart({ skills }: { skills: SkillData[] }) {
  const data = useMemo(() => {
    // Group skills by category and calculate average score
    const categories: Record<string, { total: number; count: number }> = {}
    
    skills.forEach(skill => {
      const cat = skill.category || 'tool'
      // Normalize category names
      const normalizedCat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()
      
      if (!categories[normalizedCat]) {
        categories[normalizedCat] = { total: 0, count: 0 }
      }
      
      const score = skill.confidence 
        ? skill.confidence * 100 
        : (skill.score || skill.verifiedScore || 0)
        
      categories[normalizedCat].total += score
      categories[normalizedCat].count += 1
    })
    
    return Object.entries(categories)
      .map(([subject, stats]) => ({
        subject,
        A: Math.round(stats.total / stats.count),
        fullMark: 100,
      }))
      .sort((a, b) => b.A - a.A) // Sort by score for better visual
      .slice(0, 6) // Top 6 categories to avoid clutter
  }, [skills])

  if (data.length < 3) return null

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Skill Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <Radar
                name="Proficiency"
                dataKey="A"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))' 
                }}
                formatter={(value: number) => [`${value}%`, 'Proficiency']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// SKILL BREAKDOWN CARD - Shows skill with %
// ============================================
interface SkillData {
  name: string
  category?: string
  level?: string
  confidence?: number
  score?: number
  verifiedScore?: number
  evidence?: string[]
  resumeReady?: boolean
  keywords?: string[]
  weight?: number
}



// ============================================
// CIRCULAR SCORE
// ============================================
function CircularScore({ value, size = 120, label }: { value: number, size?: number, label?: string }) {
  const safeValue = isNaN(value) ? 0 : Math.min(100, Math.max(0, value))
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (safeValue / 100) * circumference

  const getColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500'
    if (score >= 60) return 'text-blue-500'
    if (score >= 40) return 'text-amber-500'
    return 'text-muted-foreground'
  }

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-1000", getColor(safeValue))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold", getColor(safeValue))}>{Math.round(safeValue)}</span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  )
}

// ============================================
// ARCHITECTURE DISPLAY
// ============================================
interface ArchitectureData {
  type?: string
  communication?: string[]
  serviceCount?: number
  services?: string[]
  patterns?: string[]
  engineeringLevel?: string
}

function LegacyArchitectureCard({ architecture, folderStructure }: { architecture: ArchitectureData; folderStructure?: any }) {
  if (!architecture) return null
  
  const archTypeLabels: Record<string, string> = {
    microservices: 'Microservices',
    MICROSERVICES: 'Microservices',
    monolith: 'Monolithic',
    MONOLITH: 'Monolithic',
    monorepo: 'Monorepo',
    MONOREPO: 'Monorepo',
    serverless: 'Serverless',
    SERVERLESS: 'Serverless',
    event_driven: 'Event-Driven',
    EVENT_DRIVEN: 'Event-Driven',
    modular_monolith: 'Modular Monolith',
    MODULAR_MONOLITH: 'Modular Monolith',
    layered: 'Layered',
    LAYERED: 'Layered',
    hexagonal: 'Hexagonal',
    HEXAGONAL: 'Hexagonal',
    clean_architecture: 'Clean Architecture',
    CLEAN_ARCHITECTURE: 'Clean Architecture',
    MVC: 'MVC',
    mvc: 'MVC',
    FULLSTACK: 'Full Stack',
    fullstack: 'Full Stack',
  }
  
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-purple-500" />
          System Architecture
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4">
          {/* Architecture Type */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Architecture Type</p>
              <p className="text-lg font-bold text-purple-400">
                {archTypeLabels[architecture.type || ''] || architecture.type || 'Standard'}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-purple-500/50" />
          </div>
          
          {/* Service Count */}
          {architecture.serviceCount && architecture.serviceCount > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Services</p>
                <p className="text-lg font-bold text-blue-400">{architecture.serviceCount} Services</p>
              </div>
              <Server className="h-8 w-8 text-blue-500/50" />
            </div>
          )}
          
          {/* Folder Structure */}
          {folderStructure?.topLevelFolders && folderStructure.topLevelFolders.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5" />
                Top-Level Folders ({folderStructure.topLevelFolders.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {folderStructure.topLevelFolders.map((folder: string, i: number) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="bg-muted/50 font-mono text-xs"
                  >
                    📁 {folder}
                  </Badge>
                ))}
              </div>
              {folderStructure.maxDepth && (
                <p className="text-xs text-muted-foreground mt-2">
                  Max depth: {folderStructure.maxDepth} levels
                </p>
              )}
            </div>
          )}
          
          {/* Services List */}
          {architecture.services && architecture.services.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Service Names</p>
              <div className="flex flex-wrap gap-2">
                {architecture.services.map((service, i) => (
                  <Badge key={i} variant="outline" className="bg-muted/50">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Communication */}
          {architecture.communication && architecture.communication.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Communication Protocols</p>
              <div className="flex flex-wrap gap-2">
                {architecture.communication.map((comm, i) => (
                  <Badge key={i} className="bg-cyan-500/15 text-cyan-400 border-cyan-500/30">
                    {comm.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Patterns */}
          {architecture.patterns && architecture.patterns.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Detected Patterns</p>
              <div className="flex flex-wrap gap-2">
                {architecture.patterns.map((pattern, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {pattern}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Engineering Level */}
          {architecture.engineeringLevel && (
            <div className="flex items-center gap-2 mt-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Engineering Level:</span>
              <Badge className={cn(
                architecture.engineeringLevel === 'Production-grade' || architecture.engineeringLevel === 'PRODUCTION'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : architecture.engineeringLevel === 'Advanced' || architecture.engineeringLevel === 'ADVANCED'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-amber-500/20 text-amber-400'
              )}>
                {architecture.engineeringLevel}
              </Badge>
            </div>
          )}
          
          {/* Architecture Feature Flags */}
          {(architecture as any).hasAPIGateway != null && (
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-border/20">
              {[
                { key: 'hasAPIGateway', label: 'API Gateway', icon: '🌐' },
                { key: 'hasMessageQueue', label: 'Message Queue', icon: '📨' },
                { key: 'hasSharedLibraries', label: 'Shared Libraries', icon: '📦' },
              ].map(({ key, label, icon }) => {
                const val = (architecture as any)[key]
                if (val == null) return null
                return (
                  <div key={key} className={cn("flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border",
                    val ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-muted/30 text-muted-foreground border-border/30'
                  )}>
                    <span>{icon}</span>
                    <span>{label}</span>
                    {val ? <CheckCircle2 className="w-3 h-3" /> : <span className="opacity-50">✗</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// TECH STACK DISPLAY - ENHANCED
// ============================================
interface TechStackData {
  languages?: { name: string; percentage: number }[]
  frameworks?: string[]
  databases?: string[]
  tools?: string[]
  infrastructure?: string[]
  messaging?: string[]
  cloud?: string[]
  observability?: string[]
  testing?: string[]
}

interface InfraSignals {
  signals?: string[]
  signalDetails?: Record<string, { signal: string; confidence: number; evidence: string[] }>
}

// Map infra signals to readable names and categories
const signalToTechMapping: Record<string, { name: string; category: string }> = {
  'docker_compose': { name: 'Docker Compose', category: 'infrastructure' },
  'docker': { name: 'Docker', category: 'infrastructure' },
  'kubernetes': { name: 'Kubernetes', category: 'infrastructure' },
  'nginx': { name: 'Nginx', category: 'infrastructure' },
  'traefik': { name: 'Traefik', category: 'infrastructure' },
  'redis': { name: 'Redis', category: 'database' },
  'postgres': { name: 'PostgreSQL', category: 'database' },
  'mongodb': { name: 'MongoDB', category: 'database' },
  'mysql': { name: 'MySQL', category: 'database' },
  'rabbitmq': { name: 'RabbitMQ', category: 'messaging' },
  'kafka': { name: 'Apache Kafka', category: 'messaging' },
  'message_producer': { name: 'Message Queue', category: 'messaging' },
  'message_consumer': { name: 'Event Consumer', category: 'messaging' },
  'websocket': { name: 'WebSocket', category: 'realtime' },
  'graphql': { name: 'GraphQL', category: 'api' },
  'grpc': { name: 'gRPC', category: 'api' },
  'rest_api': { name: 'REST API', category: 'api' },
  'prometheus': { name: 'Prometheus', category: 'observability' },
  'grafana': { name: 'Grafana', category: 'observability' },
  'elastic': { name: 'Elasticsearch', category: 'observability' },
  'opentelemetry': { name: 'OpenTelemetry', category: 'observability' },
  'sentry': { name: 'Sentry', category: 'observability' },
  'aws': { name: 'AWS', category: 'cloud' },
  'gcp': { name: 'Google Cloud', category: 'cloud' },
  'azure': { name: 'Azure', category: 'cloud' },
  's3': { name: 'AWS S3', category: 'cloud' },
  'lambda': { name: 'AWS Lambda', category: 'cloud' },
  'jest': { name: 'Jest', category: 'testing' },
  'cypress': { name: 'Cypress', category: 'testing' },
  'tdd': { name: 'TDD', category: 'testing' },
  'llm': { name: 'LLM/AI', category: 'ml' },
  'circuit_breaker': { name: 'Circuit Breaker', category: 'pattern' },
  'retry_logic': { name: 'Retry Pattern', category: 'pattern' },
  'api_gateway_pattern': { name: 'API Gateway', category: 'pattern' },
  'health_endpoints': { name: 'Health Checks', category: 'devops' },
  'graceful_shutdown': { name: 'Graceful Shutdown', category: 'devops' },
  'ci_cd': { name: 'CI/CD', category: 'devops' },
  'github_actions': { name: 'GitHub Actions', category: 'devops' },
  'rbac': { name: 'RBAC', category: 'security' },
  'jwt': { name: 'JWT Auth', category: 'security' },
  'oauth': { name: 'OAuth', category: 'security' },
  'password_hashing': { name: 'Password Hashing', category: 'security' },
}

function TechStackCard({ techStack, skills, infraSignals }: { 
  techStack: TechStackData; 
  skills?: any[];
  infraSignals?: InfraSignals 
}) {
  if (!techStack && (!skills || skills.length === 0) && !infraSignals) return null
  
  const languages = techStack?.languages || []
  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
  
  // Extract technologies from skills by category
  const skillsByCategory = (skills || []).reduce((acc: Record<string, string[]>, skill: any) => {
    const cat = skill.category || 'tool'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill.name)
    return acc
  }, {})
  
  // Extract technologies from infraSignals
  const signalTechs: Record<string, string[]> = {
    infrastructure: [],
    database: [],
    messaging: [],
    realtime: [],
    api: [],
    observability: [],
    cloud: [],
    testing: [],
    ml: [],
    pattern: [],
    devops: [],
    security: [],
  }
  
  if (infraSignals?.signals) {
    infraSignals.signals.forEach(signal => {
      const tech = signalToTechMapping[signal]
      if (tech && signalTechs[tech.category]) {
        if (!signalTechs[tech.category].includes(tech.name)) {
          signalTechs[tech.category].push(tech.name)
        }
      }
    })
  }
  
  // Merge all sources
  const databases = [...new Set([
    ...(techStack?.databases || []), 
    ...(skillsByCategory.database || []),
    ...signalTechs.database
  ])]
  const frameworks = [...new Set([
    ...(techStack?.frameworks || []), 
    ...(skillsByCategory.framework || [])
  ])]
  const infrastructure = [...new Set([
    ...(techStack?.infrastructure || []), 
    ...(skillsByCategory.infrastructure || []),
    ...signalTechs.infrastructure
  ])]
  const messaging = [...new Set([
    ...(techStack?.messaging || []), 
    ...(skillsByCategory.messaging || []),
    ...signalTechs.messaging
  ])]
  const realtime = signalTechs.realtime
  const apiTech = signalTechs.api
  const cloud = [...new Set([
    ...(techStack?.cloud || []), 
    ...(skillsByCategory.cloud || []),
    ...signalTechs.cloud
  ])]
  const observability = [...new Set([
    ...(techStack?.observability || []), 
    ...(skillsByCategory.observability || []),
    ...signalTechs.observability
  ])]
  const testing = [...new Set([
    ...(techStack?.testing || []), 
    ...(skillsByCategory.testing || []),
    ...signalTechs.testing
  ])]
  const devops = [...new Set([...(skillsByCategory.devops || []), ...signalTechs.devops])]
  const security = signalTechs.security
  const patterns = signalTechs.pattern
  const mlTech = signalTechs.ml
  const tools = [...new Set([...(techStack?.tools || []), ...(skillsByCategory.tool || [])])]
  
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-cyan-500" />
          Technology Stack
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Languages Pie Chart */}
        {languages.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium mb-4">Language Distribution</p>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie
                    data={languages}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="percentage"
                  >
                    {languages.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {languages.slice(0, 5).map((lang, i) => (
                  <div key={lang.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-sm flex-1">{lang.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {lang.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Tech Categories Grid */}
        <div className="space-y-4">
          {/* Frameworks */}
          {frameworks.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Box className="w-3 h-3" /> Frameworks
              </p>
              <div className="flex flex-wrap gap-2">
                {frameworks.map((fw, i) => (
                  <Badge key={i} className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                    {fw}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Databases */}
          {databases.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Database className="w-3 h-3" /> Databases
              </p>
              <div className="flex flex-wrap gap-2">
                {databases.map((db, i) => (
                  <Badge key={i} className="bg-blue-500/15 text-blue-400 border-blue-500/30">
                    {db}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Infrastructure (Nginx, Docker, K8s, etc.) */}
          {infrastructure.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Server className="w-3 h-3" /> Infrastructure
              </p>
              <div className="flex flex-wrap gap-2">
                {infrastructure.map((infra, i) => (
                  <Badge key={i} className="bg-orange-500/15 text-orange-400 border-orange-500/30">
                    {infra}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Messaging (RabbitMQ, Kafka) */}
          {messaging.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Network className="w-3 h-3" /> Messaging / Queues
              </p>
              <div className="flex flex-wrap gap-2">
                {messaging.map((msg, i) => (
                  <Badge key={i} className="bg-pink-500/15 text-pink-400 border-pink-500/30">
                    {msg}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Cloud Services */}
          {cloud.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Cloud className="w-3 h-3" /> Cloud Services
              </p>
              <div className="flex flex-wrap gap-2">
                {cloud.map((c, i) => (
                  <Badge key={i} className="bg-sky-500/15 text-sky-400 border-sky-500/30">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Observability */}
          {observability.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Observability
              </p>
              <div className="flex flex-wrap gap-2">
                {observability.map((obs, i) => (
                  <Badge key={i} className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30">
                    {obs}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* DevOps */}
          {devops.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <GitCommit className="w-3 h-3" /> DevOps
              </p>
              <div className="flex flex-wrap gap-2">
                {devops.map((d, i) => (
                  <Badge key={i} className="bg-violet-500/15 text-violet-400 border-violet-500/30">
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Real-time */}
          {realtime.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Real-time
              </p>
              <div className="flex flex-wrap gap-2">
                {realtime.map((rt, i) => (
                  <Badge key={i} className="bg-purple-500/15 text-purple-400 border-purple-500/30">
                    {rt}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* API Technologies */}
          {apiTech.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Network className="w-3 h-3" /> API Technologies
              </p>
              <div className="flex flex-wrap gap-2">
                {apiTech.map((api, i) => (
                  <Badge key={i} className="bg-indigo-500/15 text-indigo-400 border-indigo-500/30">
                    {api}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Security */}
          {security.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Security
              </p>
              <div className="flex flex-wrap gap-2">
                {security.map((sec, i) => (
                  <Badge key={i} className="bg-red-500/15 text-red-400 border-red-500/30">
                    {sec}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Design Patterns */}
          {patterns.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Design Patterns
              </p>
              <div className="flex flex-wrap gap-2">
                {patterns.map((p, i) => (
                  <Badge key={i} className="bg-teal-500/15 text-teal-400 border-teal-500/30">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* ML/AI */}
          {mlTech.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> ML / AI
              </p>
              <div className="flex flex-wrap gap-2">
                {mlTech.map((ml, i) => (
                  <Badge key={i} className="bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30">
                    {ml}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Testing */}
          {testing.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <TestTube className="w-3 h-3" /> Testing
              </p>
              <div className="flex flex-wrap gap-2">
                {testing.map((t, i) => (
                  <Badge key={i} className="bg-green-500/15 text-green-400 border-green-500/30">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Other Tools */}
          {tools.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Gauge className="w-3 h-3" /> Other Tools
              </p>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool, i) => (
                  <Badge key={i} variant="outline">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// OPTIMIZATIONS CARD
// ============================================
interface OptimizationData {
  category: string
  priority: string
  title: string
  description: string
  impact: string
}

function OptimizationsCard({ optimizations }: { optimizations: OptimizationData[] }) {
  if (!optimizations || optimizations.length === 0) return null
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return Zap
      case 'security': return Lock
      case 'testing': return TestTube
      case 'documentation': return BookOpen
      default: return Lightbulb
    }
  }
  
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Optimization Suggestions
          <Badge variant="secondary" className="ml-auto">{optimizations.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {optimizations.map((opt, i) => {
          const colors = priorityColors[opt.priority] || priorityColors.low
          const Icon = getCategoryIcon(opt.category)
          
          return (
            <div 
              key={i}
              className={cn(
                "p-4 rounded-xl border",
                colors.bg,
                colors.border
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg", colors.bg)}>
                  <Icon className={cn("h-4 w-4", colors.text)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{opt.title}</h4>
                    <Badge className={cn("text-xs", colors.bg, colors.text, colors.border)}>
                      {opt.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{opt.description}</p>
                  <p className="text-xs flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-400">{opt.impact}</span>
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// ============================================
// BEST PRACTICES CARD
// ============================================
interface BestPracticesData {
  followed: string[]
  missing: string[]
  score: number
}

function BestPracticesCard({ bestPractices }: { bestPractices: BestPracticesData }) {
  if (!bestPractices) return null
  
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Best Practices
          </div>
          <CircularScore value={bestPractices.score} size={60} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Followed */}
        {bestPractices.followed && bestPractices.followed.length > 0 && (
          <div>
            <p className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Following ({bestPractices.followed.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {bestPractices.followed.map((practice, i) => (
                <Badge key={i} className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                  {practice}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Missing */}
        {bestPractices.missing && bestPractices.missing.length > 0 && (
          <div>
            <p className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Missing ({bestPractices.missing.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {bestPractices.missing.map((practice, i) => (
                <Badge key={i} variant="outline" className="text-amber-400 border-amber-500/30">
                  {practice}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// FRAMEWORK ANALYSIS CARD
// ============================================
interface FrameworkAnalysisData {
  framework: string
  patternsDetected: string[]
  suggestions: string[]
  advancedUsage?: string[]
}

function FrameworkAnalysisCard({ frameworkAnalysis }: { frameworkAnalysis: FrameworkAnalysisData }) {
  if (!frameworkAnalysis) return null
  
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Box className="h-5 w-5 text-emerald-500" />
          Framework Analysis
          <Badge className="ml-2 bg-emerald-500/20 text-emerald-400">
            {frameworkAnalysis.framework}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Patterns Detected */}
        {frameworkAnalysis.patternsDetected && frameworkAnalysis.patternsDetected.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Patterns Detected</p>
            <div className="flex flex-wrap gap-2">
              {frameworkAnalysis.patternsDetected.map((pattern, i) => (
                <Badge key={i} variant="secondary">
                  {pattern}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Advanced Usage */}
        {frameworkAnalysis.advancedUsage && frameworkAnalysis.advancedUsage.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Advanced Usage</p>
            <div className="flex flex-wrap gap-2">
              {frameworkAnalysis.advancedUsage.map((usage, i) => (
                <Badge key={i} className="bg-purple-500/15 text-purple-400 border-purple-500/30">
                  {usage}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Suggestions */}
        {frameworkAnalysis.suggestions && frameworkAnalysis.suggestions.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Suggestions</p>
            <ul className="space-y-2">
              {frameworkAnalysis.suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// COMPLEXITY CARD
// ============================================
interface ComplexityData {
  totalScore: number
  architectureScore: number
  infrastructureScore: number
  codeQualityScore: number
  scaleLabel: string
}

function ComplexityCard({ complexity }: { complexity?: ComplexityData }) {
  if (!complexity) return null

  return (
    <Card className="border-border/50 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-indigo-500" />
          Project Complexity
          <Badge className={cn("ml-2", 
            complexity.scaleLabel === 'Enterprise' ? "bg-purple-500/20 text-purple-400" :
            complexity.scaleLabel === 'Growth/Scaleup' ? "bg-indigo-500/20 text-indigo-400" :
            "bg-blue-500/20 text-blue-400"
          )}>
            {complexity.scaleLabel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="shrink-0">
             <CircularScore value={complexity.totalScore} size={100} label="Complexity" />
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span>Architecture</span>
                <span className="font-bold text-indigo-400">{Math.round(complexity.architectureScore)}/100</span>
              </div>
              <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                  style={{ width: `${complexity.architectureScore}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span>Infrastructure</span>
                <span className="font-bold text-pink-400">{Math.round(complexity.infrastructureScore)}/100</span>
              </div>
              <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500" 
                  style={{ width: `${complexity.infrastructureScore}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span>Code Quality</span>
                <span className="font-bold text-emerald-400">{Math.round(complexity.codeQualityScore)}/100</span>
              </div>
              <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" 
                  style={{ width: `${complexity.codeQualityScore}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// ARCHITECTURE GRAPH VIEW
// ============================================
interface GraphNode {
  id: string
  label: string
  type: string
  technology: string
}

interface GraphEdge {
  source: string
  target: string
  type: string
}

interface ArchitectureGraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

function ArchitectureGraphView({ graph }: { graph?: ArchitectureGraphData }) {
  if (!graph || graph.nodes.length === 0) return null
  
  // Simple visualization for now - just nodes and connection list
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'service': return Server
      case 'database': return Database
      case 'queue': return Network
      case 'gateway': return Layers
      case 'frontend': return Code
      default: return Box
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'service': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'database': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'queue': return 'bg-pink-500/10 text-pink-400 border-pink-500/20'
      case 'gateway': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'frontend': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-teal-500" />
          System Topology
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Nodes Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {graph.nodes.map(node => {
            const Icon = getIcon(node.type)
            return (
              <div key={node.id} className={cn("p-4 rounded-xl border flex flex-col items-center text-center gap-2", getColor(node.type))}>
                <Icon className="h-6 w-6 mb-1" />
                <span className="font-bold text-sm truncate w-full" title={node.label}>{node.label}</span>
                <span className="text-[10px] uppercase opacity-70 tracking-wider font-semibold">{node.type}</span>
                {node.technology && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 mt-1 bg-background/50">
                    {node.technology}
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Edges / Flows */}
        {graph.edges.length > 0 && (
          <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Communication Flows</h4>
            <div className="space-y-2">
              {graph.edges.map((edge, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="font-medium">{graph.nodes.find(n => n.id === edge.source)?.label || edge.source}</span>
                  <div className="flex-1 h-px bg-border flex items-center justify-center relative">
                     <span className="absolute -top-2 text-[10px] text-muted-foreground bg-background px-1">connects to</span>
                     <div className="absolute right-0 top-1/2 -mt-[3px] w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[6px] border-l-border" />
                  </div>
                  <span className="font-medium">{graph.nodes.find(n => n.id === edge.target)?.label || edge.target}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// CODE QUALITY INDICATORS CARD
// ============================================
function CodeQualityIndicatorsCard({ codeQuality, folderStructure, metrics: fileMetrics }: { 
  codeQuality: any; 
  folderStructure?: any;
  metrics?: any 
}) {
  if (!codeQuality) return null
  
  const checks = [
    { label: 'README', value: codeQuality.hasReadme, icon: '📄' },
    { label: 'License', value: codeQuality.hasLicense, icon: '📜' },
    { label: '.gitignore', value: codeQuality.hasGitignore, icon: '🔒' },
    { label: '.env Example', value: codeQuality.hasEnvExample, icon: '⚙️' },
    { label: 'Dockerfile', value: codeQuality.hasDockerfile, icon: '🐳' },
    { label: 'Docker Compose', value: codeQuality.hasDockerCompose, icon: '🐙' },
    { label: 'CI/CD', value: codeQuality.hasCI, icon: '🔄' },
    { label: 'Linting', value: codeQuality.hasLinting, icon: '🧹' },
    { label: 'Prettier', value: codeQuality.hasPrettier, icon: '✨' },
    { label: 'TypeScript', value: codeQuality.hasTypeScript, icon: '🔷' },
    { label: 'Makefile', value: codeQuality.hasMakefile, icon: '🔧' },
  ].filter(c => c.value != null)
  
  const passed = checks.filter(c => c.value).length
  const total = checks.length
  
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center">
            <FileCheck className="h-5 w-5 text-emerald-400" />
          </div>
          Code Quality Indicators
          <Badge variant="secondary" className="ml-auto">{passed}/{total} passed</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* File Metrics */}
        {fileMetrics && (
          <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-border/20">
            {fileMetrics.totalLines != null && (
              <div className="text-center p-3 rounded-xl bg-muted/20 border border-border/20">
                <p className="text-2xl font-bold text-primary">{fileMetrics.totalLines.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lines of Code</p>
              </div>
            )}
            {fileMetrics.totalFiles != null && (
              <div className="text-center p-3 rounded-xl bg-muted/20 border border-border/20">
                <p className="text-2xl font-bold text-blue-400">{fileMetrics.totalFiles}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Files</p>
              </div>
            )}
            {codeQuality.testFilesCount != null && (
              <div className="text-center p-3 rounded-xl bg-muted/20 border border-border/20">
                <p className="text-2xl font-bold text-amber-400">{codeQuality.testFilesCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Test Files</p>
              </div>
            )}
          </div>
        )}
        
        {/* Check Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {checks.map((check, i) => (
            <div key={i} className={cn(
              "flex items-center gap-2 p-2.5 rounded-lg border text-sm",
              check.value 
                ? 'bg-emerald-500/5 border-emerald-500/15 text-foreground' 
                : 'bg-muted/10 border-border/20 text-muted-foreground'
            )}>
              <span className="text-base">{check.icon}</span>
              <span className="flex-1 truncate">{check.label}</span>
              {check.value 
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                : <AlertTriangle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              }
            </div>
          ))}
        </div>
        
        {/* CI Platform */}
        {codeQuality.ciPlatform && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>CI Platform:</span>
            <Badge variant="secondary" className="text-xs">{codeQuality.ciPlatform}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// DIMENSIONAL ANALYSIS CARD - 6 Dimensions
// ============================================
interface DimensionalData {
  fundamentalsScore?: number
  fundamentalsConfidence?: number
  engineeringDepthScore?: number
  engineeringDepthConfidence?: number
  productionReadinessScore?: number
  productionReadinessConfidence?: number
  testingMaturityScore?: number
  testingMaturityConfidence?: number
  architectureScore?: number
  architectureConfidence?: number
  infraDevOpsScore?: number
  infraDevOpsConfidence?: number
}

function DimensionalAnalysisCard({ dimensional }: { dimensional: DimensionalData }) {
  if (!dimensional) return null
  
  const dimensions = [
    { key: 'fundamentals', label: 'Fundamentals', score: dimensional.fundamentalsScore, confidence: dimensional.fundamentalsConfidence, icon: Code, color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-500' },
    { key: 'engineeringDepth', label: 'Engineering Depth', score: dimensional.engineeringDepthScore, confidence: dimensional.engineeringDepthConfidence, icon: Wrench, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-500' },
    { key: 'productionReadiness', label: 'Production Readiness', score: dimensional.productionReadinessScore, confidence: dimensional.productionReadinessConfidence, icon: Rocket, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500' },
    { key: 'testingMaturity', label: 'Testing Maturity', score: dimensional.testingMaturityScore, confidence: dimensional.testingMaturityConfidence, icon: TestTube, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500' },
    { key: 'architecture', label: 'Architecture', score: dimensional.architectureScore, confidence: dimensional.architectureConfidence, icon: Building2, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-500' },
    { key: 'infraDevOps', label: 'Infra & DevOps', score: dimensional.infraDevOpsScore, confidence: dimensional.infraDevOpsConfidence, icon: Server, color: 'from-cyan-500 to-teal-500', bg: 'bg-cyan-500' },
  ].filter(d => d.score != null)
  
  if (dimensions.length === 0) return null
  
  // For radar chart, only include dimensions with score > 0 (radar looks weird with all-zero)
  const radarData = dimensions.filter(d => (d.score || 0) > 0).map(d => ({
    subject: d.label.replace(' & ', '\n& '),
    A: Math.round(d.score || 0),
    fullMark: 100,
  }))
  
  return (
    <Card className="border-border/50 bg-gradient-to-br from-card via-card/90 to-primary/5 backdrop-blur overflow-hidden">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          6-Dimensional Analysis
          <Badge variant="secondary" className="ml-auto">{dimensions.length} dimensions</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          {radarData.length >= 3 && (
            <div className="flex items-center justify-center">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))' 
                      }}
                      formatter={(value: number) => [`${value}/100`, 'Score']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Dimension Bars */}
          <div className="space-y-4">
            {dimensions.map(dim => {
              const score = Math.round(dim.score || 0)
              const confidence = dim.confidence != null ? Math.round(dim.confidence * 100) : null
              const Icon = dim.icon
              return (
                <div key={dim.key} className="group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br", dim.color)}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium flex-1">{dim.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-bold", 
                        score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'
                      )}>{score}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted/40 overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", dim.color)}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  {confidence != null && (
                    <p className="text-[10px] text-muted-foreground mt-1 text-right">
                      Confidence: {confidence}%
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// EXPERIENCE ANALYSIS CARD
// ============================================
interface ExperienceData {
  level?: string
  yearRange?: string
  confidence?: number
}

function ExperienceAnalysisCard({ experience }: { experience: ExperienceData }) {
  if (!experience) return null
  // Render if we have level OR yearRange OR confidence
  if (!experience.level && !experience.yearRange && experience.confidence == null) return null
  
  const levelLabels: Record<string, { label: string; color: string; icon: typeof GraduationCap }> = {
    'INTERN': { label: '🎓 Intern / Learning', color: 'bg-slate-500/15 text-slate-400 border-slate-500/30', icon: BookOpen },
    'JUNIOR': { label: '🌱 Junior Developer', color: 'bg-green-500/15 text-green-400 border-green-500/30', icon: GraduationCap },
    'MID_LEVEL': { label: '⚡ Mid-Level Developer', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: Target },
    'SENIOR': { label: '🔥 Senior Developer', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: Award },
    'STAFF': { label: '🏆 Staff Engineer', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Award },
    'PRINCIPAL': { label: '👑 Principal Engineer', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30', icon: Award },
  }
  
  // Derive a label from yearRange if level is null
  const derivedLevel = experience.level || (
    experience.yearRange?.includes('0-1') ? 'JUNIOR' :
    experience.yearRange?.includes('1-2') ? 'JUNIOR' :
    experience.yearRange?.includes('2-4') ? 'MID_LEVEL' :
    experience.yearRange?.includes('4-7') ? 'SENIOR' :
    experience.yearRange?.includes('7-10') ? 'STAFF' :
    experience.yearRange?.includes('10+') ? 'PRINCIPAL' : null
  )
  const info = derivedLevel ? (levelLabels[derivedLevel] || { label: derivedLevel, color: 'bg-muted/50 text-muted-foreground border-border', icon: Target }) : null
  const confidence = experience.confidence != null ? Math.round(experience.confidence * 100) : null
  
  return (
    <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur overflow-hidden">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-blue-400" />
          </div>
          Experience Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Level Badge */}
          <div className="flex flex-col items-center gap-3">
            {info && (
              <div className={cn("px-6 py-3 rounded-2xl border text-lg font-bold", info.color)}>
                {info.label}
              </div>
            )}
            {experience.yearRange && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{experience.yearRange} experience</span>
              </div>
            )}
          </div>
          
          {/* Confidence */}
          {confidence != null && (
            <div className="flex-1 flex flex-col items-center">
              <CircularScore value={confidence} size={90} label="Confidence" />
              <p className="text-xs text-muted-foreground mt-2">Assessment confidence</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// TRUST ANALYSIS CARD
// ============================================
interface TrustData {
  level?: string
  score?: number
  effortClass?: string
  authenticityScore?: number
  authenticityFlags?: string[]
  hasOriginalWork?: boolean
}

function TrustAnalysisCard({ trust }: { trust: TrustData }) {
  if (!trust) return null
  // Render if we have any meaningful data
  if (!trust.level && trust.score == null && !trust.effortClass && trust.authenticityScore == null) return null
  
  const trustLevelColors: Record<string, string> = {
    'HIGH': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'MEDIUM': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'LOW': 'bg-red-500/15 text-red-400 border-red-500/30',
    'SUSPICIOUS': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  }
  
  const effortLabels: Record<string, { label: string; color: string }> = {
    'SIGNIFICANT': { label: '💪 Significant Effort', color: 'text-emerald-400' },
    'MODERATE': { label: '👍 Moderate Effort', color: 'text-blue-400' },
    'MINIMAL': { label: '⚡ Minimal Effort', color: 'text-amber-400' },
    'SUSPICIOUS': { label: '⚠️ Suspicious', color: 'text-red-400' },
  }
  
  // Derive trust level from score if null
  const derivedLevel = trust.level || (
    trust.score != null ? (
      trust.score >= 80 ? 'HIGH' :
      trust.score >= 50 ? 'MEDIUM' :
      trust.score >= 30 ? 'LOW' : 'SUSPICIOUS'
    ) : null
  )
  const trustColor = trustLevelColors[derivedLevel || ''] || 'bg-muted/50 text-muted-foreground border-border'
  const effortInfo = effortLabels[trust.effortClass || ''] || null
  
  return (
    <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 backdrop-blur overflow-hidden">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          Trust & Authenticity Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Trust Level */}
          {derivedLevel && (
            <div className={cn("p-4 rounded-xl border text-center", trustColor)}>
              <ShieldCheck className="h-6 w-6 mx-auto mb-2" />
              <p className="text-xs opacity-70 mb-1">Trust Level</p>
              <p className="text-lg font-bold">{derivedLevel}</p>
            </div>
          )}
          
          {/* Trust Score */}
          {trust.score != null && (
            <div className="p-4 rounded-xl bg-muted/20 border border-border/30 flex flex-col items-center justify-center">
              <CircularScore value={trust.score} size={70} />
              <p className="text-xs text-muted-foreground mt-2">Trust Score</p>
            </div>
          )}
          
          {/* Effort Class */}
          {effortInfo && (
            <div className="p-4 rounded-xl bg-muted/20 border border-border/30 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground mb-1">Effort Class</p>
              <p className={cn("text-sm font-bold", effortInfo.color)}>{effortInfo.label}</p>
            </div>
          )}
          
          {/* Authenticity Score */}
          {trust.authenticityScore != null && (
            <div className="p-4 rounded-xl bg-muted/20 border border-border/30 flex flex-col items-center justify-center">
              <CircularScore value={trust.authenticityScore} size={70} />
              <p className="text-xs text-muted-foreground mt-2">Authenticity</p>
            </div>
          )}
        </div>
        
        {/* Original Work Badge */}
        {trust.hasOriginalWork != null && (
          <div className={cn("flex items-center gap-2 p-3 rounded-xl border mb-4",
            trust.hasOriginalWork 
              ? 'bg-emerald-500/10 border-emerald-500/20' 
              : 'bg-amber-500/10 border-amber-500/20'
          )}>
            {trust.hasOriginalWork 
              ? <><CheckCircle2 className="h-4 w-4 text-emerald-400" /><span className="text-sm text-emerald-400 font-medium">Original work detected</span></>
              : <><AlertTriangle className="h-4 w-4 text-amber-400" /><span className="text-sm text-amber-400 font-medium">Original work could not be verified</span></>
            }
          </div>
        )}
        
        {/* Authenticity Flags */}
        {trust.authenticityFlags && trust.authenticityFlags.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5" />
              Authenticity Flags ({trust.authenticityFlags.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {trust.authenticityFlags.map((flag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {flag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// VERDICT CARD
// ============================================
interface VerdictData {
  summary?: string
  strengths?: string[]
  growthAreas?: string[]
  justification?: string
}

function VerdictCard({ verdict }: { verdict: VerdictData }) {
  if (!verdict || !verdict.summary) return null
  
  return (
    <Card className="border-border/50 bg-gradient-to-br from-amber-500/5 to-orange-500/5 backdrop-blur overflow-hidden">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
            <Brain className="h-5 w-5 text-amber-400" />
          </div>
          Analysis Verdict
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* Summary */}
        <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
          <p className="text-sm leading-relaxed">{verdict.summary}</p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Strengths */}
          {verdict.strengths && verdict.strengths.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Strengths ({verdict.strengths.length})
              </p>
              <div className="space-y-2">
                {verdict.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Growth Areas */}
          {verdict.growthAreas && verdict.growthAreas.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Growth Areas ({verdict.growthAreas.length})
              </p>
              <div className="space-y-2">
                {verdict.growthAreas.map((g, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <Target className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{g}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Justification */}
        {verdict.justification && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Hiring Recommendation
            </p>
            <p className="text-sm font-medium">{verdict.justification}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// SCORES BREAKDOWN CARD
// ============================================
interface ScoresData {
  structure?: number
  codeQuality?: number
  testing?: number
  documentation?: number
  techStack?: number
  complexity?: number
  industryBonus?: number
  projectTypeBonus?: number
}

function ScoresBreakdownCard({ scores }: { scores: ScoresData }) {
  if (!scores) return null
  
  const scoreItems = [
    { label: 'Structure', value: scores.structure, icon: FolderTree, color: 'from-blue-500 to-indigo-500' },
    { label: 'Code Quality', value: scores.codeQuality, icon: FileCheck, color: 'from-emerald-500 to-green-500' },
    { label: 'Testing', value: scores.testing, icon: TestTube, color: 'from-amber-500 to-orange-500' },
    { label: 'Documentation', value: scores.documentation, icon: BookOpen, color: 'from-purple-500 to-violet-500' },
    { label: 'Tech Stack', value: scores.techStack, icon: Cpu, color: 'from-cyan-500 to-teal-500' },
    { label: 'Complexity', value: scores.complexity, icon: Gauge, color: 'from-rose-500 to-pink-500' },
    { label: 'Industry Bonus', value: scores.industryBonus, icon: Award, color: 'from-yellow-500 to-amber-500' },
    { label: 'Project Type Bonus', value: scores.projectTypeBonus, icon: Sparkles, color: 'from-fuchsia-500 to-pink-500' },
  ].filter(s => s.value != null)
  
  if (scoreItems.length === 0) return null
  
  const barData = scoreItems.map(s => ({
    name: s.label,
    score: Math.round(s.value || 0),
  }))
  
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
          </div>
          Score Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {scoreItems.map(item => {
            const score = Math.round(item.value || 0)
            const Icon = item.icon
            return (
              <div key={item.label}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm flex-1">{item.label}</span>
                  <span className={cn("text-sm font-bold",
                    score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'
                  )}>{score}</span>
                </div>
                <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", item.color)}
                    style={{ width: `${Math.min(score, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Bar Chart for visual comparison */}
        {barData.length >= 3 && (
          <div className="mt-6 pt-6 border-t border-border/30">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  width={110}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))' 
                  }}
                  formatter={(value: number) => [`${value}/100`, 'Score']}
                />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// CONFIDENCE REPORT CARD
// ============================================
interface ConfidenceReportData {
  analysisConfidence?: number
  qualityMetrics?: {
    organizationScore?: number
    modularityScore?: number
    testCoverageProxy?: number
    testMaturity?: string
    documentationScore?: number
    complexityScore?: number
    complexityLevel?: string
    productionReadiness?: number
    overallQuality?: number
    qualityTier?: string
  }
  evolutionSignals?: {
    authorshipLevel?: string
    authorshipFactor?: number
    developmentPattern?: string
    iterationCount?: number
    refactorRatio?: number
    projectAge?: string
    maturityFactor?: number
    commitConsistency?: number
  }
  ensembleVerdict?: {
    astScore?: number
    graphScore?: number
    infraScore?: number
    intelligenceScore?: number
    qualityScore?: number
    gitScore?: number
    finalScore?: number
    confidence?: number
    scoreLabel?: string
    totalSkills?: number
    highConfSkills?: number
    resumeReadySkills?: number
    topFactors?: string[]
    riskFactors?: string[]
  }
  skillConfidences?: Array<{
    skillName?: string
    category?: string
    prior?: number
    posterior?: number
    astEvidence?: number
    infraEvidence?: number
    graphEvidence?: number
    lowerBound?: number
    upperBound?: number
    finalConfidence?: number
    resumeReady?: boolean
    usageVerified?: boolean
  }>
}

function ConfidenceReportCard({ report }: { report: ConfidenceReportData }) {
  if (!report) return null
  
  const ensemble = report.ensembleVerdict
  const quality = report.qualityMetrics
  const evolution = report.evolutionSignals
  const skills = report.skillConfidences || []
  
  // Don't render if completely empty
  if (!ensemble && !quality && !evolution && skills.length === 0) return null
  
  const gradeLabelMap: Record<string, string> = {
    'Expert': 'A+',
    'Advanced': 'A',
    'Proficient': 'B+',
    'Intermediate': 'B',
    'Basic': 'C',
    'Novice': 'D',
  }
  
  const gradeLabel = ensemble?.scoreLabel ? (gradeLabelMap[ensemble.scoreLabel] || ensemble.scoreLabel) : null
  
  const gradeColors: Record<string, string> = {
    'A+': 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    'A': 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    'B+': 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    'B': 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    'C+': 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    'C': 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    'D': 'text-red-400 bg-red-500/15 border-red-500/30',
    'F': 'text-red-400 bg-red-500/15 border-red-500/30',
  }
  
  return (
    <Card className="border-border/50 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 backdrop-blur overflow-hidden">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center">
            <Eye className="h-5 w-5 text-violet-400" />
          </div>
          Confidence Report
          {gradeLabel && (
            <Badge className={cn("ml-auto text-lg px-3 py-1", gradeColors[gradeLabel] || 'bg-muted/50')}>
              Grade: {gradeLabel}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Ensemble Verdict Scores */}
        {ensemble && (
          <div>
            <p className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-400" />
              Ensemble Analysis Scores
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'AST Score', value: ensemble.astScore, color: 'from-blue-500 to-indigo-500' },
                { label: 'Graph Score', value: ensemble.graphScore, color: 'from-purple-500 to-violet-500' },
                { label: 'Infra Score', value: ensemble.infraScore, color: 'from-emerald-500 to-teal-500' },
                { label: 'Quality Score', value: ensemble.qualityScore, color: 'from-amber-500 to-orange-500' },
                { label: 'Intelligence', value: ensemble.intelligenceScore, color: 'from-rose-500 to-pink-500' },
                { label: 'Git Score', value: ensemble.gitScore, color: 'from-cyan-500 to-blue-500' },
              ].filter(s => s.value != null).map(scoreItem => (
                <div key={scoreItem.label} className="p-3 rounded-xl bg-muted/20 border border-border/30 text-center">
                  <p className="text-2xl font-bold">{Math.round(scoreItem.value || 0)}</p>
                  <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden mt-2 mb-1">
                    <div className={cn("h-full rounded-full bg-gradient-to-r", scoreItem.color)} style={{ width: `${Math.min(scoreItem.value || 0, 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{scoreItem.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-muted-foreground">Final Score: </span>
                  <span className="font-bold text-xl text-primary">{Math.round(ensemble.finalScore || 0)}</span>
                </div>
                {ensemble.confidence != null && (
                  <div>
                    <span className="text-muted-foreground">Confidence: </span>
                    <span className="font-bold text-foreground">{Math.round(ensemble.confidence * 100)}%</span>
                  </div>
                )}
              </div>
              {(ensemble.totalSkills || ensemble.highConfSkills || ensemble.resumeReadySkills) && (
                <div className="flex items-center gap-4 text-xs">
                  {ensemble.totalSkills != null && (
                    <span className="text-muted-foreground">Skills: <span className="text-foreground font-medium">{ensemble.totalSkills}</span></span>
                  )}
                  {ensemble.highConfSkills != null && (
                    <span className="text-muted-foreground">High Conf: <span className="text-emerald-400 font-medium">{ensemble.highConfSkills}</span></span>
                  )}
                  {ensemble.resumeReadySkills != null && (
                    <span className="text-muted-foreground">Resume Ready: <span className="text-blue-400 font-medium">{ensemble.resumeReadySkills}</span></span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Quality & Evolution Metrics */}
        {(quality || evolution) && (
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Quality Metrics */}
            {quality && (
              <div className="p-4 rounded-xl bg-muted/10 border border-border/30">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Quality Metrics
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'Organization', value: quality.organizationScore },
                    { label: 'Modularity', value: quality.modularityScore },
                    { label: 'Test Coverage', value: quality.testCoverageProxy },
                    { label: 'Documentation', value: quality.documentationScore },
                    { label: 'Production Ready', value: quality.productionReadiness },
                  ].filter(q => q.value != null).map(q => (
                    <div key={q.label} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex-1">{q.label}</span>
                      <div className="w-20 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full",
                            (q.value || 0) >= 70 ? 'bg-emerald-500' :
                            (q.value || 0) >= 40 ? 'bg-amber-500' : 'bg-red-500'
                          )}
                          style={{ width: `${Math.min(q.value || 0, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono w-8 text-right">{Math.round(q.value || 0)}</span>
                    </div>
                  ))}
                  {quality.testMaturity && (
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/20 mt-2">
                      <span className="text-muted-foreground">Test Maturity</span>
                      <Badge variant="secondary" className="text-xs">{quality.testMaturity}</Badge>
                    </div>
                  )}
                  {quality.qualityTier && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Quality Tier</span>
                      <Badge variant="secondary" className="text-xs capitalize">{quality.qualityTier}</Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Evolution Signals */}
            {evolution && (
              <div className="p-4 rounded-xl bg-muted/10 border border-border/30">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Evolution Signals
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'Authorship Factor', value: evolution.authorshipFactor },
                    { label: 'Maturity Factor', value: evolution.maturityFactor },
                    { label: 'Refactor Ratio', value: evolution.refactorRatio },
                    { label: 'Commit Consistency', value: evolution.commitConsistency },
                  ].filter(e => e.value != null).map(e => (
                    <div key={e.label} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex-1">{e.label}</span>
                      <div className="w-20 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full",
                            (e.value || 0) >= 0.7 ? 'bg-emerald-500' :
                            (e.value || 0) >= 0.4 ? 'bg-amber-500' : 'bg-red-500'
                          )}
                          style={{ width: `${Math.min((e.value || 0) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono w-8 text-right">{((e.value || 0) * 100).toFixed(0)}</span>
                    </div>
                  ))}
                  {evolution.authorshipLevel && (
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/20 mt-2">
                      <span className="text-muted-foreground">Authorship</span>
                      <Badge variant="secondary" className="text-xs">{evolution.authorshipLevel}</Badge>
                    </div>
                  )}
                  {evolution.developmentPattern && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Dev Pattern</span>
                      <Badge variant="secondary" className="text-xs capitalize">{evolution.developmentPattern}</Badge>
                    </div>
                  )}
                  {evolution.projectAge && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Project Age</span>
                      <Badge variant="secondary" className="text-xs capitalize">{evolution.projectAge}</Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Skill Confidences */}
        {skills.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Bayesian Skill Confidences ({skills.length})
            </p>
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {skills
                .sort((a, b) => (b.posterior || b.finalConfidence || 0) - (a.posterior || a.finalConfidence || 0))
                .map((sc, i) => {
                  const conf = Math.round(((sc.posterior || sc.finalConfidence) || 0) * 100)
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm flex-1 truncate min-w-[100px]">{sc.skillName || 'Unknown'}</span>
                      {sc.resumeReady && (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] h-5 px-1.5">
                          ✓ Resume
                        </Badge>
                      )}
                      <div className="w-28 h-2 rounded-full bg-muted/40 overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full bg-gradient-to-r",
                            conf >= 70 ? 'from-emerald-500 to-green-500' :
                            conf >= 40 ? 'from-amber-500 to-yellow-500' :
                            'from-red-500 to-rose-500'
                          )}
                          style={{ width: `${conf}%` }}
                        />
                      </div>
                      <span className={cn("text-xs font-mono w-10 text-right",
                        conf >= 70 ? 'text-emerald-400' : conf >= 40 ? 'text-amber-400' : 'text-red-400'
                      )}>{conf}%</span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// TECH DEPENDENCY GRAPH CARD
// ============================================
interface TechDependencyGraphData {
  detectedStacks?: Array<{
    name?: string
    confidence?: number
    technologies?: string[]
  }>
  inferredSkills?: Array<{
    name?: string
    reason?: string
    confidence?: number
  }>
  clusters?: Array<{
    name?: string
    technologies?: string[]
    role?: string
  }>
  totalNodes?: number
  totalEdges?: number
}

function TechDependencyGraphCard({ graph }: { graph: TechDependencyGraphData }) {
  if (!graph) return null
  
  const stacks = graph.detectedStacks || []
  const inferred = graph.inferredSkills || []
  const clusters = graph.clusters || []
  
  if (stacks.length === 0 && inferred.length === 0 && clusters.length === 0) return null
  
  const clusterColors = [
    { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
    { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  ]
  
  return (
    <Card className="border-border/50 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 backdrop-blur overflow-hidden">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Network className="h-5 w-5 text-cyan-400" />
          </div>
          Tech Dependency Graph
          {graph.totalNodes != null && (
            <span className="ml-auto text-xs text-muted-foreground font-normal">
              {graph.totalNodes} nodes • {graph.totalEdges || 0} edges
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Detected Stacks */}
        {stacks.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Detected Stacks ({stacks.length})
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {stacks.map((stack, i) => {
                const colors = clusterColors[i % clusterColors.length]
                const conf = stack.confidence != null ? Math.round(stack.confidence * 100) : null
                return (
                  <div key={i} className={cn("p-4 rounded-xl border", colors.bg, colors.border)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn("font-bold text-sm", colors.text)}>{stack.name || 'Unknown Stack'}</span>
                      {conf != null && (
                        <span className="text-xs text-muted-foreground">{conf}%</span>
                      )}
                    </div>
                    {stack.technologies && stack.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {stack.technologies.map((tech, j) => (
                          <Badge key={j} variant="outline" className={cn("text-[10px] h-5 px-1.5", colors.badge)}>
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Technology Clusters */}
        {clusters.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Box className="w-4 h-4 text-purple-400" />
              Technology Clusters ({clusters.length})
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {clusters.map((cluster, i) => {
                const colors = clusterColors[i % clusterColors.length]
                return (
                  <div key={i} className={cn("p-3 rounded-xl border", colors.bg, colors.border)}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn("font-semibold text-sm", colors.text)}>{cluster.name || `Cluster ${i + 1}`}</span>
                      {cluster.role && (
                        <Badge variant="secondary" className="text-[10px] h-5">{cluster.role}</Badge>
                      )}
                    </div>
                    {cluster.technologies && cluster.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {cluster.technologies.map((tech, j) => (
                          <Badge key={j} variant="outline" className="text-[10px] h-5 px-1.5">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Inferred Skills */}
        {inferred.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Inferred Skills ({inferred.length})
            </p>
            <div className="space-y-2">
              {inferred.map((skill, i) => {
                const conf = skill.confidence != null ? Math.round(skill.confidence * 100) : null
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 border border-border/20">
                    <span className="text-sm font-medium flex-1">{skill.name || 'Unknown'}</span>
                    {skill.reason && (
                      <span className="text-[10px] text-muted-foreground max-w-[200px] truncate" title={skill.reason}>
                        {skill.reason}
                      </span>
                    )}
                    {conf != null && (
                      <>
                        <div className="w-16 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full",
                              conf >= 70 ? 'bg-emerald-500' : conf >= 40 ? 'bg-amber-500' : 'bg-red-500'
                            )}
                            style={{ width: `${conf}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{conf}%</span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// ENHANCED INFRASTRUCTURE SIGNALS CARD
// ============================================
function EnhancedInfraSignalsCard({ infraSignals }: { infraSignals: any }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  
  if (!infraSignals) return null
  
  const signals = infraSignals.signals || []
  const details = infraSignals.signalDetails || {}
  const hasDetails = Object.keys(details).length > 0
  
  if (signals.length === 0 && !hasDetails) return null
  
  // Merge signals list and details to create full picture
  const allSignals = signals.map((signal: string) => {
    const detail = details[signal]
    const tech = signalToTechMapping[signal]
    return {
      key: signal,
      name: tech?.name || signal.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      category: tech?.category || 'other',
      confidence: detail?.confidence != null ? Math.round(detail.confidence * 100) : null,
      evidence: detail?.evidence || [],
    }
  })
  
  // Also add details that aren't in signals list
  Object.keys(details).forEach(key => {
    if (!signals.includes(key)) {
      const detail = details[key]
      const tech = signalToTechMapping[key]
      allSignals.push({
        key,
        name: tech?.name || key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        category: tech?.category || 'other',
        confidence: detail?.confidence != null ? Math.round(detail.confidence * 100) : null,
        evidence: detail?.evidence || [],
      })
    }
  })
  
  // Sort by confidence desc
  allSignals.sort((a: any, b: any) => (b.confidence || 0) - (a.confidence || 0))
  
  const categoryIcons: Record<string, string> = {
    infrastructure: '🏗️',
    database: '🗄️',
    messaging: '📨',
    realtime: '⚡',
    api: '🔌',
    observability: '👁️',
    cloud: '☁️',
    testing: '🧪',
    ml: '🤖',
    pattern: '🔧',
    devops: '🚀',
    security: '🔒',
    other: '📦',
  }
  
  return (
    <Card className="border-border/50 bg-gradient-to-br from-orange-500/5 to-amber-500/5 backdrop-blur overflow-hidden">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center">
            <Server className="h-5 w-5 text-orange-400" />
          </div>
          Infrastructure Signals
          <Badge variant="secondary" className="ml-auto">{allSignals.length} signals</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-2">
          {allSignals.map((signal: any) => (
            <div key={signal.key} className="rounded-xl border border-border/30 overflow-hidden">
              <button
                onClick={() => signal.evidence.length > 0 ? setExpanded(expanded === signal.key ? null : signal.key) : null}
                className={cn(
                  "w-full flex items-center gap-3 p-3 text-left transition-colors",
                  signal.evidence.length > 0 ? 'hover:bg-muted/20 cursor-pointer' : 'cursor-default',
                  expanded === signal.key && 'bg-muted/10'
                )}
              >
                <span className="text-base">{categoryIcons[signal.category] || '📦'}</span>
                <span className="text-sm font-medium flex-1">{signal.name}</span>
                {signal.confidence != null && (
                  <>
                    <div className="w-20 h-2 rounded-full bg-muted/40 overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full",
                          signal.confidence >= 80 ? 'bg-emerald-500' :
                          signal.confidence >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${signal.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{signal.confidence}%</span>
                  </>
                )}
                {signal.evidence.length > 0 && (
                  expanded === signal.key 
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {expanded === signal.key && signal.evidence.length > 0 && (
                <div className="px-4 pb-3 pt-1 border-t border-border/20">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Evidence</p>
                  <div className="space-y-1">
                    {signal.evidence.map((ev: string, j: number) => (
                      <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span className="font-mono break-all">{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// FOLDER STRUCTURE PATTERNS CARD
// ============================================
function FolderStructurePatternsCard({ folderStructure }: { folderStructure: any }) {
  if (!folderStructure) return null
  
  const orgScore = folderStructure.organizationScore
  const maxDepth = folderStructure.maxDepth
  const topLevelFolders = folderStructure.topLevelFolders || []
  
  // Gather all boolean pattern flags
  const patterns = [
    { key: 'hasSrcFolder', label: 'src/ folder', icon: '📁' },
    { key: 'hasLibFolder', label: 'lib/ folder', icon: '📚' },
    { key: 'hasComponents', label: 'Components', icon: '🧩' },
    { key: 'hasPages', label: 'Pages/Routes', icon: '📄' },
    { key: 'hasUtils', label: 'Utilities', icon: '🔧' },
    { key: 'hasHooks', label: 'Hooks', icon: '🪝' },
    { key: 'hasServices', label: 'Services', icon: '⚙️' },
    { key: 'hasModels', label: 'Models', icon: '🗂️' },
    { key: 'hasControllers', label: 'Controllers', icon: '🎮' },
    { key: 'hasMiddleware', label: 'Middleware', icon: '🔀' },
    { key: 'hasTests', label: 'Tests', icon: '🧪' },
    { key: 'hasConfig', label: 'Config', icon: '⚙️' },
    { key: 'hasTypes', label: 'Types', icon: '🔷' },
    { key: 'hasStyles', label: 'Styles', icon: '🎨' },
    { key: 'hasAssets', label: 'Assets', icon: '🖼️' },
    { key: 'hasApi', label: 'API', icon: '🔌' },
    { key: 'hasStore', label: 'Store/State', icon: '💾' },
    { key: 'hasContext', label: 'Context', icon: '🔗' },
    { key: 'hasHelpers', label: 'Helpers', icon: '🛠️' },
    { key: 'hasPrisma', label: 'Prisma', icon: '💎' },
    { key: 'hasDocker', label: 'Docker', icon: '🐳' },
    { key: 'hasDocs', label: 'Documentation', icon: '📖' },
    { key: 'hasScripts', label: 'Scripts', icon: '📜' },
    { key: 'hasPublic', label: 'Public', icon: '🌐' },
  ].filter(p => folderStructure[p.key] != null)
  
  const detectedPatterns = patterns.filter(p => folderStructure[p.key])
  const missingPatterns = patterns.filter(p => !folderStructure[p.key])
  
  if (patterns.length === 0 && !orgScore && topLevelFolders.length === 0) return null
  
  return (
    <Card className="border-border/50 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 backdrop-blur overflow-hidden">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center">
            <FolderTree className="h-5 w-5 text-teal-400" />
          </div>
          Folder Structure & Organization
          {orgScore != null && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Organization</span>
              <Badge className={cn(
                orgScore >= 70 ? 'bg-emerald-500/20 text-emerald-400' :
                orgScore >= 40 ? 'bg-amber-500/20 text-amber-400' :
                'bg-red-500/20 text-red-400'
              )}>
                {Math.round(orgScore)}/100
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* Organization Score Bar */}
        {orgScore != null && (
          <div>
            <div className="h-3 rounded-full bg-muted/40 overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-700",
                  orgScore >= 70 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                  orgScore >= 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                  'bg-gradient-to-r from-red-500 to-rose-500'
                )}
                style={{ width: `${Math.min(orgScore, 100)}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Top Level Folders */}
        {topLevelFolders.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5" />
              Top-Level Folders ({topLevelFolders.length})
              {maxDepth && <span className="ml-auto">Max Depth: {maxDepth}</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {topLevelFolders.map((folder: string, i: number) => (
                <Badge key={i} variant="outline" className="bg-muted/50 font-mono text-xs">
                  📁 {folder}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Detected Patterns */}
        {detectedPatterns.length > 0 && (
          <div>
            <p className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Detected Patterns ({detectedPatterns.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {detectedPatterns.map(p => (
                <div key={p.key} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-sm">
                  <span>{p.icon}</span>
                  <span className="flex-1 truncate">{p.label}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Missing Patterns */}
        {missingPatterns.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground/60" />
              Not Detected ({missingPatterns.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {missingPatterns.map(p => (
                <div key={p.key} className="flex items-center gap-2 p-2 rounded-lg bg-muted/10 border border-border/20 text-sm text-muted-foreground/60">
                  <span className="opacity-50">{p.icon}</span>
                  <span className="flex-1 truncate">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const [showAllSkills, setShowAllSkills] = useState(false)

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await get<{ project: any }>(`/v1/projects/${id}`)
      const raw = response.project
      
      // Map backend fields to frontend expected fields
      // Handle the nested fullAnalysis structure
      const fullAnalysis = raw.fullAnalysis || {}
      const topLevelIndustry = raw.industryAnalysis || {}
      
      // Get verified skills from fullAnalysis (this is where they actually are!)
      const verifiedSkills = fullAnalysis.verifiedSkills || topLevelIndustry.verifiedSkills || []
      
      // Group skills by category for better organization
      const skillsByCategory: Record<string, any[]> = {}
      verifiedSkills.forEach((skill: any) => {
        const category = (skill.category || 'OTHER').toUpperCase()
        if (!skillsByCategory[category]) {
          skillsByCategory[category] = []
        }
        skillsByCategory[category].push(skill)
      })
      
      // Merge industry analysis with actual verified skills data
      const mergedIndustryAnalysis = {
        verifiedSkills: verifiedSkills,
        skillsByCategory: skillsByCategory,
        totalSkills: verifiedSkills.length,
        highConfidenceSkills: verifiedSkills.filter((s: any) => s.confidence >= 0.8).length,
        resumeReadySkills: verifiedSkills.filter((s: any) => s.resumeReady).length,
        overallScore: raw.overallScore || raw.auraContribution || 0,
        engineeringLevel: fullAnalysis.architecture?.engineeringLevel || topLevelIndustry.engineeringLevel || 'Unknown',
        technologies: topLevelIndustry.technologies || [],
        infraSignals: fullAnalysis.infraSignals || topLevelIndustry.infraSignals || {},
        architecture: fullAnalysis.architecture || topLevelIndustry.architecture || null,
      }
      
      return {
        ...raw,
        repoUrl: raw.githubRepoUrl || raw.repoUrl,
        analysisStatus: (raw.analysisStatus || '').toLowerCase(),
        stars: raw.stars || 0,
        forks: raw.forks || 0,
        commits: raw.commits || 0,
        contributors: raw.contributors || 0,
        languages: raw.languages || {},
        auraContribution: raw.auraContribution || raw.overallScore || 0,
        fullAnalysis: fullAnalysis,
        industryAnalysis: mergedIndustryAnalysis,
        metrics: raw.metrics || null,
      }
    },
    enabled: !!id,
  })

function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen pb-12 animate-in fade-in duration-500">
      {/* Hero Skeleton */}
      <div className="relative border-b border-border/40 bg-card/30 backdrop-blur-xl mb-8">
        <div className="container max-w-7xl mx-auto px-4 py-8 md:py-10">
          <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
            <div className="flex items-start gap-5">
              <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shrink-0" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-64 md:w-96" />
                <Skeleton className="h-4 w-full md:w-[600px]" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10 md:w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-xl border border-border/50 bg-card/40 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-12 h-5 rounded-full" />
              </div>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Tech Stack Skeleton */}
            <div className="bg-card/40 border border-border/50 rounded-xl p-6 space-y-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-9 w-24 rounded-full" />
                ))}
              </div>
            </div>

            {/* Analysis Skeleton */}
            <div className="bg-card/40 border border-border/50 rounded-xl p-6 space-y-6">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
             {/* Radar Chart Skeleton */}
             <div className="bg-card/40 border border-border/50 rounded-xl p-6 flex flex-col items-center justify-center h-[400px]">
                <Skeleton className="w-64 h-64 rounded-full rounded-full" />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

  if (isLoading) {
    return <ProjectDetailSkeleton />
  }

  if (error || !project) {
    return (
      <div className="text-center py-24">
        <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <Github className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Project not found</h2>
        <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or failed to load.</p>
        <Button asChild>
          <Link href="/projects">Back to Projects</Link>
        </Button>
      </div>
    )
  }

  // Extract data from fullAnalysis
  const fullAnalysis = project.fullAnalysis || {}
  const industryAnalysis = project.industryAnalysis || {}
  
  // Get verified skills from industry analysis (fullAnalysis has the complete data)
  const verifiedSkills = industryAnalysis.verifiedSkills || []
  const skillsByCategory = industryAnalysis.skillsByCategory || {}
  const overallScore = industryAnalysis.overallScore || project.auraContribution || 0
  
  
  // Metrics for radar chart
  const metrics = project.metrics
  const metricsData = metrics
    ? [
        { metric: 'Code Quality', value: metrics.codeQuality || 0 },
        { metric: 'Documentation', value: metrics.documentation || 0 },
        { metric: 'Test Coverage', value: metrics.testCoverage || 0 },
        { metric: 'Maintainability', value: metrics.maintainability || 0 },
        { metric: 'Activity', value: metrics.activityScore || 0 },
      ]
    : []

  const languagesData = Object.entries(project.languages || {}).map(
    ([name, bytes]) => ({
      name,
      value: bytes as number,
      color: getLanguageColor(name),
    })
  )

  // Count skills by category
  const categorySkillCounts = Object.entries(skillsByCategory).map(([category, skills]) => ({
    category,
    count: Array.isArray(skills) ? skills.length : 0,
  })).filter(c => c.count > 0)

  return (
    <div className="space-y-5 pb-10">
      {/* ===== HERO HEADER ===== */}
      <div className="rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card/80 to-card/60 backdrop-blur-xl p-6 md:p-8">
        <div className="flex items-start gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/projects">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {/* GitHub Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 border border-border/50 flex items-center justify-center">
                <Github className="w-6 h-6" />
              </div>
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {project.repoName || project.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  {project.language && (
                    <Badge variant="secondary" className="gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {project.language}
                    </Badge>
                  )}
                  <Badge
                    variant={project.analysisStatus === 'completed' ? 'default' : 'secondary'}
                    className={project.analysisStatus === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''}
                  >
                    {project.analysisStatus === 'completed' ? '✓ Analyzed' : project.analysisStatus}
                  </Badge>
                </div>
              </div>
            </div>
            
            {project.description && (
              <p className="text-muted-foreground mt-3 max-w-2xl">{project.description}</p>
            )}
          </div>
          
          <Button variant="outline" asChild className="shrink-0">
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on GitHub
            </a>
          </Button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 p-4">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Star className="h-4 w-4" />
              <span className="text-xs font-medium">Stars</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(project.stars)}</p>
          </div>
          
          <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 p-4">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <GitFork className="h-4 w-4" />
              <span className="text-xs font-medium">Forks</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(project.forks)}</p>
          </div>
          
          <div className="rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 p-4">
            <div className="flex items-center gap-2 text-green-500 mb-1">
              <GitCommit className="h-4 w-4" />
              <span className="text-xs font-medium">Commits</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(project.commits)}</p>
          </div>
          
          <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-4">
            <div className="flex items-center gap-2 text-purple-500 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Contributors</span>
            </div>
            <p className="text-2xl font-bold">{project.contributors}</p>
          </div>
          
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-medium">Aura Points</span>
            </div>
            <p className="text-2xl font-bold text-primary">+{formatNumber(project.auraContribution)}</p>
          </div>
        </div>
      </div>

      {/* ===== V2 PROJECT SUMMARY CARD ===== */}
      <ProjectSummaryCard 
        overallScore={Math.round(overallScore)}
        engineeringLevel={industryAnalysis.engineeringLevel || 'INTERMEDIATE'}
        architectureStyle={industryAnalysis.architecture?.type?.toUpperCase() || 'UNKNOWN'}
        hireSignal={
          overallScore >= 90 ? 'STRONG_HIRE' :
          overallScore >= 75 ? 'HIRE' :
          overallScore >= 60 ? 'BORDERLINE' : 'NO_HIRE'
        }
        topSkills={verifiedSkills.slice(0, 5).map((s: any) => s.name)}
      />

      {/* ===== OVERALL SCORE & SUMMARY ===== */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Overall Score */}
        <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <CircularScore value={Math.round(overallScore)} size={140} label="Overall Score" />
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Industry-grade analysis score based on architecture, patterns, and best practices
            </p>
          </CardContent>
        </Card>
        
        {/* Skills Summary */}
        <Card className="border-border/50 bg-card/50 backdrop-blur md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30 text-center">
                <p className="text-3xl font-bold text-primary">{verifiedSkills.length}</p>
                <p className="text-xs text-muted-foreground">Skills Detected</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30 text-center">
                <p className="text-3xl font-bold text-emerald-400">
                  {industryAnalysis.resumeReadySkills || verifiedSkills.filter((s: SkillData) => s.resumeReady).length}
                </p>
                <p className="text-xs text-muted-foreground">Resume Ready</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30 text-center">
                <p className="text-3xl font-bold text-blue-400">
                  {industryAnalysis.highConfidenceSkills || verifiedSkills.filter((s: SkillData) => (s.confidence || 0) >= 0.8).length}
                </p>
                <p className="text-xs text-muted-foreground">High Confidence</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30 text-center">
                <p className="text-3xl font-bold text-purple-400">{categorySkillCounts.length}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </div>
            
            {/* Engineering Level */}
            {industryAnalysis.engineeringLevel && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Engineering Level</span>
                </div>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-sm">
                  {industryAnalysis.engineeringLevel}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== SKILL PROFILE CHART ===== */}
      <div className="grid md:grid-cols-2 gap-4">
        {verifiedSkills.length > 0 && (
          <SkillsDistributionChart skills={verifiedSkills} />
        )}
         {metrics && metricsData.length > 0 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-indigo-500" />
                Code Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metricsData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="hsl(var(--indigo-500))"
                    fill="hsl(var(--indigo-500))"
                    fillOpacity={0.3}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))' 
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ===== SKILLS BREAKDOWN SECTION ===== */}
      {verifiedSkills.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Verified Skills</h2>
              <p className="text-sm text-muted-foreground">
                {verifiedSkills.length} skills detected • Confidence shown as %
              </p>
            </div>
          </div>
          
          {/* Skills Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifiedSkills
              .sort((a: SkillData, b: SkillData) => {
                const aScore = a.confidence ? a.confidence * 100 : (a.score || a.verifiedScore || 0)
                const bScore = b.confidence ? b.confidence * 100 : (b.score || b.verifiedScore || 0)
                return bScore - aScore
              })
              .slice(0, showAllSkills ? undefined : 6)
              .map((skill: SkillData, index: number) => (
                <SkillCardV2 
                  key={`${skill.name}-${index}`} 
                  skill={mapToSkillNode(skill, skill.category || 'tool')} 
                />
              ))}
          </div>
          
          {verifiedSkills.length > 6 && (
            <div className="flex justify-center mt-4 pt-2 border-t border-border/30">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAllSkills(!showAllSkills)}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                {showAllSkills ? (
                  <>Show Less <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>Show All {verifiedSkills.length} Skills <ChevronDown className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ===== SKILLS BY CATEGORY ===== */}
      {Object.keys(skillsByCategory).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Skills by Category
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(skillsByCategory).map(([category, skills]) => {
              if (!Array.isArray(skills) || skills.length === 0) return null
              const Icon = categoryIcons[category] || Code
              const colorClass = categoryColors[category] || 'from-primary to-primary/70'
              
              return (
                <Card key={category} className="border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg capitalize">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br", colorClass)}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      {category}
                      <Badge variant="secondary" className="ml-auto">{skills.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {skills.slice(0, 4).map((skill: SkillData, i: number) => {
                        const percentage = skill.confidence 
                          ? Math.round(skill.confidence * 100) 
                          : skill.score || skill.verifiedScore || 0
                        
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-sm flex-1 truncate">{skill.name}</span>
                            <div className="w-24 h-2 rounded-full bg-muted/50 overflow-hidden">
                              <div 
                                className={cn("h-full rounded-full bg-gradient-to-r", colorClass)}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {percentage}%
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ===== VERDICT ===== */}
      {fullAnalysis.verdict && fullAnalysis.verdict.summary && (
        <VerdictCard verdict={fullAnalysis.verdict} />
      )}

      {/* ===== DIMENSIONAL ANALYSIS (6 Dimensions) ===== */}
      {fullAnalysis.dimensionalAnalysis && (
        <DimensionalAnalysisCard dimensional={fullAnalysis.dimensionalAnalysis} />
      )}

      {/* ===== SCORES BREAKDOWN ===== */}
      {fullAnalysis.scores && (
        <ScoresBreakdownCard scores={fullAnalysis.scores} />
      )}

      {/* ===== EXPERIENCE & TRUST ANALYSIS ===== */}
      <div className="grid md:grid-cols-2 gap-4">
        {fullAnalysis.experienceAnalysis && (
          <ExperienceAnalysisCard experience={fullAnalysis.experienceAnalysis} />
        )}
        {fullAnalysis.trustAnalysis && (
          <TrustAnalysisCard trust={fullAnalysis.trustAnalysis} />
        )}
      </div>

      {/* ===== CONFIDENCE REPORT ===== */}
      {fullAnalysis.confidenceReport && (
        <ConfidenceReportCard report={fullAnalysis.confidenceReport} />
      )}

      {/* ===== CODE QUALITY INDICATORS ===== */}
      {fullAnalysis.codeQuality && (
        <CodeQualityIndicatorsCard 
          codeQuality={fullAnalysis.codeQuality} 
          folderStructure={fullAnalysis.folderStructure}
          metrics={fullAnalysis.metrics}
        />
      )}

      {/* ===== FOLDER STRUCTURE PATTERNS ===== */}
      {fullAnalysis.folderStructure && (
        <FolderStructurePatternsCard folderStructure={fullAnalysis.folderStructure} />
      )}

      {/* ===== INTELLIGENCE VERDICT (Autonomous Engine Output) ===== */}
      {(project.intelligenceVerdict || fullAnalysis.intelligenceVerdict) && (
        <IntelligenceVerdictCard verdict={project.intelligenceVerdict || fullAnalysis.intelligenceVerdict} />
      )}

      {/* ===== V2 ARCHITECTURE & RISK ASSESSMENT ===== */}
      {(fullAnalysis.architecture || fullAnalysis.industryAnalysis?.architecture) && (
        <div className="grid md:grid-cols-2 gap-4">
          <ArchitectureCard 
            architecture={mapToArchitectureVerdict(fullAnalysis.architecture || fullAnalysis.industryAnalysis?.architecture)} 
          />
          <RiskPanel 
            riskProfile={mapToRiskProfile({
              riskSignals: (fullAnalysis.infraSignals?.signalDetails?.incomplete_project || fullAnalysis.industryAnalysis?.infraSignals?.signalDetails?.incomplete_project)
                ? ['Project flagged as incomplete - may affect assessment accuracy']
                : []
            })} 
          />
        </div>
      )}

      {/* ===== ARCHITECTURE & TECH STACK ===== */}
      {(fullAnalysis.architecture || fullAnalysis.industryAnalysis?.architecture || fullAnalysis.techStack || verifiedSkills.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {(fullAnalysis.architecture || fullAnalysis.industryAnalysis?.architecture) && (
            <LegacyArchitectureCard 
              architecture={fullAnalysis.architecture || fullAnalysis.industryAnalysis?.architecture} 
              folderStructure={fullAnalysis.folderStructure}
            />
          )}
          {(fullAnalysis.techStack || verifiedSkills.length > 0) && (
            <TechStackCard 
              techStack={fullAnalysis.techStack || {}} 
              skills={verifiedSkills} 
              infraSignals={fullAnalysis.infraSignals || fullAnalysis.industryAnalysis?.infraSignals}
            />
          )}
        </div>
      )}

      {/* ===== TECH DEPENDENCY GRAPH ===== */}
      {fullAnalysis.techDependencyGraph && (
        <TechDependencyGraphCard graph={fullAnalysis.techDependencyGraph} />
      )}

      {/* ===== ENHANCED INFRASTRUCTURE SIGNALS ===== */}
      {(fullAnalysis.infraSignals || industryAnalysis.infraSignals) && (
        <EnhancedInfraSignalsCard infraSignals={fullAnalysis.infraSignals || industryAnalysis.infraSignals} />
      )}

      {/* ===== METRICS & LANGUAGES ===== */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Languages */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {languagesData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={languagesData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                      formatter={(value: number) =>
                        `${(value / 1024).toFixed(1)} KB`
                      }
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {languagesData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Language badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {languagesData.map((lang) => (
                    <Badge
                      key={lang.name}
                      variant="outline"
                      className="flex items-center gap-1.5 px-3 py-1.5"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: lang.color }}
                      />
                      {lang.name}
                    </Badge>
                  ))}
                </div>
              </>
            ) : fullAnalysis.techStack?.languages && fullAnalysis.techStack.languages.length > 0 ? (
              // Use techStack languages if project.languages is empty
              <div className="space-y-3">
                {fullAnalysis.techStack.languages.map((lang: { name: string; percentage: number }, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm flex-1">{lang.name}</span>
                    <div className="w-32 h-2 rounded-full bg-muted/50 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {lang.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No language data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Complexity */}
        {project.complexity && (
          <ComplexityCard complexity={project.complexity} />
        )}
      </div>

      {/* ===== BEST PRACTICES & OPTIMIZATIONS ===== */}
      <div className="grid md:grid-cols-2 gap-6">
        {fullAnalysis.bestPractices && (
          <BestPracticesCard bestPractices={fullAnalysis.bestPractices} />
        )}
        {fullAnalysis.optimizations && (
          <OptimizationsCard optimizations={fullAnalysis.optimizations} />
        )}
      </div>

      {/* ===== FRAMEWORK ANALYSIS ===== */}
      {fullAnalysis.frameworkAnalysis && (
        <FrameworkAnalysisCard frameworkAnalysis={fullAnalysis.frameworkAnalysis} />
      )}

      {/* ===== ARCHITECTURE GRAPH ===== */}
      {project.architectureGraph && (
        <ArchitectureGraphView graph={project.architectureGraph} />
      )}

      {/* ===== DETAILED ANALYSIS ===== */}
      {fullAnalysis && Object.keys(fullAnalysis).length > 0 ? (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Deep Analysis</h2>
              <p className="text-sm text-muted-foreground">
                Folder structure, code quality indicators, and configuration analysis
              </p>
            </div>
          </div>
          <AnalysisResults analysis={fullAnalysis} />
        </div>
      ) : (
        <div className="p-8 border border-dashed border-border rounded-2xl text-center bg-muted/5">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Code className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-2">Deep analysis pending</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Detailed code structure, optimization tips, and framework analysis will appear here once the deep scan is complete.
          </p>
        </div>
      )}
    </div>
  )
}
