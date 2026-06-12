import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Language } from '@/domain/enums'
import { i18n } from '@/infrastructure/libs/i18n/i18n'
import { DEFAULT_LANGUAGE } from '@/infrastructure/config/constants'
import { STORAGE_KEYS } from '@/infrastructure/storage/storage.keys'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

const applyDocumentLanguage = (language: Language): void => {
  document.documentElement.lang = language
  document.documentElement.dir = language === Language.Arabic ? 'rtl' : 'ltr'
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,

      setLanguage: (language) => {
        i18n.changeLanguage(language)
        applyDocumentLanguage(language)
        set({ language })
      },
    }),
    {
      name: STORAGE_KEYS.language,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          i18n.changeLanguage(state.language)
          applyDocumentLanguage(state.language)
        }
      },
    },
  ),
)
