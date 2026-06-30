import type { Role } from '@/domain/enums'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  username: string
  phone: string | null
  role: Role
  avatarUrl: string | null
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  permissions: string[]
}

export interface ProfileActivity {
  id: string
  type: 'login' | 'password_change' | 'profile_update' | 'settings_update' | 'logout'
  description: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface ActiveSession {
  id: string
  device: string
  browser: string
  os: string
  ipAddress: string
  location: string | null
  lastActivity: string
  isCurrent: boolean
}
