export const OrderVolumePeriod = {
  LastWeek: 'last_week',
  Last14Days: 'last_14_days',
  LastMonth: 'last_month',
} as const

export type OrderVolumePeriod = (typeof OrderVolumePeriod)[keyof typeof OrderVolumePeriod]

export const ORDER_VOLUME_PERIODS = Object.values(OrderVolumePeriod)

export const ORDER_VOLUME_PERIOD_DAYS: Record<OrderVolumePeriod, number> = {
  [OrderVolumePeriod.LastWeek]: 7,
  [OrderVolumePeriod.Last14Days]: 14,
  [OrderVolumePeriod.LastMonth]: 30,
}
