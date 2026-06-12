import { useMemo } from 'react'
import { filterNavigation, navigationConfig } from '@/presentation/navigation'
import { usePermissions } from './use-permissions'

export const useFilteredNavigation = () => {
  const { hasAnyPermission, permissionsLoaded } = usePermissions()

  return useMemo(
    () => filterNavigation(navigationConfig, hasAnyPermission, permissionsLoaded),
    [hasAnyPermission, permissionsLoaded],
  )
}
