import type { ManagedIncidentStatTrends, ManagedIncidentStats } from '@/domain/entities'

export const emptyManagedIncidentStats: ManagedIncidentStats = {
  total: 0,
  open: 0,
  closed: 0,
}

export const emptyManagedIncidentStatTrends: ManagedIncidentStatTrends = {
  total: [],
  open: [],
  closed: [],
}

export const buildIncidentStatTrend = (value: number, trend: 'positive' | 'negative' = 'positive') => {
  const base = Math.max(value, 1)
  const factor = trend === 'positive' ? 1 : -1
  return [base * 0.7, base * 0.82, base * 0.9, base * 0.96, base].map(
    (point) => Math.max(0, Math.round(point + factor * 0.5)),
  )
}

export const buildIncidentStatTrends = (stats: ManagedIncidentStats): ManagedIncidentStatTrends => ({
  total: buildIncidentStatTrend(stats.total),
  open: buildIncidentStatTrend(stats.open, 'negative'),
  closed: buildIncidentStatTrend(stats.closed),
})
