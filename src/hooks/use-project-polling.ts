/**
 * useProjectPolling Hook
 * Efficient polling for project analysis status with exponential backoff
 * Automatically stops when analysis completes
 */

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface UseProjectPollingOptions {
  projectId?: string
  enabled?: boolean
  onComplete?: () => void
  onError?: (error: Error) => void
}

/**
 * Smart polling intervals based on analysis stage
 * - First 30s: Poll every 2s (fast updates during initial processing)
 * - 30s-2min: Poll every 5s (moderate updates)
 * - 2min+: Poll every 10s (slow updates for long-running analysis)
 */
const getPollingInterval = (elapsedTime: number): number => {
  if (elapsedTime < 30000) return 2000 // 2s for first 30s
  if (elapsedTime < 120000) return 5000 // 5s for 30s-2min
  return 10000 // 10s after 2min
}

export function useProjectPolling({
  projectId,
  enabled = true,
  onComplete,
  onError,
}: UseProjectPollingOptions) {
  const queryClient = useQueryClient()
  const startTimeRef = useRef<number>(Date.now())
  const intervalRef = useRef<NodeJS.Timeout>()
  const currentIntervalRef = useRef<number>(2000)

  useEffect(() => {
    if (!enabled || !projectId) {
      return
    }

    startTimeRef.current = Date.now()

    const poll = async () => {
      try {
        // Invalidate queries to trigger refetch
        await queryClient.invalidateQueries({ queryKey: ['projects'] })
        await queryClient.invalidateQueries({ queryKey: ['project', projectId] })

        // Get updated project data
        const projectsData = queryClient.getQueryData<{ projects: any[] }>(['projects'])
        const project = projectsData?.projects?.find((p: any) => p.id === projectId)

        if (project) {
          const status = project.analysisStatus?.toLowerCase()

          // Stop polling if analysis is complete or failed
          if (status === 'completed' || status === 'failed') {
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
            }

            if (status === 'completed') {
              // Refresh related queries
              queryClient.invalidateQueries({ queryKey: ['aura'] })
              queryClient.invalidateQueries({ queryKey: ['skills'] })
              queryClient.invalidateQueries({ queryKey: ['profile'] })
              onComplete?.()
            } else if (status === 'failed') {
              onError?.(new Error('Analysis failed'))
            }
            return
          }

          // Adjust polling interval based on elapsed time
          const elapsedTime = Date.now() - startTimeRef.current
          const newInterval = getPollingInterval(elapsedTime)

          if (newInterval !== currentIntervalRef.current) {
            currentIntervalRef.current = newInterval
            // Restart interval with new timing
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
            }
            intervalRef.current = setInterval(poll, newInterval)
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
        onError?.(error as Error)
      }
    }

    // Start polling
    intervalRef.current = setInterval(poll, currentIntervalRef.current)

    // Initial poll
    poll()

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [projectId, enabled, queryClient, onComplete, onError])

  return {
    stop: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    },
  }
}

/**
 * Hook for polling multiple projects
 */
export function useMultiProjectPolling({
  projectIds = [],
  enabled = true,
  onAllComplete,
}: {
  projectIds?: string[]
  enabled?: boolean
  onAllComplete?: () => void
}) {
  const queryClient = useQueryClient()
  const intervalRef = useRef<NodeJS.Timeout>()
  const completedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!enabled || projectIds.length === 0) {
      return
    }

    const poll = async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ['projects'] })

        const projectsData = queryClient.getQueryData<{ projects: any[] }>(['projects'])
        const analyzingProjects = projectsData?.projects?.filter((p: any) =>
          projectIds.includes(p.id)
        )

        if (!analyzingProjects) return

        // Check completion status
        const allCompleted = analyzingProjects.every((p: any) => {
          const status = p.analysisStatus?.toLowerCase()
          return status === 'completed' || status === 'failed'
        })

        if (allCompleted) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          queryClient.invalidateQueries({ queryKey: ['aura'] })
          queryClient.invalidateQueries({ queryKey: ['skills'] })
          onAllComplete?.()
        }
      } catch (error) {
        console.error('Multi-project polling error:', error)
      }
    }

    // Poll every 3 seconds for multiple projects
    intervalRef.current = setInterval(poll, 3000)
    poll()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [projectIds, enabled, queryClient, onAllComplete])
}
