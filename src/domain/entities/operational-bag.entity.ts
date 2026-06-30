import type { OperationalBagStatus, OperationalBagSystemStatus } from '@/domain/enums'

export interface OperationalBagCompany {
  id: string
  name: string
  email: string | null
  photo: string | null
}

export interface OperationalBag {
  id: string
  slug: string
  bagId: string
  notes: string
  weight: number | null
  systemStatus: OperationalBagSystemStatus
  operationalStatus: OperationalBagStatus
  currentOrderId: string | null
  currentOrderSlug: string | null
  currentOrderNumber: string | null
  company: OperationalBagCompany | null
  createdAt: string | null
  updatedAt: string
  assignmentHistory: OperationalBagAssignmentHistory[]
}

export interface OperationalBagAssignmentHistory {
  orderId: string
  orderSlug: string
  orderNumber: string
  companyName: string
  assignedAt: string | null
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

export type OperationalBagStatTrends = Record<keyof OperationalBagStats, number[]>
