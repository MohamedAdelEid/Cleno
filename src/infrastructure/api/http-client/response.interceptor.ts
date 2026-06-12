import type { AxiosResponse } from 'axios'
import { normalizeError } from './error-handler'

export const onResponseFulfilled = (response: AxiosResponse): AxiosResponse => response

export const onResponseRejected = (error: unknown): Promise<never> =>
  Promise.reject(normalizeError(error))
