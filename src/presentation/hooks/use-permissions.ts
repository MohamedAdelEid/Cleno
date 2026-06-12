import { useCallback } from 'react'
import type { Permission } from '@/domain/types'
import { useAuthStore } from '@/presentation/store'

export const usePermissions = () => {
  const permissions = useAuthStore((state) => state.permissions)
  const permissionsLoaded = permissions.length > 0

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!permissionsLoaded) return true
      return permissions.includes(permission)
    },
    [permissions, permissionsLoaded],
  )

  const hasAnyPermission = useCallback(
    (required: Permission[]): boolean => {
      if (!required.length) return true
      if (!permissionsLoaded) return true
      return required.some((permission) => permissions.includes(permission))
    },
    [permissions, permissionsLoaded],
  )

  return {
    permissions,
    permissionsLoaded,
    hasPermission,
    hasAnyPermission,
  }
}
