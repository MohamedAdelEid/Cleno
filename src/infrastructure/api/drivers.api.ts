import type {
  CreateDriverRequestDto,
  DriverDto,
  DriverDropdownItemDto,
  DriversAdminAllParams,
  DriversListDto,
  UpdateDriverRequestDto,
} from '@/application/dtos/drivers/drivers-admin.dto'
import { driverAdapter } from '@/application/adapters/driver.adapter'
import type { ManagedDriver } from '@/domain/entities'
import type { OrderDriver } from '@/domain/entities'
import type { ApiResult } from '@/domain/types'
import { API_ENDPOINTS } from './endpoints'
import { httpClient } from './http-client'

export const driversApi = {
  async getAdminAll(params: DriversAdminAllParams = {}): Promise<ApiResult<ManagedDriver[]>> {
    const result = await httpClient.get<DriversListDto>({
      url: API_ENDPOINTS.drivers.adminAll,
      params: driverAdapter.toAllParams(params),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: driverAdapter.toManagedDrivers(result.data.items ?? []),
    }
  },

  async getBySlug(slug: string): Promise<ApiResult<ManagedDriver>> {
    const result = await httpClient.get<DriverDto>({
      url: API_ENDPOINTS.drivers.adminBySlug(slug),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: driverAdapter.toManagedDriver(result.data),
    }
  },

  async getDropdown(includeAll = false): Promise<ApiResult<OrderDriver[]>> {
    const result = await httpClient.get<DriverDropdownItemDto[]>({
      url: API_ENDPOINTS.drivers.dropdown,
      params: { includeAll },
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: result.data.map((item) => ({
        id: item.id,
        fullName: item.fullName,
        email: item.email,
        avatarUrl: null,
      })),
    }
  },

  create(payload: CreateDriverRequestDto): Promise<ApiResult<string>> {
    return httpClient.post<string>({
      url: API_ENDPOINTS.drivers.create,
      data: payload,
    })
  },

  update(slug: string, payload: UpdateDriverRequestDto): Promise<ApiResult<boolean>> {
    return httpClient.put<boolean>({
      url: API_ENDPOINTS.drivers.update(slug),
      data: payload,
    })
  },

  toggleStatus(slug: string): Promise<ApiResult<number>> {
    return httpClient.patch<number>({
      url: API_ENDPOINTS.drivers.toggleStatus(slug),
    })
  },

  delete(slug: string): Promise<ApiResult<boolean>> {
    return httpClient.delete<boolean>({
      url: API_ENDPOINTS.drivers.delete(slug),
    })
  },
}
