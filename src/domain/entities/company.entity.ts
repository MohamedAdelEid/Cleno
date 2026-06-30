import type { CompanyAccountStatus } from '@/domain/enums'
import type { RemoteFileReference } from '@/domain/types/company-admin.type'

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
  logoPath: string | null
  responsible: CompanyResponsible
  phone: string
  commercialRegistration: string | null
  commercialRegistrationFile: RemoteFileReference | null
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
