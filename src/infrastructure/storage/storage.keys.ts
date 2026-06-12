export const STORAGE_KEYS = {
  authToken: 'cleno.auth.token',
  authState: 'cleno.auth.state',
  theme: 'cleno.theme',
  language: 'cleno.language',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
