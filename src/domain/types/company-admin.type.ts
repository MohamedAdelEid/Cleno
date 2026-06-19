import type { ManagedCompany } from '@/domain/entities'

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
