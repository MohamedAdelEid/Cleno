import type { FileReferenceDto } from '@/application/dtos/file-upload/file-upload.dto'

export interface CompanyProfileStatsDto {
  branchesCount: number
  activeOrders: number
  completedOrders: number
  ordersThisMonth: number
  outstandingBalance: number
  totalRevenue: number
  pendingInvoices: number
  overdueInvoices: number
}

export interface CompanyProfileBusinessDto {
  businessName: string
  businessType: string
  commercialRegistration: string | null
}

export interface CompanyProfileContactDto {
  mainContactPerson: string
  phone: string
  email: string
}

export interface CompanyProfileLocationDto {
  address: string
  googleMapLink: string | null
}

export interface CompanyProfileStatusDto {
  isActive: boolean
  registrationDate: string
}

export interface CompanyProfileCompanyInfoDto {
  business: CompanyProfileBusinessDto
  contact: CompanyProfileContactDto
  location: CompanyProfileLocationDto
  status: CompanyProfileStatusDto
}

export interface CompanyProfileInvoiceCountsDto {
  total: number
  paid: number
  pending: number
  overdue: number
}

export interface CompanyProfileFinancialTotalsDto {
  totalBilled: number
  totalPaid: number
  outstanding: number
  collectionRate: number
}

export interface CompanyProfileRecentInvoiceDto {
  id: string
  invoiceNumber: string
  orderId: string
  orderNumber: string
  dueDate: string
  amount: number
  paymentStatus: number
}

export interface CompanyProfileFinancialSummaryDto {
  invoiceCounts: CompanyProfileInvoiceCountsDto
  totals: CompanyProfileFinancialTotalsDto
  recentInvoices: CompanyProfileRecentInvoiceDto[]
}

export interface CompanyProfileRecentOrderDto {
  id: string
  slug: string
  orderNumber: string
  branchName: string
  status: number
  itemsCount: number
  pickupAt: string
}

export interface CompanyProfileActivityDto {
  id: string
  type: string
  title: string
  description: string
  performedBy: string
  entityType: number
  entityId: string
  occurredAt: string
}

export interface CompanyProfileDto {
  id: string
  slug: string
  name: string
  type: string
  photo: string | FileReferenceDto | null
  isActive: boolean
  status: number
  alertsCount: number
  stats: CompanyProfileStatsDto
  companyInfo: CompanyProfileCompanyInfoDto
  financialSummary: CompanyProfileFinancialSummaryDto
  recentOrders: CompanyProfileRecentOrderDto[]
  recentActivity: CompanyProfileActivityDto[]
}

export interface CompanyProfileOrderDto {
  id: string
  slug: string
  orderNumber: string
  branchName: string
  status: number
  itemsCount: number
  totalAmount: number
  paymentStatus: number
  pickupAt: string
  createdAt: string
}

export interface CompanyProfileInvoiceDto {
  id: string
  invoiceNumber: string
  orderId: string
  orderNumber: string
  branchName: string
  amount: number
  paymentStatus: number
  dueDate: string
  orderStatus: number
  createdAt: string
}

export interface CompanyProfileBranchDto {
  id: string
  slug: string
  name: string
  email: string
  phone: string
  address: string
  isActive: boolean
  activeOrders: number
  createdAt: string
}

export interface CompanyProfilePaginatedDto<T> {
  items: T[]
}

export interface CompanyProfileOrdersParams {
  pageNumber?: number
  pageSize?: number
  status?: number
  sortBy?: 'createdAt' | 'orderNumber' | 'status' | 'pickupAt'
  sortDirection?: 'asc' | 'desc'
}

export interface CompanyProfileInvoicesParams {
  pageNumber?: number
  pageSize?: number
  paymentStatus?: number
}

export interface CompanyProfileListParams {
  pageNumber?: number
  pageSize?: number
}
