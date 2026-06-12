import type { InternalAxiosRequestConfig } from 'axios'
import { localStorageClient } from '@/infrastructure/storage/local-storage'
import { STORAGE_KEYS } from '@/infrastructure/storage/storage.keys'

export const onRequestFulfilled = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  const token = localStorageClient.get<string>(STORAGE_KEYS.authToken)

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
}
