import type { PermissionModuleDto } from '@/application/dtos/permissions/permissions.dto'
import { permissionAdapter } from '@/application/adapters/permission.adapter'
import type { PermissionModuleGroup } from '@/domain/entities'
import type { ApiResult } from '@/domain/types'
import { API_ENDPOINTS } from './endpoints'
import { httpClient } from './http-client'

export const permissionsApi = {
  async getAll(): Promise<ApiResult<PermissionModuleGroup[]>> {
    const result = await httpClient.get<PermissionModuleDto[]>({
      url: API_ENDPOINTS.permissions.list,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: permissionAdapter.toModuleGroups(result.data),
    }
  },
}
