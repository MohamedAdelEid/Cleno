import type {
  BagDetailsDto,
  BagDropdownItemDto,
  BagsAdminAllParams,
  BagsListDto,
  BagsStatsDto,
  CreateBagRequestDto,
  UpdateBagRequestDto,
} from '@/application/dtos/bags/bags-admin.dto'
import { bagAdapter } from '@/application/adapters/bag.adapter'
import type {
  OperationalBag,
  OperationalBagStatTrends,
  OperationalBagStats,
} from '@/domain/entities'
import type { ApiResult } from '@/domain/types'
import { API_ENDPOINTS } from './endpoints'
import { httpClient } from './http-client'

export const bagsApi = {
  async getStats(): Promise<
    ApiResult<{ stats: OperationalBagStats; trends: OperationalBagStatTrends }>
  > {
    const result = await httpClient.get<BagsStatsDto>({
      url: API_ENDPOINTS.bags.stats,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: bagAdapter.toStats(result.data),
    }
  },

  async getAdminAll(params: BagsAdminAllParams = {}): Promise<ApiResult<OperationalBag[]>> {
    const result = await httpClient.get<BagsListDto>({
      url: API_ENDPOINTS.bags.adminAll,
      params: bagAdapter.toAllParams(params),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: bagAdapter.toOperationalBags(result.data.items ?? []),
    }
  },

  async getBySlug(slug: string): Promise<ApiResult<OperationalBag>> {
    const result = await httpClient.get<BagDetailsDto>({
      url: API_ENDPOINTS.bags.bySlug(slug),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: bagAdapter.toOperationalBagDetails(result.data),
    }
  },

  async getDropdown(includeAll = false): Promise<ApiResult<BagDropdownItemDto[]>> {
    return httpClient.get<BagDropdownItemDto[]>({
      url: API_ENDPOINTS.bags.dropdown,
      params: includeAll ? { includeAll: true } : undefined,
    })
  },

  create(payload: CreateBagRequestDto): Promise<ApiResult<string>> {
    return httpClient.post<string>({
      url: API_ENDPOINTS.bags.create,
      data: payload,
    })
  },

  update(slug: string, payload: UpdateBagRequestDto): Promise<ApiResult<boolean>> {
    return httpClient.put<boolean>({
      url: API_ENDPOINTS.bags.bySlug(slug),
      data: payload,
    })
  },

  delete(slug: string): Promise<ApiResult<boolean>> {
    return httpClient.delete<boolean>({
      url: API_ENDPOINTS.bags.bySlug(slug),
    })
  },
}
