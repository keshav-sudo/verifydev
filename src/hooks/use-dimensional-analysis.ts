/**
 * Dimensional Analysis React Query Hooks
 * Hooks for fetching and caching 6-dimensional project evaluation data
 */

import { useQuery } from '@tanstack/react-query'
import * as dimensionalService from '@/api/services/dimensional-analysis.service'

// Query Keys
export const dimensionalKeys = {
  all: ['dimensional'] as const,
  project: (projectId: string) => [...dimensionalKeys.all, 'project', projectId] as const,
  profile: () => [...dimensionalKeys.all, 'profile'] as const,
}

// ============================================
// PROJECT DIMENSIONAL ANALYSIS
// ============================================

/**
 * Fetch dimensional analysis for a specific project
 * Includes 6-dimensional scores, verdict, and trust analysis
 */
export const useProjectDimensionalAnalysis = (projectId: string | undefined) => {
  return useQuery({
    queryKey: dimensionalKeys.project(projectId ?? ''),
    queryFn: () => dimensionalService.getProjectDimensionalAnalysis(projectId!),
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000, // 10 minutes - dimensional data doesn't change often
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  })
}

// ============================================
// USER DIMENSIONAL PROFILE
// ============================================

/**
 * Fetch aggregated dimensional profile across all user's projects
 * Shows overall strengths, weaknesses, and experience level
 */
export const useUserDimensionalProfile = () => {
  return useQuery({
    queryKey: dimensionalKeys.profile(),
    queryFn: dimensionalService.getUserDimensionalProfile,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  })
}

// ============================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================

export {
  getDimensionDisplayName,
  getDimensionDescription,
  getExperienceLevelColor,
  getTrustLevelColor,
  calculateOverallFromDimensions,
  getDimensionRadarData,
} from '@/api/services/dimensional-analysis.service'
