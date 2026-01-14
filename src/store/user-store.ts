import { create } from 'zustand'
import type { User, GitHubRepo, Project, VerifiedSkill } from '@/types'
import { apiClient } from '@/api/client'

interface AuraState {
  total: number
  level: string
  trend: 'up' | 'down' | 'stable'
  percentile: number
  breakdown: {
    profile: number
    projects: number
    skills: number
    activity: number
    github: number
  }
  breakdownDetails: Record<string, any[]>
  recentGains: Array<{ source?: string; description?: string; type?: string; points: number; date: string }>
}

interface UserState {
  profile: User | null
  aura: AuraState | null
  githubRepos: GitHubRepo[]
  projects: Project[]
  skills: VerifiedSkill[]

  isLoadingProfile: boolean
  isLoadingAura: boolean
  isLoadingRepos: boolean
  isLoadingProjects: boolean
  isLoadingSkills: boolean

  error: string | null
  lastAuraUpdate: number | null

  fetchProfile: () => Promise<void>
  fetchAura: () => Promise<void>
  fetchGitHubRepos: () => Promise<void>
  fetchProjects: () => Promise<void>
  fetchSkills: () => Promise<void>
  analyzeProject: (repoUrl: string) => Promise<void>
  syncGitHubProfile: () => Promise<void>
  refreshAllData: () => Promise<void>
  clearError: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  aura: null,
  githubRepos: [],
  projects: [],
  skills: [],

  isLoadingProfile: false,
  isLoadingAura: false,
  isLoadingRepos: false,
  isLoadingProjects: false,
  isLoadingSkills: false,

  error: null,
  lastAuraUpdate: null,

  // ================= PROFILE =================
  fetchProfile: async () => {
    set({ isLoadingProfile: true, error: null })
    try {
      const res = await apiClient.get<any>('/v1/users/me')
      // Handle multiple response formats
      const responseData = res.data
      let profile = null
      
      if (responseData?.data?.profile) {
        profile = responseData.data.profile
      } else if (responseData?.data && responseData.data.id) {
        profile = responseData.data
      } else if (responseData?.profile) {
        profile = responseData.profile
      } else if (responseData?.id) {
        profile = responseData
      }
      
      set({ profile, isLoadingProfile: false })
    } catch (err: any) {
      console.warn('fetchProfile error:', err?.message)
      set({
        error: err?.response?.data?.message || err?.message || 'Failed to fetch profile',
        isLoadingProfile: false,
      })
    }
  },

  // ================= AURA =================
  fetchAura: async () => {
    set({ isLoadingAura: true, error: null })
    try {
      const res = await apiClient.get<any>('/v1/users/me/aura')
      // Handle multiple response formats
      const responseData = res.data
      const data = responseData?.data || responseData || {}

      const aura: AuraState = {
        total: data.total ?? data.score ?? 0,
        level: data.level ?? 'novice',
        trend: data.trend ?? 'stable',
        percentile: data.percentile ?? 0,
        breakdown: {
          profile: data.breakdown?.profile ?? 0,
          projects: data.breakdown?.projects ?? 0,
          skills: data.breakdown?.skills ?? 0,
          activity: data.breakdown?.activity ?? 0,
          github: data.breakdown?.github ?? 0,
        },
        breakdownDetails:
          data.breakdownDetails ??
          generateBreakdownDetails(data.breakdown),
        recentGains: data.recentGains ?? [],
      }

      set({
        aura,
        isLoadingAura: false,
        lastAuraUpdate: Date.now(),
      })
    } catch (err: any) {
      console.warn('fetchAura error:', err?.message)
      set({
        error: err?.response?.data?.message || err?.message || 'Failed to fetch aura',
        isLoadingAura: false,
      })
    }
  },

  // ================= GITHUB REPOS =================
  fetchGitHubRepos: async () => {
    set({ isLoadingRepos: true, error: null })
    try {
      const res = await apiClient.get<any>('/v1/users/me/repos')
      // Handle multiple response formats
      const responseData = res.data
      let repos: GitHubRepo[] = []
      
      if (Array.isArray(responseData?.data?.repos)) {
        repos = responseData.data.repos
      } else if (Array.isArray(responseData?.data)) {
        repos = responseData.data
      } else if (Array.isArray(responseData?.repos)) {
        repos = responseData.repos
      } else if (Array.isArray(responseData)) {
        repos = responseData
      }
      
      set({ githubRepos: repos, isLoadingRepos: false })
    } catch {
      try {
        await get().syncGitHubProfile()
        const res = await apiClient.get<any>('/v1/users/me/repos')
        const responseData = res.data
        let repos: GitHubRepo[] = []
        
        if (Array.isArray(responseData?.data?.repos)) {
          repos = responseData.data.repos
        } else if (Array.isArray(responseData?.data)) {
          repos = responseData.data
        } else if (Array.isArray(responseData?.repos)) {
          repos = responseData.repos
        } else if (Array.isArray(responseData)) {
          repos = responseData
        }
        
        set({ githubRepos: repos, isLoadingRepos: false })
      } catch (err: any) {
        console.warn('fetchGitHubRepos error:', err?.message)
        set({
          error: err?.response?.data?.message || err?.message || 'Failed to fetch GitHub repos',
          isLoadingRepos: false,
        })
      }
    }
  },

