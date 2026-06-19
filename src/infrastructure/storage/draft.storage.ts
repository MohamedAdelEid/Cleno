import type { FormDraft } from '@/domain/types'
import { localStorageClient } from './local-storage'
import { STORAGE_KEYS } from './storage.keys'

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000

export const draftStorage = {
  get<T>(key: string, ttlMs = DEFAULT_TTL_MS): FormDraft<T> | null {
    const draft = localStorageClient.get<FormDraft<T>>(STORAGE_KEYS.formDraft(key))
    if (!draft) return null

    const isExpired = Date.now() - draft.savedAt > ttlMs
    if (isExpired) {
      this.remove(key)
      return null
    }

    return draft
  },

  save<T>(key: string, draft: FormDraft<T>): void {
    localStorageClient.set(STORAGE_KEYS.formDraft(key), {
      ...draft,
      savedAt: Date.now(),
    })
  },

  remove(key: string): void {
    localStorageClient.remove(STORAGE_KEYS.formDraft(key))
  },
}
