import type { LucideIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import { useFilteredNavigation } from '@/presentation/hooks/use-filtered-navigation'
import { useTranslation } from '@/presentation/hooks/use-translation'
import {
  findBreadcrumbRouteOverride,
  findNavItemByPath,
  normalizeNavPath,
} from '@/presentation/navigation/navigation.helpers'
import { ROUTES } from '@/presentation/routes/routes.constants'

export interface BreadcrumbEntry {
  id: string
  label: string
  href?: string
  icon?: LucideIcon
}

export const useBreadcrumbs = (): BreadcrumbEntry[] => {
  const { pathname } = useLocation()
  const { t } = useTranslation('navigation')
  const navigation = useFilteredNavigation()

  return useMemo(() => {
    const routeOverride = findBreadcrumbRouteOverride(pathname)
    const match = findNavItemByPath(navigation, pathname)
    const normalizedPath = normalizeNavPath(pathname)

    if (!match && !routeOverride) {
      return [{ id: 'nav:dashboard', label: t('dashboard'), href: ROUTES.DASHBOARD.HOME }]
    }

    const crumbs: BreadcrumbEntry[] = []
    const { item, parent } = match ?? {}

    if (parent?.href) {
      const parentHref = normalizeNavPath(parent.href)
      crumbs.push({
        id: `nav:${parentHref}`,
        label: t(parent.titleKey),
        href: parentHref !== normalizedPath ? parent.href : undefined,
        icon: parent.icon,
      })
    }

    if (item?.href) {
      const itemHref = normalizeNavPath(item.href)
      const isExactNavMatch = itemHref === normalizedPath

      crumbs.push({
        id: `nav:${itemHref}`,
        label: t(item.titleKey),
        href:
          !isExactNavMatch && !routeOverride
            ? item.href
            : routeOverride
              ? item.href
              : undefined,
        icon: crumbs.length === 0 ? item.icon : undefined,
      })
    }

    if (routeOverride) {
      crumbs.push({
        id: `route:${routeOverride.labelKey}`,
        label: t(routeOverride.labelKey),
      })
    }

    if (!crumbs.length) {
      return [{ id: 'nav:dashboard', label: t('dashboard'), href: ROUTES.DASHBOARD.HOME }]
    }

    return crumbs
  }, [navigation, pathname, t])
}
