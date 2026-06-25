import type { SegmentedBarSegment } from '@/presentation/components/admin/orders/overview/stat-segmented-bars'

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
