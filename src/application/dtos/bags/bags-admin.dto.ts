export interface BagStatCardDto {
  count: number
  trend: number[]
}

export interface BagsStatsDto {
  totalBags: BagStatCardDto
  activeBags: BagStatCardDto
  inactiveBags: BagStatCardDto
  assignedBags: BagStatCardDto
  processingBags: BagStatCardDto
  missingBags: BagStatCardDto
  readyBags: BagStatCardDto
}

export interface BagCurrentOrderDto {
  id: string
  slug: string
  name: string
}

export interface BagCompanyDto {
  id: string
  name: string
  email?: string | null
  photo?: string | null
}

export interface BagListItemDto {
  id: string
  slug: string
  number: string
  notes?: string | null
  weight?: number | null
  isActive: boolean
  operationalStatus: number
  updatedAt?: string | null
  currentOrder?: BagCurrentOrderDto | null
  company?: BagCompanyDto | null
  /** @deprecated use `company` */
  companyName?: string | null
}

export interface BagsListDto {
  items: BagListItemDto[]
}

export interface BagDetailsCurrentOrderDto {
  id: string
  slug: string
  orderNumber: string
  companyName: string
  orderStatus: number
}

export interface BagAssignmentHistoryDto {
  orderId: string
  orderSlug: string
  orderNumber: string
  companyName: string
  assignedAt?: string | null
}

export interface BagDetailsDto {
  id: string
  slug: string
  number: string
  notes?: string | null
  weight?: number | null
  isActive: boolean
  operationalStatus: number
  createdAt?: string | null
  updatedAt?: string | null
  currentOrder?: BagDetailsCurrentOrderDto | null
  assignmentHistory: BagAssignmentHistoryDto[]
}

export interface BagsAdminAllParams {
  pageNumber?: number
  pageSize?: number
  keyword?: string
  isActive?: boolean
  operationalStatus?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface BagDropdownItemDto {
  id: string
  slug: string
  number: string
  status: number
}

export interface CreateBagRequestDto {
  number: string
  notes?: string | null
  weight?: number | null
}

export interface UpdateBagRequestDto {
  number: string
  notes?: string | null
  weight?: number | null
  isActive: boolean
  status: number
}
