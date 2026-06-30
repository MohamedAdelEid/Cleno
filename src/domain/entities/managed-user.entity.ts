import type { Role } from '@/domain/enums'
import type { ManagedUserStatus } from '@/domain/enums/user-status.enum'

export interface ManagedUserRole {
  id: string
  slug: string
  name: string
}

export interface ManagedUser {
  id: string
  slug: string
  fullName: string
  email: string
  phone: string
  role: ManagedUserRole
  roleKey: Role | string
  photoPath?: string | null
  avatarUrl: string | null
  status: ManagedUserStatus
  lastLoginAt: string | null
  hasSignedIn?: boolean
  createdAt: string
}

export interface ManagedUserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  suspendedUsers: number
}

export type ManagedUserStatTrends = Record<keyof ManagedUserStats, number[]>
