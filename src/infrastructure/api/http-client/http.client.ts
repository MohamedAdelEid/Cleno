import type { AxiosRequestConfig } from 'axios'
import type { ApiResult } from '@/domain/types'
import { axiosInstance } from './axios.instance'
import { setupHttpInterceptors } from './interceptors'

export interface RequestOptions<TData = unknown> {
  url: string
  data?: TData
  params?: Record<string, unknown>
  paramsSerializer?: AxiosRequestConfig['paramsSerializer']
  headers?: Record<string, string>
  isFormData?: boolean
  withCredentials?: boolean
  timeout?: number
}

const buildHeaders = (
  custom?: Record<string, string>,
  isFormData?: boolean,
): Record<string, string> | undefined => {
  if (isFormData) {
    return custom
  }

  return { ...custom }
}

const toRequestConfig = (options: Omit<RequestOptions, 'url'>) => ({
  params: options.params,
  ...(options.paramsSerializer != null && { paramsSerializer: options.paramsSerializer }),
  headers: buildHeaders(options.headers, options.isFormData),
  ...(options.withCredentials === true && { withCredentials: true }),
  ...(options.timeout != null && { timeout: options.timeout }),
})

setupHttpInterceptors(axiosInstance)

const get = <T>(options: Omit<RequestOptions, 'data' | 'isFormData'>): Promise<ApiResult<T>> =>
  axiosInstance.get(options.url, toRequestConfig(options)) as Promise<ApiResult<T>>

const post = <T>(options: RequestOptions): Promise<ApiResult<T>> =>
  axiosInstance.post(options.url, options.data, toRequestConfig(options)) as Promise<ApiResult<T>>

const put = <T>(options: RequestOptions): Promise<ApiResult<T>> =>
  axiosInstance.put(options.url, options.data, toRequestConfig(options)) as Promise<ApiResult<T>>

const patch = <T>(options: RequestOptions): Promise<ApiResult<T>> =>
  axiosInstance.patch(options.url, options.data, toRequestConfig(options)) as Promise<ApiResult<T>>

const del = <T>(options: RequestOptions): Promise<ApiResult<T>> => {
  const { url, data, ...rest } = options
  return axiosInstance.delete(url, {
    ...toRequestConfig(rest),
    ...(data !== undefined ? { data } : {}),
  }) as Promise<ApiResult<T>>
}

export const httpClient = {
  get,
  post,
  put,
  patch,
  delete: del,
}
