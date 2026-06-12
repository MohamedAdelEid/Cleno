import { createStorage } from './storage'

export const localStorageClient = createStorage(window.localStorage)
