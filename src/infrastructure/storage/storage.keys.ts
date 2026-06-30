export const STORAGE_KEYS = {
  authToken: 'cleno.auth.token',
  authState: 'cleno.auth.state',
  theme: 'cleno.theme',
  language: 'cleno.language',
  settings: 'cleno.settings',
  formDraft: (key: string) => `cleno.draft.${key}`,
} as const

export type StorageKey =
  | (typeof STORAGE_KEYS)[Exclude<keyof typeof STORAGE_KEYS, 'formDraft'>]
  | ReturnType<(typeof STORAGE_KEYS)['formDraft']>