  // ================= PROJECTS =================
  fetchProjects: async () => {
    set({ isLoadingProjects: true, error: null })
    try {
      const res = await apiClient.get<any>('/v1/users/me/projects')
      // Handle multiple response formats
      const responseData = res.data
      let projects: Project[] = []
      
      if (Array.isArray(responseData?.data?.projects)) {
        projects = responseData.data.projects
      } else if (Array.isArray(responseData?.data)) {
        projects = responseData.data
      } else if (Array.isArray(responseData?.projects)) {
        projects = responseData.projects
      } else if (Array.isArray(responseData)) {
        projects = responseData
      }
      
      set({ projects, isLoadingProjects: false })
    } catch (err: any) {
      console.warn('fetchProjects error:', err?.message)
      set({
        error: err?.response?.data?.message || err?.message || 'Failed to fetch projects',
        isLoadingProjects: false,
      })
    }
  },

  // ================= SKILLS =================
  fetchSkills: async () => {
    set({ isLoadingSkills: true, error: null })
    try {
      const res = await apiClient.get<any>('/v1/users/me/skills')
      // Handle multiple response formats
      const responseData = res.data
      let skills: VerifiedSkill[] = []
      
      if (Array.isArray(responseData?.data?.skills)) {
        skills = responseData.data.skills
      } else if (Array.isArray(responseData?.data)) {
        skills = responseData.data
      } else if (Array.isArray(responseData?.skills)) {
        skills = responseData.skills
      } else if (Array.isArray(responseData)) {
        skills = responseData
      }
      
      set({ skills, isLoadingSkills: false })
    } catch (err: any) {
      console.warn('fetchSkills error:', err?.message)
      set({
        error: err?.response?.data?.message || err?.message || 'Failed to fetch skills',
        isLoadingSkills: false,
      })
    }
  },

  analyzeProject: async (repoUrl: string) => {
    set({ error: null })
    try {
      await apiClient.post('/v1/users/me/projects/analyze', { repoUrl })
      // Refresh all data after analysis
      await Promise.all([
        get().fetchProjects(),
        get().fetchAura(),
        get().fetchSkills(),
      ])
    } catch (err: any) {
      set({ error: err?.message || 'Project analysis failed' })
      throw err
    }
  },

  // ================= GITHUB SYNC =================
  syncGitHubProfile: async () => {
    try {
      await apiClient.post('/v1/users/me/sync-github')
    } catch (err: any) {
      console.warn('GitHub sync failed:', err?.message)
    }
  },

  // ================= REFRESH ALL =================
  refreshAllData: async () => {
    await Promise.all([
      get().fetchProfile(),
      get().fetchAura(),
      get().fetchProjects(),
      get().fetchSkills(),
      get().fetchGitHubRepos(),
    ])
  },

  clearError: () => set({ error: null }),
}))

// ================= HELPERS =================
function generateBreakdownDetails(breakdown?: any): Record<string, any[]> {
  if (!breakdown) return {}

  return {
    profile: [
      { label: 'Basic Info', points: 10, earned: breakdown.profile >= 10 },
      { label: 'Bio', points: 10, earned: breakdown.profile >= 20 },
      { label: 'Avatar', points: 10, earned: breakdown.profile >= 30 },
      { label: 'Location', points: 10, earned: breakdown.profile >= 40 },
      { label: 'Links', points: 10, earned: breakdown.profile >= 50 },
      { label: 'Skills', points: 10, earned: breakdown.profile >= 60 },
    ],
    projects: [
      {
        label: 'Projects Analyzed',
        points: breakdown.projects,
        earned: breakdown.projects > 0,
      },
    ],
    skills: [
      {
        label: 'Verified Skills',
        points: breakdown.skills,
        earned: breakdown.skills > 0,
      },
    ],
    activity: [
      {
        label: 'Platform Activity',
        points: breakdown.activity,
        earned: breakdown.activity > 0,
      },
    ],
    github: [
      {
        label: 'Followers',
        points: Math.min(breakdown.github * 0.4, 40),
        earned: breakdown.github > 0,
      },
      {
        label: 'Public Repos',
        points: Math.min(breakdown.github * 0.3, 30),
        earned: breakdown.github > 0,
      },
      {
        label: 'Contributions',
        points: Math.min(breakdown.github * 0.3, 30),
        earned: breakdown.github > 0,
      },
    ],
  }
}
