import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useFilteredNavigation } from '@/presentation/hooks/use-filtered-navigation'
import type { NavigationItem } from '@/presentation/navigation'
import {
  collectNavHrefs,
  isNavItemActive,
  isSidebarRouteActive,
  resolveActiveNavHref,
} from '@/presentation/navigation/navigation.helpers'

export const useActiveNavHref = (): string | null => {
  const { pathname } = useLocation()
  const navigation = useFilteredNavigation()

  return useMemo(() => {
    const hrefs = collectNavHrefs(navigation)
    return resolveActiveNavHref(pathname, hrefs)
  }, [navigation, pathname])
}

export const useIsSidebarRouteActive = (href?: string): boolean => {
  const { pathname } = useLocation()
  const navigation = useFilteredNavigation()
  const activeHref = useActiveNavHref()

  return useMemo(() => {
    const hrefs = collectNavHrefs(navigation)
    return isSidebarRouteActive(pathname, href, hrefs, activeHref)
  }, [activeHref, href, navigation, pathname])
}

export const useIsNavItemActive = (item: NavigationItem): boolean => {
  const { pathname } = useLocation()
  const navigation = useFilteredNavigation()

  return useMemo(() => {
    const hrefs = collectNavHrefs(navigation)
    return isNavItemActive(pathname, item, hrefs)
  }, [item, navigation, pathname])
}
