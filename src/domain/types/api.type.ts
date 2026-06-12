export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'SERVER_ERROR'
  | 'UNKNOWN'

export interface ApiError {
  code: ApiErrorCode
  message: string
  status?: number
  fieldErrors?: Record<string, string[]>
}

export type Nullable<T> = T | null
