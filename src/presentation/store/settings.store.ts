import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AppearancePreferences, GeneralPreferences, NotificationPreferences } from '@/domain/types'
import { STORAGE_KEYS } from '@/infrastructure/storage/storage.keys'

interface SettingsState {
  appearance: AppearancePreferences
  notifications: NotificationPreferences
  general: GeneralPreferences
  hasUnsavedChanges: boolean

  setAppearance: (appearance: Partial<AppearancePreferences>) => void
  setNotifications: (notifications: Partial<NotificationPreferences>) => void
  setGeneral: (general: Partial<GeneralPreferences>) => void
  setHasUnsavedChanges: (value: boolean) => void
  resetAppearance: (defaults: AppearancePreferences) => void
  resetNotifications: (defaults: NotificationPreferences) => void
  resetGeneral: (defaults: GeneralPreferences) => void
}

const defaultAppearance: AppearancePreferences = {
  theme: 'system',
  accentColor: '#2563eb',
  compactMode: false,
  sidebarCollapsed: false,
  animationsEnabled: true,
  fontSize: 'medium',
}

const defaultNotifications: NotificationPreferences = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  marketingEmails: false,
  securityAlerts: true,
  accountUpdates: true,
}

const defaultGeneral: GeneralPreferences = {
  language: 'en',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',
  weekStartsOn: 'sunday',
  defaultDashboardPage: '/dashboard',
  itemsPerPage: 10,
  autoRefreshInterval: 0,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      appearance: defaultAppearance,
      notifications: defaultNotifications,
      general: defaultGeneral,
      hasUnsavedChanges: false,

      setAppearance: (partial) =>
        set((state) => ({
          appearance: { ...state.appearance, ...partial },
          hasUnsavedChanges: true,
        })),

      setNotifications: (partial) =>
        set((state) => ({
          notifications: { ...state.notifications, ...partial },
          hasUnsavedChanges: true,
        })),

      setGeneral: (partial) =>
        set((state) => ({
          general: { ...state.general, ...partial },
          hasUnsavedChanges: true,
        })),

      setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),

      resetAppearance: (defaults) => set({ appearance: defaults, hasUnsavedChanges: false }),
      resetNotifications: (defaults) => set({ notifications: defaults, hasUnsavedChanges: false }),
      resetGeneral: (defaults) => set({ general: defaults, hasUnsavedChanges: false }),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        appearance: state.appearance,
        notifications: state.notifications,
        general: state.general,
      }),
    },
  ),
)
