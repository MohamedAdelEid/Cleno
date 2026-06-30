import type { ManagedUserStats } from '@/domain/entities'

export const getManagedUserInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export const emptyManagedUserStats: ManagedUserStats = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  suspendedUsers: 0,
}
