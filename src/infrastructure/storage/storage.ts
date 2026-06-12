import type { StorageKey } from './storage.keys'

export interface TypedStorage {
  get<T>(key: StorageKey): T | null
  set<T>(key: StorageKey, value: T): void
  remove(key: StorageKey): void
  clear(): void
}

export const createStorage = (driver: Storage): TypedStorage => ({
  get<T>(key: StorageKey): T | null {
    const raw = driver.getItem(key)
    if (raw === null) return null

    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },

  set<T>(key: StorageKey, value: T): void {
    driver.setItem(key, JSON.stringify(value))
  },

  remove(key: StorageKey): void {
    driver.removeItem(key)
  },

  clear(): void {
    driver.clear()
  },
})
