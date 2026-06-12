import type { AuthSession } from '@/domain/entities'
import type { LoginSchema } from '@/domain/schemas'
import type { LoginRequestDto, LoginResponseDto } from '@/application/dtos/auth/login.dto'
import { userAdapter } from './user.adapter'

export const authAdapter = {
  toLoginRequest(values: LoginSchema): LoginRequestDto {
    return {
      email: values.email,
      password: values.password,
    }
  },

  toSession(dto: LoginResponseDto): AuthSession {
    return {
      user: userAdapter.toEntity(dto.user),
      tokens: {
        accessToken: dto.access_token,
        refreshToken: dto.refresh_token,
      },
    }
  },
}
