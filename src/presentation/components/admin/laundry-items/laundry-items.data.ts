import type { ManagedLaundryItemStats } from '@/domain/entities'

export const buildLaundryItemStatTrend = (
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

export const emptyManagedLaundryItemStats: ManagedLaundryItemStats = {
  totalItems: 0,
  activeItems: 0,
  inactiveItems: 0,
}

export const formatLaundryItemPrice = (price: number, locale?: string): string =>
  new Intl.NumberFormat(locale ?? 'en', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
