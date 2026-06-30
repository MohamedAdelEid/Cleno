import type { User } from '@/domain/entities'
import { Role } from '@/domain/enums'
import type { UserResponseDto } from '@/application/dtos/user/user-response.dto'

const KNOWN_ROLES = new Set<string>(Object.values(Role))

const toRole = (value: string): Role =>
  KNOWN_ROLES.has(value) ? (value as Role) : Role.LaundryUser

const toAvatarUrl = (dto: UserResponseDto): string | null => {
  if (dto.avatar_url) return dto.avatar_url
  if (!dto.photo) return null
  if (typeof dto.photo === 'string') return dto.photo
  return dto.photo.url ?? dto.photo.path ?? null
}

export const userAdapter = {
  toEntity(dto: UserResponseDto): User {
    return {
      id: dto.id,
      email: dto.email,
      fullName: dto.full_name,
      role: toRole(dto.role),
      avatarUrl: toAvatarUrl(dto),
      createdAt: dto.created_at,
    }
  },
}
