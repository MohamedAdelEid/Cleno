import type { ManagedCompany } from '@/domain/entities'
import { CompanyAccountStatus } from '@/domain/enums'

export const canApproveCompany = (company: ManagedCompany) =>
  company.status === CompanyAccountStatus.PendingAdminApproval

export const canRejectCompany = (company: ManagedCompany) =>
  company.status === CompanyAccountStatus.PendingAdminApproval

export const canActivateCompany = (company: ManagedCompany) =>
  company.status === CompanyAccountStatus.Approved && !company.isActive

export const canDeactivateCompany = (company: ManagedCompany) =>
  company.status === CompanyAccountStatus.Approved && company.isActive

export const getBulkApproveIds = (companies: ManagedCompany[], selectedIds: string[]) =>
  companies.filter((company) => selectedIds.includes(company.id) && canApproveCompany(company)).map(
    (company) => company.id,
  )

export const getBulkRejectIds = (companies: ManagedCompany[], selectedIds: string[]) =>
  companies.filter((company) => selectedIds.includes(company.id) && canRejectCompany(company)).map(
    (company) => company.id,
  )

export const getBulkActivateIds = (companies: ManagedCompany[], selectedIds: string[]) =>
  companies
    .filter((company) => selectedIds.includes(company.id) && canActivateCompany(company))
    .map((company) => company.id)

export const getBulkDeactivateIds = (companies: ManagedCompany[], selectedIds: string[]) =>
  companies
    .filter((company) => selectedIds.includes(company.id) && canDeactivateCompany(company))
    .map((company) => company.id)
