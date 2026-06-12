import { createStorage } from './storage'

export const sessionStorageClient = createStorage(window.sessionStorage)
