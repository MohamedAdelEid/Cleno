import type { CompanyAccountStatus } from '@/domain/enums'

export interface CompanyBranch {
  id: string
  name: string
  slug: string
  email: string
}

export interface CompanyResponsible {
  id: string
  fullName: string
  email: string
  phone: string
}

export interface ManagedCompany {
  id: string
  slug: string
  name: string
  type: string
  email: string
  logoUrl: string | null
  responsible: CompanyResponsible
  phone: string
  commercialRegistration: string
  branchesCount: number
  branches: CompanyBranch[]
  activeOrders: number
  completedOrders: number
  pendingInvoices: number
  outstandingBalance: number
  status: CompanyAccountStatus
  isActive: boolean
  createdAt: string
}
