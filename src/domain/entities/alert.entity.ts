import type { AlertCategory } from '@/domain/enums'

export interface DashboardAlert {
  id: string
  category: AlertCategory
  orderId: string
  orderNumber: string
  description: string
  occurredAt: string
}
