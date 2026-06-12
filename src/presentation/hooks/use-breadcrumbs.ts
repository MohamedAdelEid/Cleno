import type { LucideIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useFilteredNavigation } from '@/presentation/hooks/use-filtered-navigation'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { findNavItemByPath } from '@/presentation/navigation/navigation.helpers'

export interface BreadcrumbEntry {
  label: string
  href?: string
  icon?: LucideIcon
}

export const useBreadcrumbs = (): BreadcrumbEntry[] => {
  const { pathname } = useLocation()
  const { t } = useTranslation('navigation')
  const navigation = useFilteredNavigation()

  return useMemo(() => {
    const match = findNavItemByPath(navigation, pathname)

    if (!match) {
      return [{ label: t('dashboard') }]
    }

    const { item, parent, group } = match
    const crumbs: BreadcrumbEntry[] = []

    if (group?.titleKey) {
      const groupLanding = group.items[0]?.href ?? group.items[0]?.children?.[0]?.href
      crumbs.push({
        label: t(group.titleKey),
        href: groupLanding && groupLanding !== pathname ? groupLanding : undefined,
        icon: parent?.icon ?? item.icon,
      })
    }

    if (parent) {
      crumbs.push({
        label: t(parent.titleKey),
        icon: parent.icon,
      })
    }

    crumbs.push({ label: t(item.titleKey) })
    return crumbs
  }, [navigation, pathname, t])
}
