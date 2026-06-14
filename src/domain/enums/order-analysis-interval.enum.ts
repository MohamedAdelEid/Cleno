export const OrderAnalysisInterval = {
  Weekly: 'weekly',
  Monthly: 'monthly',
  Quarterly: 'quarterly',
} as const

export type OrderAnalysisInterval =
  (typeof OrderAnalysisInterval)[keyof typeof OrderAnalysisInterval]

export const ORDER_ANALYSIS_INTERVALS = Object.values(OrderAnalysisInterval)
