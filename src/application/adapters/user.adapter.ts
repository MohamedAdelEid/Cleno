import type { User } from '@/domain/entities'
import { Role } from '@/domain/enums'
import type { UserResponseDto } from '@/application/dtos/user/user-response.dto'

const KNOWN_ROLES = new Set<string>(Object.values(Role))

const toRole = (value: string): Role =>
  KNOWN_ROLES.has(value) ? (value as Role) : Role.LaundryUser

export const userAdapter = {
  toEntity(dto: UserResponseDto): User {
    return {
      id: dto.id,
      email: dto.email,
      fullName: dto.full_name,
      role: toRole(dto.role),
      avatarUrl: dto.avatar_url,
      createdAt: dto.created_at,
    }
  },
}
