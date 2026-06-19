import { localStorageClient } from '@/infrastructure/storage/local-storage'
import { STORAGE_KEYS } from '@/infrastructure/storage/storage.keys'

export const getAccessToken = (): string | null =>
  localStorageClient.get<string>(STORAGE_KEYS.authToken)

let unauthorizedHandler: (() => void) | undefined

export const setUnauthorizedHandler = (handler: () => void): void => {
  unauthorizedHandler = handler
}

export const runUnauthorizedHandler = (): void => {
  unauthorizedHandler?.()
}
