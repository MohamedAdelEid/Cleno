import { format, subDays } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'

import {
  ORDER_VOLUME_PERIOD_DAYS,
  OrderVolumePeriod,
} from '@/domain/enums'
import type { DailyOrderVolume, OrderVolumeSummary } from '@/domain/types'

const BASE_PATTERN = [
  42, 48, 58, 64, 52, 72, 68, 46, 55, 58, 64, 62, 48, 66,
  40, 52, 60, 67, 51, 74, 62, 44, 56, 58, 62, 64, 49, 68, 53, 46,
]

const buildDailyData = (days: number, isRtl: boolean): DailyOrderVolume[] => {
  const locale = isRtl ? arSA : enUS

  return Array.from({ length: days }, (_, index) => {
    const date = subDays(new Date(), days - 1 - index)
    const patternIndex = (index + days) % BASE_PATTERN.length
    const wave = Math.sin(index / 2.4) * 4
    const orders = Math.round(BASE_PATTERN[patternIndex]! + wave)

    return {
      date: date.toISOString(),
      label: format(date, 'EEE', { locale }),
      dateLabel: format(date, 'EEE, d MMM yyyy', { locale }),
      orders,
    }
  })
}

const summarize = (
  period: OrderVolumePeriod,
  current: DailyOrderVolume[],
  previous: DailyOrderVolume[],
): OrderVolumeSummary => {
  const total = current.reduce((sum, item) => sum + item.orders, 0)
  const previousTotal = previous.reduce((sum, item) => sum + item.orders, 0)
  const changePercent =
    previousTotal === 0 ? 0 : ((total - previousTotal) / previousTotal) * 100

  const peakDay = current.reduce(
    (peak, item) => (item.orders > peak.orders ? item : peak),
    current[0]!,
  )

  return {
    period,
    total,
    average: Math.round(total / current.length),
    changePercent,
    peakDay: {
      label: peakDay.label,
      orders: peakDay.orders,
    },
    data: current,
  }
}

export const getOrderVolumeSummary = (
  period: OrderVolumePeriod,
  isRtl: boolean,
): OrderVolumeSummary => {
  const days = ORDER_VOLUME_PERIOD_DAYS[period]
  const current = buildDailyData(days, isRtl)
  const previous = buildDailyData(days, isRtl).map((item, index) => ({
    ...item,
    orders: Math.round(item.orders * (0.9 + (index % 3) * 0.03)),
  }))

  return summarize(period, current, previous)
}
