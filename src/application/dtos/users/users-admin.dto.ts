import type { FileReferenceDto } from '@/application/dtos/file-upload/file-upload.dto'

export type UserStatKey = 'totalUsers' | 'activeUsers' | 'inactiveUsers' | 'suspendedUsers'

export interface UserSparklinePointDto {
  date: string
  value: number
}

export interface UserStatDto {
  key: UserStatKey
  value: number
  sparkline: UserSparklinePointDto[]
}

export interface UserListItemDto {
  id: string
  fullName: string
  email: string
  phone: string
  initials: string
  photo: FileReferenceDto | null
  roleId: string
  roleName: string
  status: number
  statusLabel: string
  lastLoginAt: string | null
  hasSignedIn: boolean
  createdAt: string
}

export interface UsersAdminAllDataDto {
  stats: UserStatDto[]
  items: UserListItemDto[]
}

export interface UsersAdminAllParams {
  pageNumber?: number
  pageSize?: number
  keyword?: string
  status?: number
  roleId?: string
  sortBy?: 'fullName' | 'email' | 'status' | 'lastLoginAt' | 'createdAt'
  sortDirection?: 'asc' | 'desc'
  trendYear?: number
  trendMonth?: number
}

export interface AssignableRoleDto {
  id: string
  name: string
  description: string
}

export interface UserForEditDto {
  id: string
  fullName: string
  email: string
  phone: string
  roleId: string
  status: number
  photo: FileReferenceDto | null
}

export interface CreateUserRequestDto {
  fullName: string
  email: string
  phone: string
  roleId: string
  status: number
  password: string
  photo?: string | null
}

export interface UpdateUserRequestDto {
  fullName: string
  email: string
  phone: string
  roleId: string
  status: number
  photo?: string | null
}

export interface UpdateUserStatusRequestDto {
  status: number
}

export interface UpdateUserStatusResponseDto {
  status: number
  statusLabel: string
}

export interface BulkUserStatusRequestDto {
  userIds: string[]
  status: number
}

export interface BulkUserDeleteRequestDto {
  userIds: string[]
}
