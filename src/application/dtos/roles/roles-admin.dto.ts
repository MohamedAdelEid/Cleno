import type { FileReferenceDto } from '@/application/dtos/file-upload/file-upload.dto'
import type { PermissionModuleDto } from '@/application/dtos/permissions/permissions.dto'

export interface RoleUserDto {
  id: string
  fullName: string
  email: string
  initials: string
  photo?: string | FileReferenceDto | null
  isActive: boolean
}

export interface RoleAdminItemDto {
  id: string
  slug?: string
  name: string
  description: string | null
  permissionsCount: number
  usersCount: number
  users: RoleUserDto[]
  remainingUsersCount: number
  isActive: boolean
  isFeatured: boolean
  displayOrder: number
  createdAt: string
}

export interface RolesAdminStatsDto {
  totalRoles: number
  activeRoles: number
  inactiveRoles: number
  featuredRoles?: RoleAdminItemDto[] | string[] | null
}

export interface RolesAdminAllDataDto {
  stats: RolesAdminStatsDto
  items: RoleAdminItemDto[]
}

export interface RolesAdminAllParams {
  keyword?: string
  isActive?: boolean
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface SetFeaturedRolesRequestDto {
  roleIds: string[]
}

export interface RoleUserAssignmentRequestDto {
  roleId: string
  userIds: string[]
}

export interface RoleAvailableUsersParams {
  keyword?: string
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface RolePermissionsDto {
  roleId: string
  roleSlug: string
  roleName: string
  permissionGroups: PermissionModuleDto[]
}
