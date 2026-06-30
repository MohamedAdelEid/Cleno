import type { CompanyAccountStatus } from '@/domain/enums'
import type { FileReferenceDto } from '@/application/dtos/file-upload/file-upload.dto'

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
  photo: string | FileReferenceDto | null
  mainResponsiblePerson: string
  phone: string
  status: number
  createdAt: string
  commercialRegistration: string | FileReferenceDto | null
  branchesCount: number
  branches: CompanyBranchDto[]
  activeOrders: number
  completedOrders: number
  pendingInvoices: number
  outstanding: number
  isActive: boolean
}

export interface CompanyForEditDto {
  id: string
  slug: string
  businessName: string
  mainContactPerson: string
  phone: string
  photo: string | FileReferenceDto | null
  email: string
  type: string
  address: string
  googleMapLink: string
  commercialRegistration: string | FileReferenceDto | null
  parentCompanyId: string | null
  isActive?: boolean
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
