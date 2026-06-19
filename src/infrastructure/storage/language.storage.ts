import { Language } from '@/domain/enums'
import { DEFAULT_LANGUAGE } from '@/infrastructure/config/constants'
import { localStorageClient } from './local-storage'
import { STORAGE_KEYS } from './storage.keys'

interface PersistedLanguageState {
  state?: {
    language?: string
  }
}

export const getStoredLanguage = (): Language => {
  const persisted = localStorageClient.get<PersistedLanguageState>(STORAGE_KEYS.language)
  const language = persisted?.state?.language

  if (language === Language.Arabic || language === Language.English) {
    return language
  }

  return DEFAULT_LANGUAGE
}
