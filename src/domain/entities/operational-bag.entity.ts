import type { OperationalBagStatus, OperationalBagSystemStatus } from '@/domain/enums'

export interface OperationalBag {
  id: string
  bagId: string
  systemStatus: OperationalBagSystemStatus
  operationalStatus: OperationalBagStatus
  currentOrderId: string | null
  currentOrderNumber: string | null
  customerId: string | null
  customerName: string | null
  customerSlug: string | null
  updatedAt: string
}

export interface OperationalBagStats {
  totalBags: number
  activeBags: number
  inactiveBags: number
  assignedBags: number
  processingBags: number
  missingBags: number
  readyBags: number
}
