import type { OrderVolumePeriod } from '@/domain/enums'

export interface DailyOrderVolume {
  date: string
  label: string
  dateLabel: string
  orders: number
}

export interface OrderVolumeSummary {
  period: OrderVolumePeriod
  total: number
  average: number
  changePercent: number
  peakDay: {
    label: string
    orders: number
  }
  data: DailyOrderVolume[]
}
