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
  quantity: number
}

export interface LaundryItem {
  id: string
  name: string
  quantity: number
  orderedQuantity?: number
  assignedQuantity?: number
  remainingQuantity?: number
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
  slug: string
  type: number
  typeLabel: string
  title: string
  content: string
  stageLabel: string
  createdAt: string
  author: string
  stage: LaundryWorkflowStage
  replies: LaundryIncidentReply[]
  isOpen: boolean
  replyCount: number
  orderNumber?: string
  companyName?: string
  orderSlug?: string
}

export interface LaundryOrderNoteUser {
  id: string
  fullName: string
  email: string
  avatarUrl: string | null
}

export interface LaundryOrderNote {
  id: string
  content: string
  createdAt: string
  updatedAt: string | null
  author: string
  lastModifiedBy: LaundryOrderNoteUser | null
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
  pickupDate: string | null
  pickupTime: string
  deliverByDate: string | null
  deliverBy: string
  inLaundrySince: string | null
  driver: LaundryDriver | null
  incidents: LaundryIncident[]
  note: LaundryOrderNote | null
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
