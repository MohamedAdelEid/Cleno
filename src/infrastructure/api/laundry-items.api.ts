import { laundryItemAdapter } from '@/application/adapters/laundry-item.adapter'
import type {
  CreateLaundryItemRequestDto,
  DeleteLaundryItemsRequestDto,
  LaundryItemCatalogDto,
  LaundryItemsAdminAllParams,
  LaundryItemsListDto,
  ToggleLaundryItemsActiveRequestDto,
  UpdateLaundryItemRequestDto,
} from '@/application/dtos/laundry-items/laundry-items-admin.dto'
import type { ManagedLaundryItem } from '@/domain/entities'
import type { ApiResult } from '@/domain/types'
import { API_ENDPOINTS } from './endpoints'
import { httpClient } from './http-client'

export const laundryItemsApi = {
  async getAdminAll(params: LaundryItemsAdminAllParams = {}): Promise<ApiResult<ManagedLaundryItem[]>> {
    const result = await httpClient.get<LaundryItemsListDto>({
      url: API_ENDPOINTS.laundryItems.adminAll,
      params: laundryItemAdapter.toAllParams(params),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: laundryItemAdapter.toManagedLaundryItems(result.data.items ?? []),
    }
  },

  async getCatalog(): Promise<ApiResult<LaundryItemCatalogDto[]>> {
    const result = await httpClient.get<LaundryItemCatalogDto[]>({
      url: API_ENDPOINTS.laundryItems.catalog,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return result
  },

  create(payload: CreateLaundryItemRequestDto): Promise<ApiResult<string>> {
    return httpClient.post<string>({
      url: API_ENDPOINTS.laundryItems.create,
      data: payload,
    })
  },

  update(slug: string, payload: UpdateLaundryItemRequestDto): Promise<ApiResult<boolean>> {
    return httpClient.put<boolean>({
      url: API_ENDPOINTS.laundryItems.update(slug),
      data: payload,
    })
  },

  toggleActive(laundryItemIds: string[]): Promise<ApiResult<boolean>> {
    const payload: ToggleLaundryItemsActiveRequestDto = { laundryItemIds }
    return httpClient.post<boolean>({
      url: API_ENDPOINTS.laundryItems.toggleActive,
      data: payload,
    })
  },

  delete(laundryItemIds: string[]): Promise<ApiResult<boolean>> {
    const payload: DeleteLaundryItemsRequestDto = { laundryItemIds }
    return httpClient.delete<boolean>({
      url: API_ENDPOINTS.laundryItems.delete,
      data: payload,
    })
  },
}
