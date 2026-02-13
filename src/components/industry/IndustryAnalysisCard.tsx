import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { IndustryAnalysis, VerifiedSkill, SkillCategory } from '@/types'
import {
  Building2,
  Server,
  Database,
  MessageSquare,
  Shield,
  GitBranch,
  Activity,
  TestTube,
  Code,
  Box,
  Cloud,
  Zap,
  CheckCircle2,
  Award,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

interface IndustryAnalysisCardProps {
  analysis: IndustryAnalysis
  showDetails?: boolean
}

// Category icons and colors
const categoryConfig: Record<SkillCategory | 'tool', { icon: typeof Building2; color: string; label: string }> = {
  architecture: { icon: Building2, color: 'text-purple-400', label: 'Architecture' },
  infrastructure: { icon: Server, color: 'text-blue-400', label: 'Infrastructure' },
  database: { icon: Database, color: 'text-green-400', label: 'Database' },
  messaging: { icon: MessageSquare, color: 'text-orange-400', label: 'Messaging' },
  security: { icon: Shield, color: 'text-red-400', label: 'Security' },
  devops: { icon: GitBranch, color: 'text-cyan-400', label: 'DevOps' },
  observability: { icon: Activity, color: 'text-yellow-400', label: 'Observability' },
  testing: { icon: TestTube, color: 'text-pink-400', label: 'Testing' },
  language: { icon: Code, color: 'text-indigo-400', label: 'Language' },
  framework: { icon: Box, color: 'text-emerald-400', label: 'Framework' },
  cloud: { icon: Cloud, color: 'text-sky-400', label: 'Cloud' },
  performance: { icon: Zap, color: 'text-amber-400', label: 'Performance' },
  ml: { icon: Sparkles, color: 'text-violet-400', label: 'Machine Learning' },
  data_science: { icon: Activity, color: 'text-teal-400', label: 'Data Science' },
  tool: { icon: Code, color: 'text-gray-400', label: 'Tool' },
}

// Engineering level config
const engineeringLevelConfig: Record<string, { color: string; bgColor: string; emoji: string }> = {
  'Production-grade': { color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', emoji: '🏆' },
  'Advanced': { color: 'text-blue-400', bgColor: 'bg-blue-500/20', emoji: '⭐' },
  'Intermediate': { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', emoji: '📈' },
  'Basic': { color: 'text-gray-400', bgColor: 'bg-gray-500/20', emoji: '🌱' },
}

// Architecture type labels
const archTypeLabels: Record<string, string> = {
  monolith: 'Monolithic',
  microservices: 'Microservices',
  serverless: 'Serverless',
  event_driven: 'Event-Driven',
  modular_monolith: 'Modular Monolith',
  layered: 'Layered',
  hexagonal: 'Hexagonal',
  clean_architecture: 'Clean Architecture',
}

export function IndustryAnalysisCard({ analysis, showDetails = true }: IndustryAnalysisCardProps) {
  const levelConfig = engineeringLevelConfig[analysis.engineeringLevel] || engineeringLevelConfig['Basic']

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Industry Analysis
          </CardTitle>
          <Badge className={`${levelConfig.bgColor} ${levelConfig.color} border-0`}>
            {levelConfig.emoji} {analysis.engineeringLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Architecture Overview */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            System Architecture
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/50 rounded-lg p-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Architecture Type</p>
              <p className="font-semibold text-primary">
                {archTypeLabels[analysis.architecture.type] || analysis.architecture.type}
              </p>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Services</p>
              <p className="font-semibold">
                {analysis.architecture.serviceCount} {analysis.architecture.serviceCount === 1 ? 'service' : 'services'}
              </p>
            </div>
          </div>

          {/* Communication Types */}
          {(analysis.architecture.communication?.length || 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Communication:</span>
              {(analysis.architecture.communication || []).map((comm) => (
                <Badge key={comm} variant="outline" className="text-xs">
                  {comm.toUpperCase().replace('_', ' ')}
                </Badge>
              ))}
            </div>
          )}

          {/* Architecture Patterns */}
          {(analysis.architecture.patterns?.length || 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Patterns:</span>
              {(analysis.architecture.patterns || []).map((pattern) => (
                <Badge key={pattern} variant="secondary" className="text-xs">
                  {pattern}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Industry Score</span>
            <span className="font-semibold">{Math.round(analysis.overallScore)}/100</span>
          </div>
          <Progress value={analysis.overallScore} className="h-2" />
        </div>

        {/* Skills Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-2xl font-bold text-primary">{analysis.totalSkills}</p>
            <p className="text-xs text-muted-foreground">Total Skills</p>
          </div>
          <div className="text-center p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
            <p className="text-2xl font-bold text-emerald-400">{analysis.highConfidenceSkills}</p>
            <p className="text-xs text-muted-foreground">High Confidence</p>
          </div>
          <div className="text-center p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
            <p className="text-2xl font-bold text-blue-400">{analysis.resumeReadySkills}</p>
            <p className="text-xs text-muted-foreground">Resume Ready</p>
          </div>
        </div>

        {/* Verified Skills - Categorized View */}
        {showDetails && (
          <div className="space-y-5">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              Verified Skills ({analysis.verifiedSkills.length})
            </h4>
            
            <TooltipProvider>
              <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(analysis.skillsByCategory || {})
                  .sort((a, b) => b[1].length - a[1].length) // Sort categories by number of skills
                  .map(([category, skills]) => {
                    if (!skills || skills.length === 0) return null
                    const config = categoryConfig[category as SkillCategory] || categoryConfig.tool
                    const Icon = config.icon
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur py-1 z-10">
                          <div className={`p-1 rounded-md bg-opacity-10 bg-current`}>
                            <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {config.label}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {skills.length}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {skills
                            .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
                            .map((skill, index) => (
                              <SkillRow key={`${skill.name}-${index}`} skill={skill} />
                            ))}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </TooltipProvider>
          </div>
        )}

        {/* Skills by Category (Compact View) */}
        {!showDetails && Object.keys(analysis.skillsByCategory || {}).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(Object.entries(analysis.skillsByCategory) as [SkillCategory, VerifiedSkill[]][])
              .filter(([, skills]) => skills.length > 0)
              .map(([category, skills]) => {
                const config = categoryConfig[category]
                const Icon = config?.icon || Code
                return (
                  <Badge key={category} variant="outline" className="gap-1">
                    <Icon className={`h-3 w-3 ${config?.color}`} />
                    {skills.length}
                  </Badge>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Individual skill row component
function SkillRow({ skill }: { skill: VerifiedSkill }) {
  const config = categoryConfig[skill.category] || categoryConfig.language
  const Icon = config.icon
  const confidencePercent = Math.round((skill.confidence || 0) * 100)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 p-2 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-colors cursor-help"
        >
          <Icon className={`h-4 w-4 ${config.color} flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm truncate">{skill.name}</span>
              {skill.usageVerified && (
                 <Badge variant="outline" className="h-4 px-1 text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1">
                    <CheckCircle2 className="h-2 w-2" />
                    Verified
                 </Badge>
              )}
              {skill.resumeReady && !skill.usageVerified && (
                <CheckCircle2 className="h-3 w-3 text-emerald-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground capitalize">{skill.level}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className={`text-xs ${
                confidencePercent >= 80 ? 'text-emerald-400' :
                confidencePercent >= 60 ? 'text-yellow-400' : 'text-muted-foreground'
              }`}>
                {confidencePercent}% confidence
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <div className="space-y-2">
          <p className="font-semibold">{skill.name}</p>
          <p className="text-xs text-muted-foreground">
            Category: <span className={config.color}>{config.label}</span>
          </p>
          {skill.usageVerified && (
            <div className="flex items-center gap-2 mt-1 mb-1">
                <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Code Usage Verified
                </Badge>
                {skill.usageStrength && (
                    <span className="text-[10px] text-muted-foreground">
                        Strength: {Math.round(skill.usageStrength * 100)}%
                    </span>
                )}
            </div>
          )}
          {(skill.evidence?.length || 0) > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">Evidence:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {(skill.evidence || []).slice(0, 3).map((e, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-primary">•</span>
                    <span className="line-clamp-2">
                       {typeof e === 'string' ? e : (
                        <a href={e.url} target="_blank" rel="noreferrer" className="hover:underline">
                          {e.label || e.description || e.url}
                        </a>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(skill.keywords?.length || 0) > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {(skill.keywords || []).slice(0, 4).map((kw) => (
                <Badge key={kw} variant="secondary" className="text-xs py-0">
                  {kw}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

// Compact version for cards
export function IndustrySkillsBadges({ analysis, max = 5 }: { analysis: IndustryAnalysis; max?: number }) {
  const topSkills = analysis.verifiedSkills
    .filter(s => s.resumeReady)
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, max)

  return (
    <div className="flex flex-wrap gap-1.5">
      {topSkills.map((skill) => {
        const config = categoryConfig[skill.category]
        const Icon = config?.icon || Code
        return (
          <Badge
            key={skill.name}
            variant="secondary"
            className="text-xs gap-1 py-0.5"
          >
            <Icon className={`h-3 w-3 ${config?.color}`} />
            {skill.name}
          </Badge>
        )
      })}
      {analysis.verifiedSkills.length > max && (
        <Badge variant="outline" className="text-xs py-0.5">
          +{analysis.verifiedSkills.length - max} more
        </Badge>
      )}
    </div>
  )
}

// Engineering Level Badge
export function EngineeringLevelBadge({ level }: { level: string }) {
  const config = engineeringLevelConfig[level] || engineeringLevelConfig['Basic']
  return (
    <Badge className={`${config.bgColor} ${config.color} border-0 gap-1`}>
      <span>{config.emoji}</span>
      {level}
    </Badge>
  )
}
