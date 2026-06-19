import { useEffect, useState } from 'react'

import type { PermissionModuleGroup } from '@/domain/entities'
import { permissionsApi } from '@/infrastructure/api/permissions.api'

export const useRolePermissions = () => {
  const [groups, setGroups] = useState<PermissionModuleGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadPermissions = async () => {
      setIsLoading(true)
      setError(null)

      const result = await permissionsApi.getAll()

      if (cancelled) return

      if (result.hasValue && result.data) {
        setGroups(result.data)
      } else {
        setError(result.error?.message ?? null)
      }

      setIsLoading(false)
    }

    void loadPermissions()

    return () => {
      cancelled = true
    }
  }, [])

  return { groups, isLoading, error }
}
