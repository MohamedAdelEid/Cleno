import type { CompanyAccountStatus } from '@/domain/enums'

export interface CompanyResponsible {
  id: string
  fullName: string
  email: string
  phone: string
}

export interface ManagedCompany {
  id: string
  name: string
  type: string
  email: string
  logoUrl: string | null
  responsible: CompanyResponsible
  phone: string
  branchesCount: number
  activeOrders: number
  completedOrders: number
  pendingInvoices: number
  outstandingBalance: number
  status: CompanyAccountStatus
  isActive: boolean
  createdAt: string
}
