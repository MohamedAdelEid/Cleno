import type {
  RoleAdminItemDto,
  RoleUserDto,
  RolesAdminAllDataDto,
  RolesAdminAllParams,
  SetFeaturedRolesRequestDto,
  RoleUserAssignmentRequestDto,
  RoleAvailableUsersParams,
} from '@/application/dtos/roles/roles-admin.dto'
import type { CreateRoleRequestDto } from '@/application/dtos/roles/create-role.dto'
import type { ManagedRole, RoleMember } from '@/domain/entities'
import type { RoleFormValues } from '@/domain/schemas'
import type { RolesAdminList } from '@/domain/types'
import { RoleStatus } from '@/domain/enums'

const toRoleStatus = (isActive: boolean): RoleStatus =>
  isActive ? RoleStatus.Active : RoleStatus.Inactive

const toRoleMember = (user: RoleUserDto): RoleMember => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  initials: user.initials,
  avatarUrl: null,
  status: toRoleStatus(user.isActive),
})

const toManagedRole = (item: RoleAdminItemDto): ManagedRole => ({
  id: item.id,
  name: item.name,
  description: item.description ?? '',
  permissions: [],
  permissionsCount: item.permissionsCount ?? 0,
  users: (item.users ?? []).map(toRoleMember),
  usersCount: item.usersCount ?? 0,
  remainingUsersCount: item.remainingUsersCount ?? 0,
  status: toRoleStatus(item.isActive),
  isFeatured: item.isFeatured ?? false,
  displayOrder: item.displayOrder ?? 0,
  createdAt: item.createdAt,
})

const resolveFeaturedItems = (
  featuredRoles: RolesAdminAllDataDto['stats']['featuredRoles'] | undefined,
  items: RoleAdminItemDto[],
): RoleAdminItemDto[] => {
  const featuredEntries = Array.isArray(featuredRoles) ? featuredRoles : []

  if (featuredEntries.length > 0) {
    const resolved = featuredEntries
      .map((entry) => {
        if (typeof entry === 'string') {
          return items.find((item) => item.id === entry)
        }

        if (entry && typeof entry === 'object' && 'id' in entry) {
          return entry as RoleAdminItemDto
        }

        return undefined
      })
      .filter((item): item is RoleAdminItemDto => !!item)

    if (resolved.length > 0) {
      return resolved
    }
  }

  return items.filter((item) => item.isFeatured)
}

export const roleAdapter = {
  toCreateRequest(values: RoleFormValues): CreateRoleRequestDto {
    return {
      name: values.name.trim(),
      description: values.description.trim(),
      isActive: values.status === RoleStatus.Active,
      permissionIds: values.permissionIds,
    }
  },

  toManagedRole,

  toAdminList(data: RolesAdminAllDataDto): RolesAdminList {
    const items = Array.isArray(data.items) ? data.items : []
    const featuredItems = resolveFeaturedItems(data.stats?.featuredRoles, items)

    return {
      stats: {
        totalRoles: data.stats?.totalRoles ?? items.length,
        activeRoles: data.stats?.activeRoles ?? 0,
        inactiveRoles: data.stats?.inactiveRoles ?? 0,
      },
      featuredRoles: featuredItems
        .map(toManagedRole)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .slice(0, 3),
      items: items.map(toManagedRole),
    }
  },

  toSetFeaturedRequest(roleIds: string[]): SetFeaturedRolesRequestDto {
    return { roleIds }
  },

  toAssignUsersRequest(roleId: string, userIds: string[]): RoleUserAssignmentRequestDto {
    return { roleId, userIds }
  },

  toUnassignUsersRequest(roleId: string, userIds: string[]): RoleUserAssignmentRequestDto {
    return { roleId, userIds }
  },

  toRoleMembers(users: RoleUserDto[]): RoleMember[] {
    return users.map(toRoleMember)
  },

  toAvailableUsersParams(params: RoleAvailableUsersParams): Record<string, unknown> {
    const query: Record<string, unknown> = {}

    if (params.keyword) query.keyword = params.keyword
    if (params.pageNumber != null) query.pageNumber = params.pageNumber
    if (params.pageSize != null) query.pageSize = params.pageSize
    if (params.sortBy) query.sortBy = params.sortBy
    if (params.sortDirection) query.sortDirection = params.sortDirection

    return query
  },

  toAllParams(params: RolesAdminAllParams): Record<string, unknown> {
    const query: Record<string, unknown> = {}

    if (params.keyword) query.keyword = params.keyword
    if (params.isActive != null) query.isActive = params.isActive
    if (params.pageNumber != null) query.pageNumber = params.pageNumber
    if (params.pageSize != null) query.pageSize = params.pageSize
    if (params.sortBy) query.sortBy = params.sortBy
    if (params.sortDirection) query.sortDirection = params.sortDirection

    return query
  },
}
