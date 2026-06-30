import { useCallback, useEffect, useState } from 'react'

import type {
  AppearancePreferences,
  GeneralPreferences,
  NotificationPreferences,
} from '@/domain/types'
import { useSettingsStore } from '@/presentation/store'
import { mockDelay } from '../profile.data'

export const useSettings = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const store = useSettingsStore()

  const fetchAllPreferences = useCallback(async () => {
    setIsLoading(true)
    await mockDelay()
    store.setHasUnsavedChanges(false)
    setIsLoading(false)
  }, [store])

  useEffect(() => {
    void fetchAllPreferences()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveNotifications = useCallback(
    async (_prefs: NotificationPreferences): Promise<{ success: boolean }> => {
      setIsSaving(true)
      await mockDelay(400)
      setIsSaving(false)
      store.setHasUnsavedChanges(false)
      return { success: true }
    },
    [store],
  )

  const saveAppearance = useCallback(
    async (_prefs: AppearancePreferences): Promise<{ success: boolean }> => {
      setIsSaving(true)
      await mockDelay(400)
      setIsSaving(false)
      store.setHasUnsavedChanges(false)
      return { success: true }
    },
    [store],
  )

  const saveGeneral = useCallback(
    async (_prefs: GeneralPreferences): Promise<{ success: boolean }> => {
      setIsSaving(true)
      await mockDelay(400)
      setIsSaving(false)
      store.setHasUnsavedChanges(false)
      return { success: true }
    },
    [store],
  )

  return {
    isLoading,
    isSaving,
    saveNotifications,
    saveAppearance,
    saveGeneral,
    refetch: fetchAllPreferences,
  }
}
