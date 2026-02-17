/**
 * Dimensional Analysis Card
 * Displays the 6-dimensional evaluation radar chart and summary
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  useProjectDimensionalAnalysis,
  getDimensionDisplayName,
  getDimensionDescription,
  getExperienceLevelColor,
  getTrustLevelColor,
} from '@/hooks/use-dimensional-analysis'
import type { DimensionMatrix, DimensionScore } from '@/types/dimensions'
import { cn } from '@/lib/utils'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import {
  Brain,
  Shield,
  TestTube,
  Layers,
  Server,
  Code,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'

// Dimension icons
const dimensionIcons: Record<string, React.ElementType> = {
  fundamentals: Code,
  engineeringDepth: Brain,
  productionReadiness: Shield,
  testingMaturity: TestTube,
  architecture: Layers,
  infraDevOps: Server,
}

// Keys that represent actual dimensions (not metadata)
const DIMENSION_KEYS = [
  'fundamentals',
  'engineeringDepth',
  'productionReadiness',
  'testingMaturity',
  'architecture',
  'infraDevOps',
] as const

interface DimensionalAnalysisCardProps {
  projectId: string
  variant?: 'full' | 'compact'
  className?: string
}

export function DimensionalAnalysisCard({
  projectId,
  variant = 'full',
  className,
}: DimensionalAnalysisCardProps) {
  const { data, isLoading, error } = useProjectDimensionalAnalysis(projectId)

  if (isLoading) {
    return <DimensionalAnalysisSkeleton variant={variant} />
  }

  if (error || !data) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <p>Dimensional analysis not available</p>
            <p className="text-sm">Re-analyze the project to get dimensional data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <CompactDimensionalCard
        matrix={data.dimensionMatrix}
        experienceLevel={data.quickStats.experienceLevel}
        trustLevel={data.quickStats.trustLevel}
        className={className}
      />
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Dimensional Analysis</CardTitle>
            <CardDescription>
              6-dimensional evaluation of engineering skills
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={getExperienceLevelColor(data.quickStats.experienceLevel)}>
              {formatExperienceLevel(data.quickStats.experienceLevel)}
            </Badge>
            <Badge variant="outline" className={getTrustLevelColor(data.quickStats.trustLevel)}>
              {data.quickStats.trustLevel} Trust
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radar Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={getRadarData(data.dimensionMatrix)}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Dimension Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DIMENSION_KEYS.map((key) => {
            const dim = data.dimensionMatrix[key as keyof typeof data.dimensionMatrix]
            if (dim && typeof dim === 'object' && 'score' in dim) {
              return <DimensionRow key={key} dimension={key} score={dim as DimensionScore} />
            }
            return null
          })}
        </div>

        {/* Verdict Summary */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-2">Verdict</h4>
          <p className="text-muted-foreground">{data.verdict.summary}</p>

          {data.verdict.strengths.length > 0 && (
            <div className="mt-3">
              <h5 className="text-sm font-medium flex items-center gap-1 mb-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Strengths
              </h5>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                {data.verdict.strengths.slice(0, 3).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {data.verdict.growthAreas.length > 0 && (
            <div className="mt-3">
              <h5 className="text-sm font-medium flex items-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Growth Areas
              </h5>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                {data.verdict.growthAreas.slice(0, 3).map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Trust Analysis */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-2">Trust Analysis</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Estimated Effort:</span>
              <span className="ml-2 font-medium">{data.trustAnalysis.effort.estimatedHours}h</span>
            </div>
            <div>
              <span className="text-muted-foreground">Authenticity:</span>
              <span className="ml-2 font-medium">{data.trustAnalysis.authenticity.score}%</span>
            </div>
          </div>
          {data.trustAnalysis.authenticity.flags.length > 0 && (
            <div className="mt-2">
              <span className="text-sm text-amber-600">
                ⚠️ {data.trustAnalysis.authenticity.flags.join(', ')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Dimension Row Component
function DimensionRow({ dimension, score }: { dimension: string; score: DimensionScore }) {
  const Icon = dimensionIcons[dimension] || Code

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {getDimensionDisplayName(dimension)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{score.score}</span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round(score.confidence * 100)}% conf)
                </span>
              </div>
            </div>
            <Progress value={score.score} className="h-2" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="max-w-xs">
            <p className="font-medium">{getDimensionDisplayName(dimension)}</p>
            <p className="text-xs text-muted-foreground">
              {getDimensionDescription(dimension)}
            </p>
            {score.signals.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium">Signals:</p>
                <ul className="text-xs text-muted-foreground">
                  {score.signals.slice(0, 5).map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Compact Card Variant
function CompactDimensionalCard({
  matrix,
  experienceLevel,
  className,
}: {
  matrix: DimensionMatrix
  experienceLevel: string
  className?: string
}) {
  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Dimensional Score</span>
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs">
              {formatExperienceLevel(experienceLevel)}
            </Badge>
          </div>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={getRadarData(matrix)}>
              <PolarGrid />
              <Radar
                dataKey="score"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton Component
function DimensionalAnalysisSkeleton({ variant }: { variant: 'full' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <Card>
        <CardContent className="pt-4 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper Functions
function getRadarData(matrix: DimensionMatrix) {
  return [
    { name: 'Fundamentals', score: matrix.fundamentals.score },
    { name: 'Engineering', score: matrix.engineeringDepth.score },
    { name: 'Production', score: matrix.productionReadiness.score },
    { name: 'Testing', score: matrix.testingMaturity.score },
    { name: 'Architecture', score: matrix.architecture.score },
    { name: 'DevOps', score: matrix.infraDevOps.score },
  ]
}

function formatExperienceLevel(level: string): string {
  const formats: Record<string, string> = {
    INTERN: 'Intern',
    JUNIOR: 'Junior',
    MID_LEVEL: 'Mid-Level',
    SENIOR: 'Senior',
    STAFF: 'Staff',
    PRINCIPAL: 'Principal',
  }
  return formats[level] ?? level
}
