import type { BagStatus, LaundryWorkflowStage, UrgencyLevel } from '@/domain/enums'

export interface LaundryCustomer {
  id: string
  name: string
  type: string
  logoUrl: string | null
  branchId: string
  branchName: string
}

export interface LaundryBag {
  id: string
  bagId: string
  status: BagStatus
  verified: boolean
}

export interface LaundryItem {
  id: string
  name: string
  quantity: number
}

export interface ItemBagAssignment {
  id: string
  itemId: string
  bagId: string
  quantity: number
}

export interface LaundryDriver {
  id: string
  fullName: string
  email: string
  avatarUrl: string | null
  phone?: string
}

export interface LaundryIncidentReply {
  id: string
  content: string
  createdAt: string
  author: string
}

export interface LaundryIncident {
  id: string
  slug?: string
  type: string
  content: string
  createdAt: string
  author: string
  stage: LaundryWorkflowStage
  replies: LaundryIncidentReply[]
  isOpen?: boolean
  replyCount?: number
}

export interface LaundryOrderNote {
  id: string
  content: string
  createdAt: string
  author: string
}

export interface LaundryOrder {
  id: string
  slug: string
  orderNumber: string
  customer: LaundryCustomer
  stage: LaundryWorkflowStage
  urgency: UrgencyLevel
  pickupBags: LaundryBag[]
  processingBags: LaundryBag[]
  bagAssignments: ItemBagAssignment[]
  items: LaundryItem[]
  itemCount: number
  pickupTime: string
  deliverBy: string
  inLaundrySince: string | null
  driver: LaundryDriver | null
  incidents: LaundryIncident[]
  notes: LaundryOrderNote[]
  slaDeadline: string | null
  hasOpenIncidents?: boolean
}

export interface LaundryStats {
  receivedToday: number
  processedToday: number
  dispatchedToday: number
  avgProcessingTime: string
  bagsInLaundry: number
}
