import type { CompaniesAdminAllDataDto, CompanyAdminItemDto } from '@/application/dtos/companies/companies-admin.dto'
import type { CompanyCreateRequestDto } from '@/application/dtos/companies/create-company.dto'
import type { ManagedCompany } from '@/domain/entities'
import type { CompanyFormValues } from '@/domain/schemas'
import { CompanyAccountStatus } from '@/domain/enums'
import type { CompaniesAdminList, CompanyStat, CompanyStatKey, UploadedFile } from '@/domain/types'

const COMPANY_STAT_KEYS = new Set<CompanyStatKey>([
  'totalCompanies',
  'activeCompanies',
  'inactiveCompanies',
  'totalBranches',
])

const isCompanyStatKey = (key: string): key is CompanyStatKey =>
  COMPANY_STAT_KEYS.has(key as CompanyStatKey)

const parseStatus = (status: number): CompanyAccountStatus => {
  const values = Object.values(CompanyAccountStatus) as CompanyAccountStatus[]
  if (values.includes(status as CompanyAccountStatus)) {
    return status as CompanyAccountStatus
  }

  return CompanyAccountStatus.PendingEmailVerification
}

export const companyAdapter = {
  toManagedCompany(dto: CompanyAdminItemDto): ManagedCompany {
    return {
      id: dto.id,
      slug: dto.slug,
      name: dto.name,
      type: dto.type,
      email: dto.email,
      logoUrl: dto.photo,
      responsible: {
        id: dto.id,
        fullName: dto.mainResponsiblePerson,
        email: dto.email,
        phone: dto.phone,
      },
      phone: dto.phone,
      commercialRegistration: dto.commercialRegistration,
      branchesCount: dto.branchesCount ?? 0,
      branches: (dto.branches ?? []).map((branch) => ({
        id: branch.id,
        name: branch.name,
        slug: branch.slug,
        email: branch.email,
      })),
      activeOrders: dto.activeOrders,
      completedOrders: dto.completedOrders,
      pendingInvoices: dto.pendingInvoices,
      outstandingBalance: dto.outstanding,
      status: parseStatus(dto.status),
      isActive: dto.isActive,
      createdAt: dto.createdAt,
    }
  },

  toAdminList(dto: CompaniesAdminAllDataDto): CompaniesAdminList {
    return {
      stats: (dto.stats ?? [])
        .filter((stat) => isCompanyStatKey(stat.key))
        .map(
          (stat): CompanyStat => ({
            key: stat.key as CompanyStatKey,
            value: stat.value,
            sparkline: (stat.sparkline ?? []).map((point) => ({
              date: point.date,
              value: point.value,
            })),
          }),
        ),
      items: (dto.items ?? []).map((item) => companyAdapter.toManagedCompany(item)),
    }
  },

  toCreateRequest(
    values: CompanyFormValues,
    uploadedFiles: Partial<Record<'logo' | 'commercialRegistration', UploadedFile>>,
    options?: { parentCompanyId?: string },
  ): CompanyCreateRequestDto {
    const payload: CompanyCreateRequestDto = {
      businessName: values.businessName,
      mainContactPerson: values.mainContactPerson,
      phone: values.phone,
      photo: uploadedFiles.logo?.filePath ?? '',
      email: values.email,
      password: values.password,
      type: values.businessType,
      address: values.address,
      googleMapLink: values.googleMapLink,
      commercialRegistration: uploadedFiles.commercialRegistration?.filePath ?? '',
    }

    if (options?.parentCompanyId) {
      payload.parentCompanyId = options.parentCompanyId
    }

    return payload
  },
}
