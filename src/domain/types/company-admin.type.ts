import type { ManagedCompany } from '@/domain/entities'

export interface RemoteFileReference {
  path: string | null
  url: string | null
}

export type CompanyStatKey =
  | 'totalCompanies'
  | 'activeCompanies'
  | 'inactiveCompanies'
  | 'totalBranches'

export interface CompanySparklinePoint {
  date: string
  value: number
}

export interface CompanyStat {
  key: CompanyStatKey
  value: number
  sparkline: CompanySparklinePoint[]
}

export interface CompaniesAdminList {
  stats: CompanyStat[]
  items: ManagedCompany[]
}

export interface CompanyEditDetails {
  id: string
  slug: string
  businessName: string
  mainContactPerson: string
  phone: string
  photo: RemoteFileReference | null
  email: string
  type: string
  address: string
  googleMapLink: string
  commercialRegistration: RemoteFileReference | null
  parentCompanyId: string | null
  isActive: boolean
}
