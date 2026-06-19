import type { ManagedRole } from '@/domain/entities'

export interface RoleStats {
  totalRoles: number
  activeRoles: number
  inactiveRoles: number
}

export interface RolesAdminList {
  stats: RoleStats
  featuredRoles: ManagedRole[]
  items: ManagedRole[]
}
