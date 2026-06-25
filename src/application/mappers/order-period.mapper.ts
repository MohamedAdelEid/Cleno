import { OrderAnalysisInterval } from '@/domain/enums'

export const DashboardPeriod = {
  Weekly: 'Weekly',
  Monthly: 'Monthly',
  Quarterly: 'Quarterly',
} as const

export type DashboardPeriod = (typeof DashboardPeriod)[keyof typeof DashboardPeriod]

export const orderAnalysisIntervalToDashboardPeriod = (
  interval: OrderAnalysisInterval,
): DashboardPeriod => {
  switch (interval) {
    case OrderAnalysisInterval.Weekly:
      return DashboardPeriod.Weekly
    case OrderAnalysisInterval.Quarterly:
      return DashboardPeriod.Quarterly
    case OrderAnalysisInterval.Monthly:
    default:
      return DashboardPeriod.Monthly
  }
}
