import type { SegmentedBarSegment } from './overview/stat-segmented-bars'

export interface OrdersOverviewStats {
  totalOrders: number
  totalTrendPercent: number
  totalSparkline: number[]
  totalSparklinePeakLabel: string
  activeOrders: number
  activeTrendPercent: number
  activeSegmentedBars: SegmentedBarSegment[]
  activeHighlightIndex: number
  deliveredOnTime: number
  deliveredDelayed: number
}

export const ordersOverviewStats: OrdersOverviewStats = {
  totalOrders: 3484,
  totalTrendPercent: 1.1,
  totalSparkline: [2980, 3050, 3010, 3140, 3090, 3220, 3180, 3310, 3360, 3484],
  totalSparklinePeakLabel: '+504',
  activeOrders: 412,
  activeTrendPercent: -3.3,
  activeSegmentedBars: [
    { top: 0.42, bottom: 0.38, value: 38, label: 'Mon' },
    { top: 0.48, bottom: 0.32, value: 45, label: 'Tue' },
    { top: 0.55, bottom: 0.28, value: 52, label: 'Wed' },
    { top: 0.38, bottom: 0.45, value: 41, label: 'Thu' },
    { top: 0.44, bottom: 0.36, value: 48, label: 'Fri' },
  ],
  activeHighlightIndex: 2,
  deliveredOnTime: 1186,
  deliveredDelayed: 132,
}
