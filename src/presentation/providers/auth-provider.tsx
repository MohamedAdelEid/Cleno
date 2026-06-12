import { useEffect, type ReactNode } from 'react'
import { localStorageClient } from '@/infrastructure/storage/local-storage'
import { STORAGE_KEYS } from '@/infrastructure/storage/storage.keys'
import { useAuthStore } from '@/presentation/store'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  useEffect(() => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      localStorageClient.set(STORAGE_KEYS.authToken, accessToken)
    }
  }, [])

  return children
}
