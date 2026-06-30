export type LaundryBoardTab = 'Incoming' | 'InLaundry' | 'ReadyForDelivery'

export type LaundryUrgencyBadge = 'OVERDUE' | 'URGENT' | 'WARNING' | null

export interface LaundryBoardStatsDto {
  receivedToday: number
  processedToday: number
  dispatchedToday: number
  avgProcessingTimeMinutes: number
  bagsInLaundry: number
}

export interface LaundryOverdueOrderDto {
  slug: string
  orderNumber: string
}

export interface LaundryOverdueAlertDto {
  count: number
  orders: LaundryOverdueOrderDto[]
}

export interface LaundryBoardItemDto {
  id: string
  slug: string
  orderNumber: string
  companyName: string
  companyType: string
  branchName: string
  status: number
  isOverdue: boolean
  urgencyBadge: LaundryUrgencyBadge
  durationInLaundryMinutes: number | null
  totalItems: number
  bagCount: number
  pickupDate: string | null
  pickupTime: string
  deliverByDate: string | null
  deliverByTime: string
  note: LaundryBoardNoteDto | null
  hasOpenIncidents: boolean
  assignedDriverName: string | null
  items: LaundryBoardItemLineDto[]
  bags: LaundryBoardBagDto[]
}

export interface LaundryBoardItemLineDto {
  laundryItemId: string
  itemName: string
  category: number
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface LaundryBoardBagDto {
  bagId: string
  bagNumber: string
  stage: number
  bagStatus: number
  quantity: number
}

export interface LaundryBoardNoteUserDto {
  id: string
  fullName: string
  email: string
  photo: { path: string; url: string } | null
}

export interface LaundryBoardNoteDto {
  id: string
  content: string
  createdAt: string
  updatedAt: string | null
  authorName: string
  lastModifiedBy: LaundryBoardNoteUserDto | null
}

export interface LaundryBoardDataDto {
  items: LaundryBoardItemDto[]
}

export interface LaundryBoardParams {
  tab: LaundryBoardTab
  search?: string
  companyId?: string
  sortBy?: 'newest' | 'oldest'
}

export interface LaundryBulkStatusRequestDto {
  ids: string[]
  status: number
}

export interface LaundryBulkStatusFailureDto {
  id: string
  reason: string
}

export interface LaundryBulkStatusDataDto {
  succeeded: string[]
  failed: LaundryBulkStatusFailureDto[]
}

export interface CompanyDropdownItemDto {
  id: string
  slug: string
  name: string
}

export interface OrderNoteDto {
  id: string
  content: string
  createdAt: string
  updatedAt: string | null
  authorName: string
  lastModifiedBy: LaundryBoardNoteUserDto | null
}

export interface OrderNotesDataDto {
  orderNumber: string
  notes: OrderNoteDto[]
}

export interface OrderNoteCreateRequestDto {
  content: string
}

export interface OrderBagAssignmentDto {
  id: string
  laundryItemId: string
  itemName: string
  bagId: string
  bagNumber: string
  quantity: number
  stage: number
}

export interface OrderBagAvailableItemDto {
  laundryItemId: string
  itemName: string
  orderedQuantity: number
  assignedQuantity: number
  remainingQuantity: number
}

export interface OrderBagsDataDto {
  orderNumber: string
  companyName: string
  assignments: OrderBagAssignmentDto[]
  availableItems: OrderBagAvailableItemDto[]
}

export interface OrderBagCreateRequestDto {
  bagNumber: string
  laundryItemId: string
  quantity: number
  stage: number
}

export interface OrderBagUpdateRequestDto {
  quantity: number
}

export interface OrderIncidentListItemDto {
  slug: string
  type: number
  typeLabel: string
  title: string
  summary: string
  stage: number
  stageLabel: string
  createdAt: string
  replyCount: number
  isOpen: boolean
}

export interface OrderIncidentsDataDto {
  orderNumber: string
  companyName: string
  incidents: OrderIncidentListItemDto[]
}

export interface IncidentReplyDto {
  id: string
  message: string
  authorName: string
  createdAt: string
}

export interface IncidentDetailDto {
  slug: string
  type: number
  typeLabel: string
  stage: number
  stageLabel: string
  title: string
  description: string
  createdAt: string
  reporterName: string
  orderNumber: string
  companyName: string
  orderSlug: string
  replies: IncidentReplyDto[]
}

export interface IncidentReplyCreateRequestDto {
  message: string
}

export interface IncidentCreateRequestDto {
  type: number
  stage?: number
  title?: string
  description: string
}
