import type {
  CompaniesAdminAllDataDto,
  CompaniesAdminAllParams,
  CompanyForEditDto,
  CompanyIdsRequestDto,
  CompanyRejectRequestDto,
} from '@/application/dtos/companies/companies-admin.dto'
import type {
  CompanyProfileDto,
  CompanyProfileListParams,
  CompanyProfileInvoicesParams,
  CompanyProfileOrdersParams,
  CompanyProfilePaginatedDto,
  CompanyProfileActivityDto,
  CompanyProfileBranchDto,
  CompanyProfileInvoiceDto,
  CompanyProfileOrderDto,
} from '@/application/dtos/companies/company-profile.dto'
import type {
  CompanyCreateRequestDto,
  CompanyUpdateRequestDto,
} from '@/application/dtos/companies/create-company.dto'
import { companyAdapter } from '@/application/adapters/company.adapter'
import type {
  CompanyActivity,
  CompanyDetailsBranch,
  CompanyDetailsData,
  CompanyInvoice,
  CompanyOrder,
} from '@/domain/entities/company-details.entity'
import type { CompaniesAdminList, CompanyEditDetails } from '@/domain/types'
import type { ApiResult } from '@/domain/types'
import { API_ENDPOINTS } from './endpoints'
import { httpClient } from './http-client'

const buildQueryParams = (params: CompaniesAdminAllParams): Record<string, unknown> => {
  const query: Record<string, unknown> = {}

  if (params.keyword) query.keyword = params.keyword
  if (params.pageNumber != null) query.pageNumber = params.pageNumber
  if (params.pageSize != null) query.pageSize = params.pageSize
  if (params.status != null) query.status = params.status
  if (params.isActive != null) query.isActive = params.isActive
  if (params.sortBy) query.sortBy = params.sortBy
  if (params.sortDirection) query.sortDirection = params.sortDirection
  if (params.trendYear != null) query.trendYear = params.trendYear
  if (params.trendMonth != null) query.trendMonth = params.trendMonth

  return query
}

const buildProfileListParams = (params: CompanyProfileListParams): Record<string, unknown> => {
  const query: Record<string, unknown> = {}

  if (params.pageNumber != null) query.pageNumber = params.pageNumber
  if (params.pageSize != null) query.pageSize = params.pageSize

  return query
}

const buildOrdersParams = (params: CompanyProfileOrdersParams): Record<string, unknown> => {
  const query = buildProfileListParams(params)

  if (params.status != null) query.status = params.status
  if (params.sortBy) query.sortBy = params.sortBy
  if (params.sortDirection) query.sortDirection = params.sortDirection

  return query
}

const buildInvoicesParams = (params: CompanyProfileInvoicesParams): Record<string, unknown> => {
  const query = buildProfileListParams(params)

  if (params.paymentStatus != null) query.paymentStatus = params.paymentStatus

  return query
}

const adaptList = <TDto, TEntity>(
  result: ApiResult<{ items?: TDto[] } | TDto[]>,
  mapper: (item: TDto) => TEntity,
): ApiResult<TEntity[]> => {
  if (!result.hasValue || !result.data) {
    return { ...result, data: null }
  }

  const rawItems = Array.isArray(result.data) ? result.data : (result.data.items ?? [])

  try {
    return {
      ...result,
      data: rawItems.map(mapper),
    }
  } catch {
    return {
      ...result,
      hasValue: false,
      data: null,
      error: {
        code: 'ADAPTER_ERROR',
        message: 'Unable to parse company profile response.',
      },
    }
  }
}

