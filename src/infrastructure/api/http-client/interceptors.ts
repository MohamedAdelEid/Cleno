import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type {
  ApiResult,
  ApiResultError,
  PaginationMeta,
  ResultValidationError,
} from '@/domain/types'
import { ResultStatus } from '@/domain/types'
import { getStoredLanguage } from '@/infrastructure/storage/language.storage'
import { getAccessToken, runUnauthorizedHandler } from './auth-access'

type RawValidationItem = {
  field?: string
  message?: string
  propertyName?: string
  errorMessage?: string
}

type PaginationHeader = {
  CurrentPage: number
  PageSize: number
  TotalCount: number
  TotalPages: number
  HasPrevious?: boolean
  HasNext?: boolean
}

type ApiBody = {
  data?: unknown
  message?: string
  isSuccess?: boolean
  IsSuccess?: boolean
  error?: ApiResultError & { validationErrors?: RawValidationItem[] }
  Error?: ApiResultError & { ValidationErrors?: RawValidationItem[] }
}

const normalizeValidationErrors = (
  raw: RawValidationItem[] | undefined,
): ResultValidationError[] | undefined => {
  if (!raw?.length) return undefined

  const items = raw
    .map((item) => ({
      field: item.field ?? item.propertyName ?? '',
      message: (item.message ?? item.errorMessage ?? '').trim(),
    }))
    .filter((item) => item.message.length > 0)

  return items.length ? items : undefined
}

const toPaginationMeta = (raw: PaginationHeader): PaginationMeta => ({
  page: raw.CurrentPage,
  pageSize: raw.PageSize,
  total: raw.TotalCount,
  totalPages: raw.TotalPages,
})

const getPaginationFromResponse = (response: AxiosResponse): PaginationMeta | undefined => {
  const headerValue =
    response.headers?.['x-pagination'] ?? response.headers?.['X-Pagination']

  if (typeof headerValue !== 'string') return undefined

  try {
    return toPaginationMeta(JSON.parse(headerValue) as PaginationHeader)
  } catch {
    return undefined
  }
}

const resolveStatus = (statusCode: number): ResultStatus => {
  if (statusCode === 401) return ResultStatus.Unauthorized
  if (statusCode === 403) return ResultStatus.Forbidden
  if (statusCode === 404) return ResultStatus.NotFound
  if (statusCode === 400) return ResultStatus.BadRequest
  if (statusCode === 409) return ResultStatus.Conflict
  if (statusCode >= 200 && statusCode < 300) return ResultStatus.Success
  return ResultStatus.Error
}

const getErrorBlock = (body: unknown): ApiResultError | undefined => {
  if (!body || typeof body !== 'object') return undefined

  const payload = body as ApiBody
  const nested = payload.error ?? payload.Error
  if (!nested || typeof nested !== 'object') return undefined

  return {
    code: nested.code ?? 'ERROR',
    message: nested.message ?? '',
    validationErrors: normalizeValidationErrors(
      nested.validationErrors ?? (nested as { ValidationErrors?: RawValidationItem[] }).ValidationErrors,
    ),
  }
}

const hasBackendError = (body: ApiBody | null): boolean => {
  if (!body) return false
  if (body.isSuccess === false || body.IsSuccess === false) return true
  const errorMessage = getErrorBlock(body)?.message?.trim()
  return Boolean(errorMessage)
}

const buildSuccess = <T>(response: AxiosResponse): ApiResult<T> => {
  const body = (response.data as ApiBody) ?? null
  const failed = hasBackendError(body)
  const errorBlock = getErrorBlock(body)
  const pagination = getPaginationFromResponse(response)

  return {
    data: (failed ? null : body?.data ?? body ?? null) as T | null,
    error: failed
      ? {
          code: errorBlock?.code ?? String(response.status),
          message: errorBlock?.message ?? body?.message ?? 'Request failed',
          validationErrors: errorBlock?.validationErrors,
        }
      : null,
    status: failed ? ResultStatus.Error : resolveStatus(response.status),
    statusCode: response.status,
    hasValue: !failed,
    message: body?.message ?? '',
    ...(pagination && { pagination }),
  }
}

const buildError = <T>(
  statusCode: number,
  fallbackMessage: string,
  body?: unknown,
): ApiResult<T> => {
  const payload = (body ?? null) as ApiBody | null
  const errorBlock = getErrorBlock(body)
  const message =
    errorBlock?.message ??
    payload?.message ??
    (typeof payload?.error === 'string' ? payload.error : null) ??
    fallbackMessage

  return {
    data: null,
    error: {
      code: errorBlock?.code ?? String(statusCode),
      message,
      validationErrors: errorBlock?.validationErrors,
    },
    status: resolveStatus(statusCode),
    statusCode,
    hasValue: false,
    message,
  }
}

const attachAuthHeaders = (config: InternalAxiosRequestConfig): void => {
  const token = getAccessToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  config.headers.set('Accept-Language', getStoredLanguage())
}

export const setupHttpInterceptors = (instance: AxiosInstance): void => {
  instance.interceptors.request.use((config) => {
    attachAuthHeaders(config)
    return config
  })

  instance.interceptors.response.use(
    (response) => buildSuccess(response) as unknown as AxiosResponse<ApiResult<unknown>>,
    (error) => {
      if (!error.response) {
        return Promise.resolve(buildError(0, 'Unable to reach the server.'))
      }

      const { status, data } = error.response

      if (status === 401) {
        runUnauthorizedHandler()
      }

      return Promise.resolve(buildError(status, error.message, data))
    },
  )
}
