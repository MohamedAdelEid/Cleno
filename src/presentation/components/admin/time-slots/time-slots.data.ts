import type { ManagedTimeSlotStats } from '@/domain/entities'

export const buildTimeSlotStatTrend = (
  value: number,
  direction: 'positive' | 'negative' = 'positive',
) => {
  const baseline = Math.max(1, value)
  const multipliers =
    direction === 'positive'
      ? [0.48, 0.56, 0.62, 0.74, 0.82, 0.91, 1]
      : [1, 0.92, 0.86, 0.8, 0.72, 0.66, 0.6]

  return multipliers.map((multiplier) => Math.max(0, Math.round(baseline * multiplier)))
}

export const emptyManagedTimeSlotStats: ManagedTimeSlotStats = {
  totalSlots: 0,
  activeSlots: 0,
  inactiveSlots: 0,
}

export const filterTimeSlotsByStatus = <T extends { isActive: boolean }>(
  items: T[],
  statusFilter: 'all' | 'active' | 'inactive',
): T[] => {
  if (statusFilter === 'active') return items.filter((item) => item.isActive)
  if (statusFilter === 'inactive') return items.filter((item) => !item.isActive)
  return items
}
