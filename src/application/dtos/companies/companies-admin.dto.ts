import type { CompanyAccountStatus } from '@/domain/enums'

export interface CompanyBranchDto {
  id: string
  name: string
  slug: string
  email: string
}

export interface CompanyAdminItemDto {
  id: string
  slug: string
  name: string
  email: string
  type: string
  photo: string | null
  mainResponsiblePerson: string
  phone: string
  status: number
  createdAt: string
  commercialRegistration: string
  branchesCount: number
  branches: CompanyBranchDto[]
  activeOrders: number
  completedOrders: number
  pendingInvoices: number
  outstanding: number
  isActive: boolean
}

export interface CompanySparklinePointDto {
  date: string
  value: number
}

export interface CompanyStatDto {
  key: string
  value: number
  sparkline: CompanySparklinePointDto[]
}

export interface CompaniesAdminAllDataDto {
  stats: CompanyStatDto[]
  items: CompanyAdminItemDto[]
}

export interface CompaniesAdminAllParams {
  keyword?: string
  pageNumber?: number
  pageSize?: number
  status?: CompanyAccountStatus
  isActive?: boolean
  sortBy?: string
  sortDirection?: string
  trendYear?: number
  trendMonth?: number
}

export interface CompanyIdsRequestDto {
  companyIds: string[]
}

export interface CompanyRejectRequestDto {
  companyIds: string[]
  reason: string
}

