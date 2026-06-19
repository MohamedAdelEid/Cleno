import type { Permission } from '@/domain/types/permission.type'
import type { RoleStatus } from '@/domain/enums'

export interface RoleMember {
  id: string
  fullName: string
  email: string
  initials?: string
  avatarUrl: string | null
  status: RoleStatus
}

export interface ManagedRole {
  id: string
  name: string
  description: string
  permissions: Permission[]
  permissionsCount: number
  users: RoleMember[]
  usersCount: number
  remainingUsersCount: number
  status: RoleStatus
  isFeatured: boolean
  displayOrder: number
  createdAt: string
}
