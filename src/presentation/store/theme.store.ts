import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { applyTheme, type Theme } from '@/infrastructure/libs/theme/theme'
import { STORAGE_KEYS } from '@/infrastructure/storage/storage.keys'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },

      toggle: () => {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        set({ theme: next })
      },
    }),
    {
      name: STORAGE_KEYS.theme,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
