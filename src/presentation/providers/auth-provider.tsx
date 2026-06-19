import { useEffect, type ReactNode } from 'react'
import { setUnauthorizedHandler } from '@/infrastructure/api/http-client'
import { localStorageClient } from '@/infrastructure/storage/local-storage'
import { STORAGE_KEYS } from '@/infrastructure/storage/storage.keys'
import { useAuthStore } from '@/presentation/store'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  useEffect(() => {
    setUnauthorizedHandler(() => {
      useAuthStore.getState().clearSession()
    })

    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      localStorageClient.set(STORAGE_KEYS.authToken, accessToken)
    }
  }, [])

  return children
}
