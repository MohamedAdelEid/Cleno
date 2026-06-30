import { useEffect, useState } from 'react'

import type { ManagedRole } from '@/domain/entities'
import { rolesApi } from '@/infrastructure/api/roles.api'

export const useRoleDetails = (roleSlug: string | undefined) => {
  const [role, setRole] = useState<ManagedRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roleSlug) {
      setRole(null)
      setIsLoading(false)
      return
    }

    let cancelled = false

    const loadRole = async () => {
      setIsLoading(true)
      setError(null)

      const result = await rolesApi.getBySlug(roleSlug)

      if (cancelled) return

      if (result.hasValue && result.data) {
        setRole(result.data)
      } else {
        setRole(null)
        setError(result.error?.message ?? null)
      }

      setIsLoading(false)
    }

    void loadRole()

    return () => {
      cancelled = true
    }
  }, [roleSlug])

  return { role, isLoading, error }
}
