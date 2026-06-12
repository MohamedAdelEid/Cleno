import type { LucideIcon } from 'lucide-react'
import type { Permission } from '@/domain/types'

export interface NavigationItem {
  titleKey: string
  href?: string
  icon: LucideIcon
  permissions?: Permission[]
  children?: NavigationItem[]
}

export type NavigationPlacement = 'main' | 'footer'

export interface NavigationGroup {
  titleKey?: string
  placement?: NavigationPlacement
  items: NavigationItem[]
}
