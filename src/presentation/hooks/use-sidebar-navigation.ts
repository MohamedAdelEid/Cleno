import { useMemo } from 'react'

import { useFilteredNavigation } from './use-filtered-navigation'

export const useSidebarNavigation = () => {
  const navigation = useFilteredNavigation()

  return useMemo(
    () => ({
      main: navigation.filter((group) => group.placement !== 'footer'),
      footer: navigation.filter((group) => group.placement === 'footer'),
    }),
    [navigation],
  )
}
