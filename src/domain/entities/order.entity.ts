import type { OrderStatus } from '@/domain/enums'

export interface OrderDriver {
  id: string
  fullName: string
  email: string
  avatarUrl: string | null
}

export interface OrderCompany {
  id: string
  name: string
  email: string
  type: string
  logoUrl: string | null
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

export interface ManagedOrder {
  id: string
  orderNumber: string
  company: OrderCompany
  branchId: string
  branchName: string
  pickupAt: string
  expectedDeliveryAt: string
  bags: string[]
  driver: OrderDriver | null
  status: OrderStatus
}
