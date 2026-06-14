import { format, subMonths, subQuarters, subWeeks } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'

import { OrderAnalysisInterval } from '@/domain/enums'
import type { OrderAnalysisPoint, OrderAnalysisSummary } from '@/domain/types'

const VOLUME_WAVE = [82, 88, 95, 90, 86, 92, 88, 94, 91, 87, 93, 89]

const INTERVAL_CONFIG: Record<
  OrderAnalysisInterval,
  { count: number; labelFor: (offset: number, isRtl: boolean) => string }
> = {
  [OrderAnalysisInterval.Weekly]: {
    count: 8,
    labelFor: (offset, isRtl) =>
      format(subWeeks(new Date(), offset), 'd MMM', { locale: isRtl ? arSA : enUS }),
  },
  [OrderAnalysisInterval.Monthly]: {
    count: 9,
    labelFor: (offset, isRtl) =>
      format(subMonths(new Date(), offset), 'MMM', { locale: isRtl ? arSA : enUS }),
  },
  [OrderAnalysisInterval.Quarterly]: {
    count: 6,
    labelFor: (offset, isRtl) =>
      format(subQuarters(new Date(), offset), 'QQQ', { locale: isRtl ? arSA : enUS }),
  },
}

const niceCeil = (value: number) => Math.ceil((value * 1.12) / 10) * 10

export const getOrderAnalysisSummary = (
  interval: OrderAnalysisInterval,
  isRtl: boolean,
): OrderAnalysisSummary => {
  const { count, labelFor } = INTERVAL_CONFIG[interval]

  const points: OrderAnalysisPoint[] = Array.from({ length: count }, (_, index) => {
    const volume = VOLUME_WAVE[index % VOLUME_WAVE.length]!
    const fulfillmentRatio = 0.86 + Math.sin(index / 1.8) * 0.05
    const delivered = Math.round(volume * fulfillmentRatio)
    const cancelled = Math.max(volume - delivered, 4 + (index % 3))

    return {
      label: labelFor(count - 1 - index, isRtl),
      delivered,
      cancelled,
    }
  })

  const totalOrders = points.reduce((sum, point) => sum + point.delivered + point.cancelled, 0)
  const totalDelivered = points.reduce((sum, point) => sum + point.delivered, 0)
  const maxVolume = Math.max(...points.map((point) => point.delivered + point.cancelled))

  return {
    interval,
    totalOrders,
    totalDelivered,
    fulfillmentRate: totalOrders === 0 ? 0 : (totalDelivered / totalOrders) * 100,
    axisMax: niceCeil(maxVolume),
    points,
  }
}
