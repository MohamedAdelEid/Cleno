import type { ManagedDriverStats } from '@/domain/entities'

export const getDriverInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export const buildDriverStatTrend = (
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

export const emptyManagedDriverStats: ManagedDriverStats = {
  totalDrivers: 0,
  availableDrivers: 0,
  unavailableDrivers: 0,
}
