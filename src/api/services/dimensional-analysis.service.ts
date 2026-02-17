/**
 * Dimensional Analysis Service
 * Handles 6-dimensional project evaluation, verdicts, and trust analysis
 * Backend: user-service (port 3002)
 */

import { get } from '../client'
import type {
  DimensionMatrix,
  DimensionScore,
  Verdict,
  TrustAnalysis,
  DimensionalExperienceLevel,
  TrustLevel,
} from '@/types/dimensions'

// ============================================
// RESPONSE TYPES
// ============================================

export interface DimensionalAnalysisResponse {
  success: boolean
  data: {
    projectId: string
    projectName: string
    analyzedAt: string
    dimensionMatrix: DimensionMatrix
    verdict: Verdict
    trustAnalysis: TrustAnalysis
    quickStats: {
      overallScore: number
      topDimension: string
      experienceLevel: DimensionalExperienceLevel
      trustLevel: TrustLevel
      skillCount: number
    }
    topSkills: Array<{
      name: string
      category: string
      confidence: number
      auraPoints: number
    }>
  }
}

export interface UserDimensionalProfileResponse {
  success: boolean
  data: {
    hasProfile: boolean
    message?: string
    projectCount?: number
    aggregatedDimensions?: {
      fundamentals: number
      engineeringDepth: number
      productionReadiness: number
      testingMaturity: number
      architecture: number
      infraDevOps: number
    }
    overallExperienceLevel?: DimensionalExperienceLevel
    averageTrustScore?: number
    strongestDimension?: string
    growthDimension?: string
  }
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get dimensional analysis for a specific project
 */
/**
 * Get dimensional analysis for a specific project
 */
export async function getProjectDimensionalAnalysis(
  projectId: string
): Promise<DimensionalAnalysisResponse['data']> {
  // client.get unwraps response.data.data, so we verify T is the inner data type
  const data = await get<DimensionalAnalysisResponse['data']>(
    `/v1/projects/${projectId}/dimensional`
  )
  return data
}

/**
 * Get aggregated dimensional profile across all user's projects
 */
export async function getUserDimensionalProfile(): Promise<UserDimensionalProfileResponse['data']> {
  const data = await get<UserDimensionalProfileResponse['data']>(
    '/v1/projects/dimensional/profile'
  )
  return data
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get human-readable dimension name
 */
export function getDimensionDisplayName(dimension: string): string {
  const names: Record<string, string> = {
    fundamentals: 'Fundamentals',
    engineeringDepth: 'Engineering Depth',
    productionReadiness: 'Production Readiness',
    testingMaturity: 'Testing Maturity',
    architecture: 'Architecture',
    infraDevOps: 'Infrastructure & DevOps',
  }
  return names[dimension] ?? dimension
}

/**
 * Get dimension description
 */
export function getDimensionDescription(dimension: string): string {
  const descriptions: Record<string, string> = {
    fundamentals: 'Code organization, best practices, documentation',
    engineeringDepth: 'Advanced patterns, complexity handling, design patterns',
    productionReadiness: 'Security, error handling, scalability considerations',
    testingMaturity: 'Test coverage, CI/CD, quality gates',
    architecture: 'System design, modularity, clean architecture',
    infraDevOps: 'Containerization, deployment, infrastructure as code',
  }
  return descriptions[dimension] ?? ''
}

/**
 * Get experience level badge color
 */
export function getExperienceLevelColor(level: DimensionalExperienceLevel | string): string {
  const colors: Record<string, string> = {
    INTERN: 'bg-gray-500',
    JUNIOR: 'bg-blue-500',
    MID_LEVEL: 'bg-green-500',
    SENIOR: 'bg-purple-500',
    STAFF: 'bg-orange-500',
    PRINCIPAL: 'bg-red-500',
  }
  return colors[level] ?? 'bg-gray-500'
}

/**
 * Get trust level badge color
 */
export function getTrustLevelColor(level: TrustLevel | string): string {
  const colors: Record<string, string> = {
    UNVERIFIED: 'bg-gray-400',
    LOW: 'bg-red-500',
    MEDIUM: 'bg-yellow-500',
    HIGH: 'bg-green-500',
    VERIFIED: 'bg-emerald-600',
  }
  return colors[level] ?? 'bg-gray-400'
}

/**
 * Calculate overall score from dimensions (weighted average)
 */
export function calculateOverallFromDimensions(matrix: DimensionMatrix): number {
  const weights: Record<string, number> = {
    fundamentals: 0.20,
    engineeringDepth: 0.20,
    productionReadiness: 0.15,
    testingMaturity: 0.15,
    architecture: 0.15,
    infraDevOps: 0.15,
  }

  let totalWeight = 0
  let weightedSum = 0

  for (const [dim, weight] of Object.entries(weights)) {
    const dimData = (matrix as unknown as Record<string, DimensionScore>)[dim]
    if (dimData && typeof dimData === 'object' && 'score' in dimData && 'confidence' in dimData) {
      // Weight by both dimension weight and confidence
      const effectiveWeight = weight * dimData.confidence
      weightedSum += dimData.score * effectiveWeight
      totalWeight += effectiveWeight
    }
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
}

/**
 * Get radar chart data from dimension matrix
 */
export function getDimensionRadarData(matrix: DimensionMatrix): Array<{
  dimension: string
  displayName: string
  score: number
  confidence: number
  fullMark: 100
}> {
  return [
    {
      dimension: 'fundamentals',
      displayName: 'Fundamentals',
      score: matrix.fundamentals.score,
      confidence: matrix.fundamentals.confidence,
      fullMark: 100,
    },
    {
      dimension: 'engineeringDepth',
      displayName: 'Engineering',
      score: matrix.engineeringDepth.score,
      confidence: matrix.engineeringDepth.confidence,
      fullMark: 100,
    },
    {
      dimension: 'productionReadiness',
      displayName: 'Production',
      score: matrix.productionReadiness.score,
      confidence: matrix.productionReadiness.confidence,
      fullMark: 100,
    },
    {
      dimension: 'testingMaturity',
      displayName: 'Testing',
      score: matrix.testingMaturity.score,
      confidence: matrix.testingMaturity.confidence,
      fullMark: 100,
    },
    {
      dimension: 'architecture',
      displayName: 'Architecture',
      score: matrix.architecture.score,
      confidence: matrix.architecture.confidence,
      fullMark: 100,
    },
    {
      dimension: 'infraDevOps',
      displayName: 'DevOps',
      score: matrix.infraDevOps.score,
      confidence: matrix.infraDevOps.confidence,
      fullMark: 100,
    },
  ]
}
