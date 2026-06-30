export interface IncidentAdminOrderDto {
  slug: string
  number: string
  status: number
  statusLabel: string
}

export interface IncidentAdminCompanyDto {
  slug: string
  name: string
}

export interface IncidentAdminBranchDto {
  slug: string
  name: string
}

export interface IncidentAdminListItemDto {
  id: string
  slug: string
  type: number
  typeLabel: string
  stage: number
  stageLabel: string
  title: string
  description: string
  createdAt: string
  reporterName: string
  replyCount: number
  isOpen: boolean
  order: IncidentAdminOrderDto
  company: IncidentAdminCompanyDto
  branch: IncidentAdminBranchDto
}

export interface IncidentsAdminListDto {
  items: IncidentAdminListItemDto[]
}

export interface IncidentsAdminAllParams {
  pageNumber?: number
  pageSize?: number
  keyword?: string
  type?: number
  stage?: number
  isOpen?: boolean
  orderStatus?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface IncidentCreateRequestDto {
  type: number
  stage?: number
  title?: string
  description: string
}

export interface IncidentUpdateRequestDto {
  type: number
  stage: number
  title?: string
  description: string
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

export interface IncidentReplyUpdateRequestDto {
  message: string
}
