import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
// Remove top-level store imports to avoid circular dependencies
// import { useAuthStore } from '@/store/auth-store'
// import { useRecruiterStore } from '@/store/recruiter-store'

const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
// Use relative path on client to leverage Next.js proxy and avoid CORS
const API_BASE_URL = typeof window !== 'undefined' ? '/api' : (apiBase 
  ? (apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`)
  : '/api');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Paths that require recruiter authentication
const RECRUITER_PATHS = [
  '/recruiters',
  '/recruiter/',
  '/candidates',
  '/interviews',
  '/templates',
]

// Paths that should use EITHER user or recruiter token (whichever is available)
const SHARED_PATHS = [
  '/chat',
]

// Check if request should use recruiter token
function shouldUseRecruiterToken(url: string, method: string = 'GET'): boolean {
  const upperMethod = method.toUpperCase()
  
  // Always use recruiter token for these paths
  if (RECRUITER_PATHS.some(path => url.includes(path))) {
    return true
  }
  
  // For /v1/jobs endpoint:
  // - POST (create job) = recruiter
  // - PUT/DELETE (update/delete job) = recruiter  
  // - GET (list/search jobs) = user
  // - POST to /apply = user
  if (url.includes('/v1/jobs')) {
    // If it's an apply endpoint, always user token
    if (url.includes('/apply')) {
      return false
    }
    // POST/PUT/DELETE to jobs = recruiter (create/update/delete job)
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(upperMethod)) {
      return true
    }
    // GET = user (searching for jobs)
    return false
  }
  
  return false
}

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const url = config.url || ''
    const method = config.method || 'GET'
    
    // Check if this is a recruiter-specific endpoint
    const isRecruiterPath = shouldUseRecruiterToken(url, method)
    // Check if this is a shared path (like /chat) that works for both user types
    const isSharedPath = SHARED_PATHS.some(path => url.includes(path))
    
    // Dynamically import stores to avoid circular dependency
    const { useRecruiterStore } = await import('@/store/recruiter-store')
    const { useAuthStore } = await import('@/store/auth-store')
    
    const recruiterToken = useRecruiterStore.getState().accessToken
    const userToken = useAuthStore.getState().accessToken
    
    // Token selection logic:
    // 1. Recruiter-specific paths: use recruiter token
    // 2. Shared paths (like /chat): prefer recruiter token if logged in as recruiter, else user token
    // 3. Other paths: prefer user token, fallback to recruiter token
    let token = null
    
    if (isRecruiterPath && recruiterToken) {
      token = recruiterToken
    } else if (isSharedPath) {
      // For shared paths, prefer recruiter token if recruiter is authenticated
      token = recruiterToken || userToken
    } else if (userToken) {
      token = userToken
    } else if (recruiterToken) {
      // Fallback to recruiter token if no user token (recruiter browsing jobs)
      token = recruiterToken
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // If 401 and not already retrying, attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops for auth endpoints
      if (originalRequest.url?.includes('/auth/refresh') || 
          originalRequest.url?.includes('/auth/logout') ||
          originalRequest.url?.includes('/recruiters/logout') ||
          originalRequest.url?.includes('/recruiters/refresh')) {
        return Promise.reject(error)
      }

      originalRequest._retry = true
      const url = originalRequest.url || ''
      const method = originalRequest.method || 'GET'
      const isRecruiterPath = shouldUseRecruiterToken(url, method)
      const isSharedPath = SHARED_PATHS.some(path => url.includes(path))
      
      // Dynamically import stores
      const { useRecruiterStore } = await import('@/store/recruiter-store')
      const { useAuthStore } = await import('@/store/auth-store')

      // For shared paths, determine which auth system to use based on available tokens
      const recruiterToken = useRecruiterStore.getState().accessToken
      const userToken = useAuthStore.getState().accessToken
      const useRecruiterAuth = isRecruiterPath || (isSharedPath && recruiterToken && !userToken)

      try {
        if (useRecruiterAuth) {
          // Recruiter token refresh
          const recruiterStore = useRecruiterStore.getState()
          const { refreshToken } = recruiterStore
          
          if (!refreshToken) {
            recruiterStore.logout()
            return Promise.reject(error)
          }

          const response = await axios.post(`${API_BASE_URL}/v1/recruiters/refresh`, {
            refreshToken
          })

          const { accessToken, refreshToken: newRefreshToken } = response.data.data
          
          // Update recruiter store with new tokens
          useRecruiterStore.setState({
            accessToken,
            refreshToken: newRefreshToken || refreshToken
          })

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
          }
          return apiClient(originalRequest)
        }

        // Developer token refresh
        const { refreshToken, setTokens, logout } = useAuthStore.getState()
        
        // Try to refresh token (might be in cookie even if not in store)
        const response = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {
          refreshToken: refreshToken || undefined,
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data.data
        setTokens(accessToken, newRefreshToken)

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError: any) {
        // Only logout if refresh token is actually invalid (401/403)
        // Don't logout on network errors or other issues
        const refreshStatus = refreshError?.response?.status
        if (refreshStatus === 401 || refreshStatus === 403) {
          console.log('[API Client] Refresh token invalid, logging out')
          if (useRecruiterAuth) {
            useRecruiterStore.getState().logout()
          } else {
            useAuthStore.getState().logout()
          }
        } else {
          console.warn('[API Client] Refresh failed but not logging out:', refreshError?.message)
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Generic API functions
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<{ data: T }>(url, config)
  return response.data.data
}

export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.post<{ data: T }>(url, data, config)
  return response.data.data
}

export async function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.put<{ data: T }>(url, data, config)
  return response.data.data
}

export async function patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.patch<{ data: T }>(url, data, config)
  return response.data.data
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<{ data: T }>(url, config)
  return response.data.data
}
