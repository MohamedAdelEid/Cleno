import type { PaginationMeta } from './pagination.type'

export const ResultStatus = {
  Success: 'Success',
  NotFound: 'NotFound',
  Unauthorized: 'Unauthorized',
  BadRequest: 'BadRequest',
  Conflict: 'Conflict',
  Forbidden: 'Forbidden',
  Error: 'Error',
} as const

export type ResultStatus = (typeof ResultStatus)[keyof typeof ResultStatus]

export interface ResultValidationError {
  field: string
  message: string
}

export interface ApiResultError {
  code: string
  message: string
  validationErrors?: ResultValidationError[]
}

export interface ApiResult<T> {
  data: T | null
  error: ApiResultError | null
  status: ResultStatus
  statusCode: number
  hasValue: boolean
  message: string
  pagination?: PaginationMeta
}
