import type { Permission } from '@/domain/types/permission.type'
import type { RoleStatus } from '@/domain/enums'

export interface RoleMember {
  id: string
  fullName: string
  email: string
  avatarUrl: string | null
  status: RoleStatus
}

export interface ManagedRole {
  id: string
  name: string
  description: string
  permissions: Permission[]
  users: RoleMember[]
  status: RoleStatus
  createdAt: string
}
