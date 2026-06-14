import { matchPath } from 'react-router-dom'

import type { Permission } from '@/domain/types'
import { ROUTES } from '@/presentation/routes/routes.constants'
import type { NavigationGroup, NavigationItem } from './navigation.types'

const breadcrumbRouteOverrides = [
  { path: ROUTES.ROLES.NEW, labelKey: 'addRole' },
  { path: ROUTES.ROLES.EDIT, labelKey: 'editRole' },
  { path: ROUTES.COMPANIES.NEW, labelKey: 'addCompany' },
  { path: ROUTES.COMPANIES.EDIT, labelKey: 'editCompany' },
] as const

export const findBreadcrumbRouteOverride = (pathname: string) => {
  for (const route of breadcrumbRouteOverrides) {
    if (matchPath({ path: route.path, end: true }, pathname)) {
      return route
    }
  }

  return null
}

const canAccessItem = (
  item: NavigationItem,
  hasAnyPermission: (permissions: Permission[]) => boolean,
  permissionsLoaded: boolean,
): boolean => {
  if (!item.permissions?.length) return true
  if (!permissionsLoaded) return true
  return hasAnyPermission(item.permissions)
}

const filterNavItem = (
  item: NavigationItem,
  hasAnyPermission: (permissions: Permission[]) => boolean,
  permissionsLoaded: boolean,
): NavigationItem | null => {
  if (item.children?.length) {
    const children = item.children
      .map((child) => filterNavItem(child, hasAnyPermission, permissionsLoaded))
      .filter((child): child is NavigationItem => child !== null)

    if (!children.length) return null

    return { ...item, children }
  }

  if (!item.href) return null
  if (!canAccessItem(item, hasAnyPermission, permissionsLoaded)) return null

  return item
}

export const filterNavigation = (
  groups: NavigationGroup[],
  hasAnyPermission: (permissions: Permission[]) => boolean,
  permissionsLoaded: boolean,
): NavigationGroup[] =>
  groups
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => filterNavItem(item, hasAnyPermission, permissionsLoaded))
        .filter((item): item is NavigationItem => item !== null),
    }))
    .filter((group) => group.items.length > 0)

export const isRouteActive = (pathname: string, href?: string): boolean => {
  if (!href) return false
  const normalizedPath = normalizeNavPath(pathname)
  const normalizedHref = normalizeNavPath(href)
  return normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`)
}

export const normalizeNavPath = (path: string): string => path.replace(/\/+$/, '') || '/'

export const collectNavHrefs = (groups: NavigationGroup[]): string[] => {
  const hrefs: string[] = []

  const walk = (items: NavigationItem[]) => {
    for (const item of items) {
      if (item.href) hrefs.push(normalizeNavPath(item.href))
      if (item.children?.length) walk(item.children)
    }
  }

  for (const group of groups) walk(group.items)

  return hrefs
}

export const resolveActiveNavHref = (pathname: string, hrefs: string[]): string | null => {
  const normalizedPath = normalizeNavPath(pathname)
  const matches = hrefs.filter(
    (href) => normalizedPath === href || normalizedPath.startsWith(`${href}/`),
  )

  if (!matches.length) return null

  return matches.reduce((longest, current) => (current.length > longest.length ? current : longest))
}

export const isSidebarRouteActive = (
  pathname: string,
  href: string | undefined,
  hrefs: string[],
  activeHref?: string | null,
): boolean => {
  if (!href) return false
  const resolved = activeHref ?? resolveActiveNavHref(pathname, hrefs)
  return resolved === normalizeNavPath(href)
}

export const isNavItemActive = (
  pathname: string,
  item: NavigationItem,
  hrefs?: string[],
): boolean => {
  const allHrefs = hrefs ?? []
  const activeHref = allHrefs.length ? resolveActiveNavHref(pathname, allHrefs) : null

  if (item.href && activeHref && normalizeNavPath(item.href) === activeHref) return true

  return item.children?.some((child) => isNavItemActive(pathname, child, allHrefs)) ?? false
}

export const countNavItems = (items: NavigationItem[]): number =>
  items.reduce((total, item) => total + 1 + (item.children ? countNavItems(item.children) : 0), 0)

export const findNavItemByPath = (
  groups: NavigationGroup[],
  pathname: string,
): { item: NavigationItem; parent?: NavigationItem; group?: NavigationGroup } | null => {
  const hrefs = collectNavHrefs(groups)
  const activeHref = resolveActiveNavHref(pathname, hrefs)
  if (!activeHref) return null

  const findInItems = (
    items: NavigationItem[],
    parent?: NavigationItem,
  ): { item: NavigationItem; parent?: NavigationItem } | null => {
    for (const item of items) {
      if (item.children?.length) {
        const nested = findInItems(item.children, item)
        if (nested) return nested
      }

      if (item.href && normalizeNavPath(item.href) === activeHref) {
        return { item, parent }
      }
    }

    return null
  }

  for (const group of groups) {
    const match = findInItems(group.items)
    if (match) return { ...match, group }
  }

  return null
}
