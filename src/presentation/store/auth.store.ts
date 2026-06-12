import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Permission } from '@/domain/types'
import type { AuthSession, User } from '@/domain/entities'
import { localStorageClient } from '@/infrastructure/storage/local-storage'
import { STORAGE_KEYS } from '@/infrastructure/storage/storage.keys'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  permissions: Permission[]
  isAuthenticated: boolean
  setSession: (session: AuthSession) => void
  setPermissions: (permissions: Permission[]) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      permissions: [],
      isAuthenticated: false,

      setSession: (session) => {
        localStorageClient.set(STORAGE_KEYS.authToken, session.tokens.accessToken)
        set({
          user: session.user,
          accessToken: session.tokens.accessToken,
          refreshToken: session.tokens.refreshToken,
          isAuthenticated: true,
        })
      },

      setPermissions: (permissions) => set({ permissions }),

      clearSession: () => {
        localStorageClient.remove(STORAGE_KEYS.authToken)
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          permissions: [],
          isAuthenticated: false,
        })
      },
    }),
    {
      name: STORAGE_KEYS.authState,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
