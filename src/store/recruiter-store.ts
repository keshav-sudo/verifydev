import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Recruiter, CandidateProfile } from '@/types'
import { apiClient } from '@/api/client'

interface RecruiterSearchFilters {
  skills?: string[]
  minAuraScore?: number
  minCoreCount?: number
  location?: string
  isOpenToWork?: boolean
  minSkillScore?: number
}

interface RecruiterState {
  recruiter: Recruiter | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Search state
  searchResults: CandidateProfile[]
  searchFilters: RecruiterSearchFilters
  searchTotal: number
  searchPage: number
  isSearching: boolean
  
  // Selected candidate
  selectedCandidate: any | null
  isLoadingCandidate: boolean

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  
  // Search actions
  searchCandidates: (filters?: RecruiterSearchFilters) => Promise<void>
  setFilters: (filters: RecruiterSearchFilters) => void
  clearFilters: () => void
  
  // Candidate actions
  getCandidateProfile: (userId: string) => Promise<void>
  getCandidateResume: (userId: string) => Promise<any>
  clearError: () => void
}

interface RegisterData {
  email: string
  password: string
  name: string
  company: string
  companyWebsite?: string
  position?: string
}

export const useRecruiterStore = create<RecruiterState>()(
  persist(
    (set, get) => ({
      recruiter: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      searchResults: [],
      searchFilters: {},
      searchTotal: 0,
      searchPage: 1,
      isSearching: false,
      selectedCandidate: null,
      isLoadingCandidate: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.post<{ data: { recruiter: Recruiter; accessToken: string; refreshToken?: string } }>(
            '/v1/recruiters/login',
            { email, password }
          )
          const { recruiter, accessToken, refreshToken } = response.data.data
          set({ 
            recruiter, 
            accessToken,
            refreshToken: refreshToken || null,
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Login failed', 
            isLoading: false 
          })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          // Map frontend field names to backend expected format
          const payload = {
            email: data.email,
            password: data.password,
            name: data.name,
            organizationName: data.company, // Backend expects organizationName
            organizationWebsite: data.companyWebsite,
            position: data.position
          };
          const response = await apiClient.post<{ data: { recruiter: Recruiter; accessToken: string; refreshToken?: string } }>(
            '/v1/recruiters/register',
            payload
          )
          const { recruiter, accessToken, refreshToken } = response.data.data
          set({ 
            recruiter, 
            accessToken,
            refreshToken: refreshToken || null,
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Registration failed', 
            isLoading: false 
          })
          throw error
        }
      },

      logout: () => {
        set({
          recruiter: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          searchResults: [],
          selectedCandidate: null,
        })
      },

      checkAuth: async () => {
        const { accessToken } = get()
        if (!accessToken) {
          set({ isLoading: false, isAuthenticated: false })
          return
        }

        try {
          const response = await apiClient.get<any>(
            '/v1/recruiters/me',
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          
          // Handle multiple possible response formats
          const responseData = response.data
          let recruiter: Recruiter | null = null
          
          if (responseData?.data?.recruiter) {
            recruiter = responseData.data.recruiter
          } else if (responseData?.data && responseData.data.id) {
            recruiter = responseData.data
          } else if (responseData?.recruiter) {
            recruiter = responseData.recruiter
          } else if (responseData?.id) {
            recruiter = responseData
          }
          
          if (recruiter) {
            set({ 
              recruiter, 
              isAuthenticated: true, 
              isLoading: false 
            })
          } else {
            console.warn('checkAuth: Could not parse recruiter from response', responseData)
            set({ 
              recruiter: null, 
              isAuthenticated: false, 
              isLoading: false 
            })
          }
        } catch (error: any) {
          console.warn('Recruiter checkAuth error:', error?.response?.status, error?.message)
          // Only clear tokens on 401 (Unauthorized)
          if (error?.response?.status === 401) {
            set({ 
              recruiter: null, 
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false, 
              isLoading: false 
            })
          } else {
            // Keep tokens, just mark as not loading
            set({ isLoading: false })
          }
        }
      },

      searchCandidates: async (filters) => {
        const { searchFilters, accessToken } = get()
        const finalFilters = filters || searchFilters
        
        set({ isSearching: true, error: null })
        try {
          const params = new URLSearchParams()
          if (finalFilters.skills?.length) {
            finalFilters.skills.forEach(s => params.append('skills', s))
          }
          if (finalFilters.minAuraScore) params.set('minAuraScore', String(finalFilters.minAuraScore))
          if (finalFilters.minCoreCount) params.set('minCoreCount', String(finalFilters.minCoreCount))
          if (finalFilters.location) params.set('location', finalFilters.location)
          if (finalFilters.isOpenToWork !== undefined) params.set('isOpenToWork', String(finalFilters.isOpenToWork))
          if (finalFilters.minSkillScore) params.set('minSkillScore', String(finalFilters.minSkillScore))
          
          const response = await apiClient.get<{ 
            data: CandidateProfile[] | { candidates: CandidateProfile[] }; 
            meta?: { total: number; page: number; limit?: number; totalPages?: number } 
          }>(
            `/v1/recruiters/candidates/search?${params.toString()}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          
          // Handle both response formats: {data: []} and {data: {candidates: []}}
          const responseData = response.data.data;
          const candidates = Array.isArray(responseData) 
            ? responseData 
            : (responseData?.candidates || []);
          
          set({ 
            searchResults: candidates,
            searchTotal: response.data.meta?.total || candidates.length,
            searchPage: response.data.meta?.page || 1,
            isSearching: false 
          })
        } catch (error: any) {
          console.log('Search candidates error:', error)
          // Set empty results instead of showing error to prevent blank screen
          set({ 
            searchResults: [],
            searchTotal: 0,
            error: error.response?.data?.message || 'Search failed', 
            isSearching: false 
          })
        }
      },

      setFilters: (filters) => {
        set({ searchFilters: { ...get().searchFilters, ...filters } })
      },

      clearFilters: () => {
        set({ searchFilters: {}, searchResults: [], searchTotal: 0 })
      },

      getCandidateProfile: async (userId) => {
        const { accessToken } = get()
        set({ isLoadingCandidate: true, error: null })
        try {
          const response = await apiClient.get<{ data: { candidate: any } }>(
            `/v1/recruiters/candidates/${userId}/full`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          set({ 
            selectedCandidate: response.data.data.candidate, 
            isLoadingCandidate: false 
          })
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to load candidate', 
            isLoadingCandidate: false 
          })
        }
      },

      getCandidateResume: async (userId) => {
        const { accessToken } = get()
        try {
          const response = await apiClient.get<{ data: any }>(
            `/v1/recruiters/candidates/${userId}/resume`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          return response.data.data
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to get resume' })
          throw error
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'recruiter-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
