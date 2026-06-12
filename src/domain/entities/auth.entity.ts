import type { User } from './user.entity'

export interface AuthTokens {
  accessToken: string
  refreshToken: string | null
}

export interface AuthSession {
  user: User
  tokens: AuthTokens
}