export const companiesApi = {
  create(payload: CompanyCreateRequestDto): Promise<ApiResult<string>> {
    return httpClient.post<string>({
      url: API_ENDPOINTS.companies.create,
      data: payload,
    })
  },

  async getForEdit(slug: string): Promise<ApiResult<CompanyEditDetails>> {
    const result = await httpClient.get<CompanyForEditDto>({
      url: API_ENDPOINTS.companies.forEdit(slug),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    try {
      return {
        ...result,
        data: companyAdapter.toEditDetails(result.data),
      }
    } catch {
      return {
        ...result,
        hasValue: false,
        data: null,
        error: {
          code: 'ADAPTER_ERROR',
          message: 'Unable to parse company response.',
        },
      }
    }
  },

  update(slug: string, payload: CompanyUpdateRequestDto): Promise<ApiResult<string>> {
    return httpClient.put<string>({
      url: API_ENDPOINTS.companies.update(slug),
      data: payload,
    })
  },

  async getProfile(slug: string): Promise<ApiResult<CompanyDetailsData>> {
    const result = await httpClient.get<CompanyProfileDto>({
      url: API_ENDPOINTS.companies.profile(slug),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    try {
      return {
        ...result,
        data: companyAdapter.toCompanyProfile(result.data),
      }
    } catch {
      return {
        ...result,
        hasValue: false,
        data: null,
        error: {
          code: 'ADAPTER_ERROR',
          message: 'Unable to parse company profile response.',
        },
      }
    }
  },

  async getProfileActivity(
    slug: string,
    params: CompanyProfileListParams = {},
  ): Promise<ApiResult<CompanyActivity[]>> {
    const result = await httpClient.get<CompanyProfilePaginatedDto<CompanyProfileActivityDto>>({
      url: API_ENDPOINTS.companies.activity(slug),
      params: buildProfileListParams(params),
    })

    return adaptList(result, companyAdapter.toCompanyActivity)
  },

  async getProfileOrders(
    slug: string,
    params: CompanyProfileOrdersParams = {},
  ): Promise<ApiResult<CompanyOrder[]>> {
    const result = await httpClient.get<CompanyProfilePaginatedDto<CompanyProfileOrderDto>>({
      url: API_ENDPOINTS.companies.orders(slug),
      params: buildOrdersParams(params),
    })

    return adaptList(result, companyAdapter.toCompanyOrder)
  },

  async getProfileInvoices(
    slug: string,
    params: CompanyProfileInvoicesParams = {},
  ): Promise<ApiResult<CompanyInvoice[]>> {
    const result = await httpClient.get<CompanyProfilePaginatedDto<CompanyProfileInvoiceDto>>({
      url: API_ENDPOINTS.companies.invoices(slug),
      params: buildInvoicesParams(params),
    })

    return adaptList(result, companyAdapter.toCompanyInvoice)
  },

  async getProfileBranches(
    slug: string,
    params: CompanyProfileListParams = {},
  ): Promise<ApiResult<CompanyDetailsBranch[]>> {
    const result = await httpClient.get<CompanyProfilePaginatedDto<CompanyProfileBranchDto>>({
      url: API_ENDPOINTS.companies.branches(slug),
      params: buildProfileListParams(params),
    })

    return adaptList(result, companyAdapter.toCompanyBranch)
  },

  async getAdminAll(params: CompaniesAdminAllParams = {}): Promise<ApiResult<CompaniesAdminList>> {
    const result = await httpClient.get<CompaniesAdminAllDataDto>({
      url: API_ENDPOINTS.companies.adminAll,
      params: buildQueryParams(params),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    try {
      return {
        ...result,
        data: companyAdapter.toAdminList(result.data),
      }
    } catch {
      return {
        ...result,
        hasValue: false,
        data: null,
        error: {
          code: 'ADAPTER_ERROR',
          message: 'Unable to parse companies response.',
        },
      }
    }
  },

  toggleActive(companyIds: string[]): Promise<ApiResult<boolean>> {
    const payload: CompanyIdsRequestDto = { companyIds }
    return httpClient.post<boolean>({
      url: API_ENDPOINTS.companies.toggleActive,
      data: payload,
    })
  },

  approve(companyIds: string[]): Promise<ApiResult<boolean>> {
    const payload: CompanyIdsRequestDto = { companyIds }
    return httpClient.post<boolean>({
      url: API_ENDPOINTS.companies.approve,
      data: payload,
    })
  },

  reject(companyIds: string[], reason: string): Promise<ApiResult<boolean>> {
    const payload: CompanyRejectRequestDto = { companyIds, reason }
    return httpClient.post<boolean>({
      url: API_ENDPOINTS.companies.reject,
      data: payload,
    })
  },

  delete(companyIds: string[]): Promise<ApiResult<boolean>> {
    const payload: CompanyIdsRequestDto = { companyIds }
    return httpClient.delete<boolean>({
      url: API_ENDPOINTS.companies.delete,
      data: payload,
    })
  },
}
