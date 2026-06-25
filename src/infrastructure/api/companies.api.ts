import type {
  CompaniesAdminAllDataDto,
  CompaniesAdminAllParams,
  CompanyIdsRequestDto,
  CompanyRejectRequestDto,
} from '@/application/dtos/companies/companies-admin.dto'
import type { CompanyCreateRequestDto } from '@/application/dtos/companies/create-company.dto'
import { companyAdapter } from '@/application/adapters/company.adapter'
import type { CompaniesAdminList } from '@/domain/types'
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

export const companiesApi = {
  create(payload: CompanyCreateRequestDto): Promise<ApiResult<string>> {
    return httpClient.post<string>({
      url: API_ENDPOINTS.companies.create,
      data: payload,
    })
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
