import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { apiClient } from '@/api/client'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: User | null) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  checkAuth: () => Promise<void>
  login: () => void
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      checkAuth: async () => {
        const { accessToken } = get()
        
        if (!accessToken) {
          set({ isLoading: false, isAuthenticated: false })
          return
        }

        try {
          const response = await apiClient.get<any>('/v1/auth/me')
          
          // Handle multiple possible response formats:
          // Format 1: { data: { user: {...} } }
          // Format 2: { data: {...} } (user directly in data)
          // Format 3: { user: {...} } (no wrapper)
          const responseData = response.data
          let user: User | null = null
          
          if (responseData?.data?.user) {
            // Format 1: Nested under data.user
            user = responseData.data.user
          } else if (responseData?.data && responseData.data.id) {
            // Format 2: User directly in data (has id field)
            user = responseData.data
          } else if (responseData?.user) {
            // Format 3: User at top level
            user = responseData.user
          } else if (responseData?.id) {
            // Format 4: Response IS the user
            user = responseData
          }
          
          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            console.warn('checkAuth: Could not parse user from response', responseData)
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error: any) {
          console.warn('checkAuth error:', error?.response?.status, error?.message)
          // Only clear auth state if strictly 401 (Unauthorized)
          // This prevents logging out the user due to network errors or server downtime
          if (error?.response?.status === 401) {
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            })
          } else {
            // Keep the token, just mark as not loading
            // User might still be authenticated, just a network issue
            set({ isLoading: false })
          }
        }
      },

      login: () => {
        // Redirect directly to gateway - browser redirects don't go through Vite proxy
        // In production, this should be the actual API domain
        // In production, this should be the actual API domain
        const gatewayUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://api.verifydev.me'
          window.location.href = `${gatewayUrl}/api/v1/auth/github`
      },

      logout: async () => {
        const { accessToken } = get()
        if (!accessToken) {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          })
          return
        }

        try {
          await apiClient.post('/v1/auth/logout')
        } catch {
          // Ignore logout errors
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
