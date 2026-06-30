import type { CreateRoleRequestDto } from '@/application/dtos/roles/create-role.dto'
import type {
  RoleAdminItemDto,
  RoleUserDto,
  RolesAdminAllDataDto,
  RolesAdminAllParams,
  RoleAvailableUsersParams,
  RolePermissionsDto,
} from '@/application/dtos/roles/roles-admin.dto'
import { roleAdapter } from '@/application/adapters/role.adapter'
import type { ManagedRole, PermissionModuleGroup, RoleMember } from '@/domain/entities'
import type { ApiResult, RolesAdminList } from '@/domain/types'
import { API_ENDPOINTS } from './endpoints'
import { httpClient } from './http-client'

export const rolesApi = {
  create(payload: CreateRoleRequestDto): Promise<ApiResult<string>> {
    return httpClient.post<string>({
      url: API_ENDPOINTS.roles.create,
      data: payload,
    })
  },

  async getAll(params: RolesAdminAllParams = {}): Promise<ApiResult<RolesAdminList>> {
    const result = await httpClient.get<RolesAdminAllDataDto>({
      url: API_ENDPOINTS.roles.all,
      params: roleAdapter.toAllParams(params),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    try {
      return {
        ...result,
        data: roleAdapter.toAdminList(result.data),
      }
    } catch {
      return {
        ...result,
        hasValue: false,
        data: null,
        error: {
          code: 'ADAPTER_ERROR',
          message: 'Unable to parse roles response.',
        },
      }
    }
  },

  async getAssignedPermissions(roleSlug: string): Promise<ApiResult<PermissionModuleGroup[]>> {
    const result = await httpClient.get<RolePermissionsDto>({
      url: API_ENDPOINTS.roles.permissions(roleSlug),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: roleAdapter.toAssignedPermissionGroups(result.data),
    }
  },

  assignPermissions(roleSlug: string, permissionIds: string[]): Promise<ApiResult<boolean>> {
    return httpClient.post<boolean>({
      url: API_ENDPOINTS.roles.permissions(roleSlug),
      data: permissionIds,
    })
  },

  setFeatured(roleIds: string[]): Promise<ApiResult<boolean>> {
    return httpClient.post<boolean>({
      url: API_ENDPOINTS.roles.setFeatured,
      data: roleAdapter.toSetFeaturedRequest(roleIds),
    })
  },

  assignUsers(roleId: string, userIds: string[]): Promise<ApiResult<boolean>> {
    return httpClient.post<boolean>({
      url: API_ENDPOINTS.roles.assignUser,
      data: roleAdapter.toAssignUsersRequest(roleId, userIds),
    })
  },

  unassignUsers(roleId: string, userIds: string[]): Promise<ApiResult<boolean>> {
    return httpClient.post<boolean>({
      url: API_ENDPOINTS.roles.unassignUser,
      data: roleAdapter.toUnassignUsersRequest(roleId, userIds),
    })
  },

  async getRoleUsers(roleSlug: string): Promise<ApiResult<RoleMember[]>> {
    const result = await httpClient.get<RoleUserDto[]>({
      url: API_ENDPOINTS.roles.users(roleSlug),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: roleAdapter.toRoleMembers(result.data),
    }
  },

  async getAvailableUsers(
    roleSlug: string,
    params: RoleAvailableUsersParams = {},
  ): Promise<ApiResult<RoleMember[]>> {
    const result = await httpClient.get<RoleUserDto[]>({
      url: API_ENDPOINTS.roles.availableUsers(roleSlug),
      params: roleAdapter.toAvailableUsersParams(params),
    })

    if (!result.hasValue || !result.data) {
      return { ...result, data: null }
    }

    return {
      ...result,
      data: roleAdapter.toRoleMembers(result.data),
    }
  },

  async getBySlug(roleSlug: string): Promise<ApiResult<ManagedRole | null>> {
    const byIdResult = await httpClient.get<RoleAdminItemDto>({
      url: API_ENDPOINTS.roles.bySlug(roleSlug),
    })

    if (byIdResult.hasValue && byIdResult.data) {
      return {
        ...byIdResult,
        data: roleAdapter.toManagedRole(byIdResult.data),
      }
    }

    const listResult = await this.getAll({ pageSize: 100, pageNumber: 1 })

    if (!listResult.hasValue || !listResult.data) {
      return { ...listResult, data: null }
    }

    const role =
      listResult.data.items.find((item) => item.slug === roleSlug || item.id === roleSlug) ??
      listResult.data.featuredRoles.find(
        (item) => item.slug === roleSlug || item.id === roleSlug,
      ) ??
      null

    return {
      ...listResult,
      data: role,
      hasValue: !!role,
    }
  },

  getById(roleId: string): Promise<ApiResult<ManagedRole | null>> {
    return this.getBySlug(roleId)
  },
}
