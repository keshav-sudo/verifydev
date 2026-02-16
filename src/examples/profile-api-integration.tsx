/**
 * API INTEGRATION EXAMPLE
 * Shows how to fetch and transform real API data for PublicProfile
 */

import { get } from '@/api/client'
import PublicProfile from '@/views/public-profile'

// Type for API response (adjust based on your actual API)
interface ApiUserProfile {
  user: {
    name: string
    username: string
    email: string
    avatarUrl: string
    bio?: string
    location?: string
    company?: string
    website?: string
    tags?: string[]
    auraScore: number
    publicRepos?: number
    followers?: number
    githubContributions?: number
    leetcodeUsername?: string
  }
  aura: {
    total: number
    level: string
    trend: string
    percentile: number
    breakdown: {
      profile: number
      projects: number
      skills: number
      activity: number
      github: number
    }
  }
  skills: Array<{
    name: string
    category: string
    isVerified: boolean
    score?: number
    verifiedScore?: number
  }>
  projects: Array<{
    id: string
    name: string
    repoName: string
    description?: string
    language?: string
    stars: number
    forks: number
    auraContribution: number
    url?: string
  }>
  githubStats?: {
    username: string
    submissionCalendar: Record<string, number>
  }
  leetcodeStats?: {
    username: string
    totalSolved: number
    easySolved: number
    mediumSolved: number
    hardSolved: number
    ranking: number
    acceptanceRate: number
    contributionPoints: number
    reputation: number
    submissionCalendar: Record<string, number>
  }
}

/**
 * Fetch complete profile data from API
 */
export async function fetchProfileData(username: string): Promise<ApiUserProfile> {
  try {
    // Fetch all data in parallel for better performance
    const [user, aura, skills, projects, githubStats, leetcodeStats] = await Promise.all([
      get<ApiUserProfile['user']>(`/v1/users/${username}`),
      get<ApiUserProfile['aura']>(`/v1/users/${username}/aura`),
      get<ApiUserProfile['skills']>(`/v1/users/${username}/skills`),
      get<ApiUserProfile['projects']>(`/v1/users/${username}/projects`),
      get<ApiUserProfile['githubStats']>(`/v1/users/${username}/github-stats`).catch(() => null),
      get<ApiUserProfile['leetcodeStats']>(`/v1/users/${username}/leetcode-stats`).catch(() => null),
    ])

    return {
      user,
      aura,
      skills,
      projects,
      ...(githubStats && { githubStats }),
      ...(leetcodeStats && { leetcodeStats }),
    }
  } catch (error) {
    console.error('Failed to fetch profile data:', error)
    throw error
  }
}

/**
 * Example: Server Component (Next.js App Router)
 */
export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  // PublicProfile reads username from URL params internally via useParams()
  // fetchProfileData is shown here as an example of how to call the API
  void params.username
  
  return <PublicProfile />
}

/**
 * Example: Client Component with Loading State
 */
'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export function PublicProfileClient({ username }: { username: string }) {
  const [data, setData] = useState<ApiUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfileData(username)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">{error || 'Unable to load profile data'}</p>
        </div>
      </div>
    )
  }

  // PublicProfile fetches its own data internally via useParams() + useQuery()
  return <PublicProfile />
}

/**
 * Example: Transform legacy API data to new format
 */
export function transformLegacyData(legacyData: any): ApiUserProfile {
  return {
    user: {
      name: legacyData.fullName || legacyData.name,
      username: legacyData.username || legacyData.handle,
      email: legacyData.email,
      avatarUrl: legacyData.avatar || legacyData.profileImage,
      bio: legacyData.biography || legacyData.bio,
      location: legacyData.location,
      company: legacyData.organization || legacyData.company,
      website: legacyData.websiteUrl || legacyData.blog,
      tags: legacyData.badges || legacyData.tags || [],
      auraScore: legacyData.totalAura || legacyData.auraScore || 0,
      publicRepos: legacyData.repoCount || legacyData.publicRepos,
      followers: legacyData.followerCount || legacyData.followers,
      githubContributions: legacyData.contributions,
      leetcodeUsername: legacyData.leetcode?.username,
    },
    aura: {
      total: legacyData.aura?.total || legacyData.totalAura || 0,
      level: legacyData.aura?.level || 'Beginner',
      trend: legacyData.aura?.trend || 'stable',
      percentile: legacyData.aura?.percentile || 50,
      breakdown: {
        profile: legacyData.aura?.breakdown?.profile || 0,
        projects: legacyData.aura?.breakdown?.projects || 0,
        skills: legacyData.aura?.breakdown?.skills || 0,
        activity: legacyData.aura?.breakdown?.activity || 0,
        github: legacyData.aura?.breakdown?.github || 0,
      },
    },
    skills: (legacyData.verifiedSkills || legacyData.skills || []).map((skill: any) => ({
      name: skill.name || skill.skillName,
      category: skill.category || skill.type || 'TOOL',
      isVerified: skill.verified || skill.isVerified || false,
      score: skill.score || skill.confidence,
      verifiedScore: skill.verifiedScore || skill.aiScore,
    })),
    projects: (legacyData.repositories || legacyData.projects || []).map((project: any) => ({
      id: project.id || project._id,
      name: project.name,
      repoName: project.fullName || project.repoName || project.name,
      description: project.description,
      language: project.primaryLanguage || project.language,
      stars: project.stargazersCount || project.stars || 0,
      forks: project.forksCount || project.forks || 0,
      auraContribution: project.auraScore || project.contribution || 0,
      url: project.htmlUrl || project.url,
    })),
    ...(legacyData.github && {
      githubStats: {
        username: legacyData.github.username || legacyData.githubUsername,
        submissionCalendar: legacyData.github.contributionCalendar || {},
      },
    }),
    ...(legacyData.leetcode && {
      leetcodeStats: {
        username: legacyData.leetcode.username,
        totalSolved: legacyData.leetcode.totalSolved || 0,
        easySolved: legacyData.leetcode.easySolved || 0,
        mediumSolved: legacyData.leetcode.mediumSolved || 0,
        hardSolved: legacyData.leetcode.hardSolved || 0,
        ranking: legacyData.leetcode.ranking || 0,
        acceptanceRate: legacyData.leetcode.acceptanceRate || 0,
        contributionPoints: legacyData.leetcode.contributionPoints || 0,
        reputation: legacyData.leetcode.reputation || 0,
        submissionCalendar: legacyData.leetcode.submissionCalendar || {},
      },
    }),
  }
}

/**
 * Example: Incremental data loading (load tabs on demand)
 */
export function useProfileData(username: string) {
  const [data, setData] = useState<Partial<ApiUserProfile>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const loadSection = async (section: keyof ApiUserProfile) => {
    if (data[section] || loading[section]) return

    setLoading((prev) => ({ ...prev, [section]: true }))
    
    try {
      const endpoint = {
        user: `/v1/users/${username}`,
        aura: `/v1/users/${username}/aura`,
        skills: `/v1/users/${username}/skills`,
        projects: `/v1/users/${username}/projects`,
        githubStats: `/v1/users/${username}/github-stats`,
        leetcodeStats: `/v1/users/${username}/leetcode-stats`,
      }[section]

      const result = await get(endpoint)
      setData((prev) => ({ ...prev, [section]: result }))
    } catch (error) {
      console.error(`Failed to load ${section}:`, error)
    } finally {
      setLoading((prev) => ({ ...prev, [section]: false }))
    }
  }

  return { data, loading, loadSection }
}
