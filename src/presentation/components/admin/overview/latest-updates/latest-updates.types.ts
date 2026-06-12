import type { LucideIcon } from 'lucide-react'

export type UpdatesFilter = 'today' | 'yesterday' | 'this-week' | 'custom'

export interface ActivityItem {
  id: string
  icon: LucideIcon
  iconClassName: string
  title: string
  description: string
  time: string
  occurredAt: Date
}
