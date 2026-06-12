import type { UserResponseDto } from '@/application/dtos/user/user-response.dto'

export interface LoginRequestDto {
  email: string
  password: string
}

export interface LoginResponseDto {
  user: UserResponseDto
  access_token: string
  refresh_token: string | null
}
