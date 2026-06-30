import { useEffect, useMemo, useState } from 'react'

import type { PermissionModuleGroup } from '@/domain/entities'
import { rolesApi } from '@/infrastructure/api/roles.api'

export const useRoleAssignedPermissions = (roleSlug: string | undefined) => {
  const [groups, setGroups] = useState<PermissionModuleGroup[]>([])
  const [isLoading, setIsLoading] = useState(!!roleSlug)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roleSlug) {
      setGroups([])
      setIsLoading(false)
      return
    }

    let cancelled = false

    const loadPermissions = async () => {
      setIsLoading(true)
      setError(null)

      const result = await rolesApi.getAssignedPermissions(roleSlug)

      if (cancelled) return

      if (result.hasValue && result.data) {
        setGroups(result.data)
      } else {
        setGroups([])
        setError(result.error?.message ?? null)
      }

      setIsLoading(false)
    }

    void loadPermissions()

    return () => {
      cancelled = true
    }
  }, [roleSlug])

  const permissionIds = useMemo(
    () => groups.flatMap((group) => group.permissions.map((permission) => permission.id)),
    [groups],
  )

  return { groups, permissionIds, isLoading, error }
}
