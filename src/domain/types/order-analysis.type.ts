import type { OrderAnalysisInterval } from '@/domain/enums'

export interface OrderAnalysisPoint {
  label: string
  delivered: number
  cancelled: number
}

export interface OrderAnalysisSummary {
  interval: OrderAnalysisInterval
  totalOrders: number
  totalDelivered: number
  fulfillmentRate: number
  axisMax: number
  points: OrderAnalysisPoint[]
}
