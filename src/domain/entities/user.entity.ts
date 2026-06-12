import type { Role } from '@/domain/enums'

export interface User {
  id: string
  email: string
  fullName: string
  role: Role
  avatarUrl: string | null
  createdAt: string
}
