import { useCallback, useEffect, useState } from 'react'

import type { ActiveSession } from '@/domain/entities'
import { DUMMY_SESSIONS, mockDelay } from '../profile.data'

export const useSessions = () => {
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    await mockDelay()
    setSessions(DUMMY_SESSIONS)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void fetchSessions()
  }, [fetchSessions])

  const revokeSession = useCallback(
    async (sessionId: string): Promise<{ success: boolean; error?: string }> => {
      await mockDelay(300)
      setSessions((current) => current.filter((s) => s.id !== sessionId))
      return { success: true }
    },
    [],
  )

  const revokeAllSessions = useCallback(async (): Promise<{
    success: boolean
    error?: string
  }> => {
    await mockDelay(400)
    setSessions((current) => current.filter((s) => s.isCurrent))
    return { success: true }
  }, [])

  return {
    sessions,
    isLoading,
    revokeSession,
    revokeAllSessions,
    refetch: fetchSessions,
  }
}
