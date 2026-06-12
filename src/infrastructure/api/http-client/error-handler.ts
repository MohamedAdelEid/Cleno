import axios from 'axios'
import type { ApiError, ApiErrorCode } from '@/domain/types'

const STATUS_CODE_MAP: Record<number, ApiErrorCode> = {
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  422: 'VALIDATION',
}

interface ErrorPayload {
  message?: string
  errors?: Record<string, string[]>
}

const codeFromStatus = (status: number): ApiErrorCode => {
  if (STATUS_CODE_MAP[status]) return STATUS_CODE_MAP[status]
  return status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN'
}

export const normalizeError = (error: unknown): ApiError => {
  if (axios.isCancel(error)) {
    return { code: 'CANCELLED', message: 'Request was cancelled' }
  }

  if (axios.isAxiosError<ErrorPayload>(error)) {
    if (error.code === 'ECONNABORTED') {
      return { code: 'TIMEOUT', message: 'The request timed out' }
    }

    const { response } = error
    if (!response) {
      return { code: 'NETWORK_ERROR', message: 'Unable to reach the server' }
    }

    return {
      code: codeFromStatus(response.status),
      status: response.status,
      message: response.data?.message ?? error.message,
      fieldErrors: response.data?.errors,
    }
  }

  return {
    code: 'UNKNOWN',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
  }
}
