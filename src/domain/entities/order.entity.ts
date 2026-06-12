import type { OrderStatus } from '@/domain/enums'

export interface OrderDriver {
  id: string
  fullName: string
  avatarUrl: string | null
}

export interface RecentOrder {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  branchId: string
  branchName: string
  pickupAt: string
  expectedDeliveryAt: string
  bags: string[]
  driver: OrderDriver | null
  status: OrderStatus
}
