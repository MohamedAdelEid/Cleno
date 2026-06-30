import type {
  AssignableRoleDto,
  BulkUserDeleteRequestDto,
  BulkUserStatusRequestDto,
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserForEditDto,
  UserListItemDto,
  UserStatDto,
  UsersAdminAllParams,
} from '@/application/dtos/users/users-admin.dto'
import type {
  ManagedUser,
  ManagedUserRole,
  ManagedUserStatTrends,
  ManagedUserStats,
} from '@/domain/entities'
import type { UserFormValues } from '@/domain/schemas'
import { ManagedUserStatus } from '@/domain/enums'
import type { ManagedUserStatus as ManagedUserStatusType } from '@/domain/enums'

const API_STATUS_TO_DOMAIN: Record<number, ManagedUserStatusType> = {
  1: ManagedUserStatus.Active,
  2: ManagedUserStatus.Inactive,
  3: ManagedUserStatus.Suspended,
}

const DOMAIN_STATUS_TO_API: Record<ManagedUserStatusType, number> = {
  [ManagedUserStatus.Active]: 1,
  [ManagedUserStatus.Inactive]: 2,
  [ManagedUserStatus.Suspended]: 3,
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const parseStatus = (status: number): ManagedUserStatusType =>
  API_STATUS_TO_DOMAIN[status] ?? ManagedUserStatus.Inactive

const toSparklineValues = (points: { value: number }[] | undefined): number[] =>
  (points ?? []).map((point) => point.value)

const toManagedUserRole = (roleId: string, roleName: string): ManagedUserRole => ({
  id: roleId,
  slug: slugify(roleName) || roleId,
  name: roleName,
})

const resolvePhotoUrl = (photo: UserListItemDto['photo']): string | null =>
  photo?.url ?? photo?.path ?? null

const resolvePhotoPath = (values: UserFormValues): string | null | undefined => {
  if (values.removePhoto) return null
  if (values.photoPath) return values.photoPath
  return undefined
}

const toManagedUserFromList = (dto: UserListItemDto): ManagedUser => ({
  id: dto.id,
  slug: `${slugify(dto.fullName) || 'user'}-${dto.id.slice(0, 8)}`,
  fullName: dto.fullName,
  email: dto.email,
  phone: dto.phone,
  role: toManagedUserRole(dto.roleId, dto.roleName),
  roleKey: dto.roleName,
  avatarUrl: resolvePhotoUrl(dto.photo),
  photoPath: dto.photo?.path ?? null,
  status: parseStatus(dto.status),
  lastLoginAt: dto.lastLoginAt,
  hasSignedIn: dto.hasSignedIn,
  createdAt: dto.createdAt,
})

const toManagedUserFromEdit = (dto: UserForEditDto, roleName?: string): ManagedUser => ({
  id: dto.id,
  slug: `${slugify(dto.fullName) || 'user'}-${dto.id.slice(0, 8)}`,
  fullName: dto.fullName,
  email: dto.email,
  phone: dto.phone,
  role: toManagedUserRole(dto.roleId, roleName ?? dto.roleId),
  roleKey: roleName ?? dto.roleId,
  avatarUrl: resolvePhotoUrl(dto.photo),
  photoPath: dto.photo?.path ?? null,
  status: parseStatus(dto.status),
  lastLoginAt: null,
  hasSignedIn: true,
  createdAt: new Date().toISOString(),
})

export const managedUserAdapter = {
  statusToApi(status: ManagedUserStatusType): number {
    return DOMAIN_STATUS_TO_API[status]
  },

  toAssignableRole(dto: AssignableRoleDto): ManagedUserRole {
    return {
      id: dto.id,
      slug: slugify(dto.name) || dto.id,
      name: dto.description || dto.name,
    }
  },

  toAssignableRoles(items: AssignableRoleDto[]): ManagedUserRole[] {
    return items.map((item) => this.toAssignableRole(item))
  },

  toManagedUsers(items: UserListItemDto[]): ManagedUser[] {
    return items.map(toManagedUserFromList)
  },

  toManagedUserForEdit(dto: UserForEditDto, roleOptions: ManagedUserRole[] = []): ManagedUser {
    const role = roleOptions.find((item) => item.id === dto.roleId)
    return toManagedUserFromEdit(dto, role?.name)
  },

  toStats(stats: UserStatDto[]): ManagedUserStats {
    const result: ManagedUserStats = {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      suspendedUsers: 0,
    }

    for (const stat of stats) {
      if (stat.key in result) {
        result[stat.key] = stat.value
      }
    }

    return result
  },

  toStatTrends(stats: UserStatDto[]): ManagedUserStatTrends {
    const trends: ManagedUserStatTrends = {
      totalUsers: [],
      activeUsers: [],
      inactiveUsers: [],
      suspendedUsers: [],
    }

    for (const stat of stats) {
      if (stat.key in trends) {
        trends[stat.key] = toSparklineValues(stat.sparkline)
      }
    }

    return trends
  },

  toAllParams(params: {
    pageNumber?: number
    pageSize?: number
    keyword?: string
    status?: ManagedUserStatusType
    roleId?: string
    sortBy?: UsersAdminAllParams['sortBy']
    sortDirection?: UsersAdminAllParams['sortDirection']
    trendYear?: number
    trendMonth?: number
  }): UsersAdminAllParams {
    return {
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      keyword: params.keyword,
      status: params.status ? DOMAIN_STATUS_TO_API[params.status] : undefined,
      roleId: params.roleId,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      trendYear: params.trendYear,
      trendMonth: params.trendMonth,
    }
  },

  toCreateRequest(values: UserFormValues): CreateUserRequestDto {
    const photo = resolvePhotoPath(values)

    return {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      roleId: values.roleId,
      status: DOMAIN_STATUS_TO_API[values.status],
      password: values.password,
      ...(photo !== undefined ? { photo } : {}),
    }
  },

  toUpdateRequest(values: UserFormValues): UpdateUserRequestDto {
    const photo = resolvePhotoPath(values)

    return {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      roleId: values.roleId,
      status: DOMAIN_STATUS_TO_API[values.status],
      ...(photo !== undefined ? { photo } : {}),
    }
  },

  toBulkStatusRequest(userIds: string[], status: ManagedUserStatusType): BulkUserStatusRequestDto {
    return {
      userIds,
      status: DOMAIN_STATUS_TO_API[status],
    }
  },

  toBulkDeleteRequest(userIds: string[]): BulkUserDeleteRequestDto {
    return { userIds }
  },
}
