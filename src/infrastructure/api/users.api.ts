import { managedUserAdapter } from '@/application/adapters/managed-user.adapter'
import type {
  AssignableRoleDto,
  BulkUserDeleteRequestDto,
  BulkUserStatusRequestDto,
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UpdateUserStatusRequestDto,
  UpdateUserStatusResponseDto,
  UserForEditDto,
  UsersAdminAllDataDto,
  UsersAdminAllParams,
} from '@/application/dtos/users/users-admin.dto'
import type {
  ManagedUser,
  ManagedUserRole,
  ManagedUserStatTrends,
  ManagedUserStats,
} from '@/domain/entities'
import type { ApiResult } from '@/domain/types'
import { API_ENDPOINTS } from './endpoints'
import { httpClient } from './http-client'

export interface UsersAdminList {
  stats: ManagedUserStats
  trends: ManagedUserStatTrends
  items: ManagedUser[]
}

export const usersApi = {
  async getAdminAll(params: UsersAdminAllParams = {}): Promise<ApiResult<UsersAdminList>> {
    const result = await httpClient.get<UsersAdminAllDataDto>({
      url: API_ENDPOINTS.users.adminAll,
      params,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: {
        stats: managedUserAdapter.toStats(result.data.stats ?? []),
        trends: managedUserAdapter.toStatTrends(result.data.stats ?? []),
        items: managedUserAdapter.toManagedUsers(result.data.items ?? []),
      },
    }
  },

  async getAssignableRoles(): Promise<ApiResult<ManagedUserRole[]>> {
    const result = await httpClient.get<AssignableRoleDto[]>({
      url: API_ENDPOINTS.users.assignableRoles,
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: managedUserAdapter.toAssignableRoles(result.data),
    }
  },

  async getForEdit(id: string, roleOptions: ManagedUserRole[] = []): Promise<ApiResult<ManagedUser>> {
    const result = await httpClient.get<UserForEditDto>({
      url: API_ENDPOINTS.users.forEdit(id),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: managedUserAdapter.toManagedUserForEdit(result.data, roleOptions),
    }
  },

  create(payload: CreateUserRequestDto): Promise<ApiResult<string>> {
    return httpClient.post<string>({
      url: API_ENDPOINTS.users.create,
      data: payload,
    })
  },

  update(id: string, payload: UpdateUserRequestDto): Promise<ApiResult<boolean>> {
    return httpClient.put<boolean>({
      url: API_ENDPOINTS.users.update(id),
      data: payload,
    })
  },

  updateStatus(
    id: string,
    payload: UpdateUserStatusRequestDto,
  ): Promise<ApiResult<UpdateUserStatusResponseDto>> {
    return httpClient.patch<UpdateUserStatusResponseDto>({
      url: API_ENDPOINTS.users.status(id),
      data: payload,
    })
  },

  bulkUpdateStatus(payload: BulkUserStatusRequestDto): Promise<ApiResult<number>> {
    return httpClient.post<number>({
      url: API_ENDPOINTS.users.bulkStatus,
      data: payload,
    })
  },

  delete(id: string): Promise<ApiResult<boolean>> {
    return httpClient.delete<boolean>({
      url: API_ENDPOINTS.users.byId(id),
    })
  },

  bulkDelete(payload: BulkUserDeleteRequestDto): Promise<ApiResult<number>> {
    return httpClient.delete<number>({
      url: API_ENDPOINTS.users.bulkDelete,
      data: payload,
    })
  },
}
