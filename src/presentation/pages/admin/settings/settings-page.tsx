import { Settings } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { SettingsTab } from '@/domain/types'
import {
  AppearanceSettings,
  GeneralSettings,
  NotificationsSettings,
  PreferencesSettings,
  SecuritySettings,
  SettingsLayout,
  UnsavedChangesDialog,
} from '@/presentation/components/admin/settings'
import { ChangePasswordDialog } from '@/presentation/components/admin/profile'
import { useProfile } from '@/presentation/components/admin/profile/hooks/use-profile'
import { useSettings } from '@/presentation/components/admin/profile/hooks/use-settings'
import { PageHeader } from '@/presentation/components/layout'
import { useSettingsStore } from '@/presentation/store'

const validTabs: SettingsTab[] = ['general', 'security', 'notifications', 'appearance', 'preferences']

export const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab') as SettingsTab | null
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : 'general',
  )

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false)
  const pendingTabRef = useRef<SettingsTab | null>(null)

  const hasUnsavedChanges = useSettingsStore((s) => s.hasUnsavedChanges)
  const setHasUnsavedChanges = useSettingsStore((s) => s.setHasUnsavedChanges)

  const { profile, isLoading: isProfileLoading, updateProfile } = useProfile()
  const { isLoading, isSaving, saveNotifications, saveAppearance, saveGeneral } = useSettings()

  const handleTabChange = useCallback(
    (tab: SettingsTab) => {
      if (hasUnsavedChanges) {
        pendingTabRef.current = tab
        setUnsavedDialogOpen(true)
        return
      }
      setActiveTab(tab)
      setSearchParams({ tab })
    },
    [hasUnsavedChanges, setSearchParams],
  )

  const handleDiscard = useCallback(() => {
    setHasUnsavedChanges(false)
    setUnsavedDialogOpen(false)
    if (pendingTabRef.current) {
      setActiveTab(pendingTabRef.current)
      setSearchParams({ tab: pendingTabRef.current })
      pendingTabRef.current = null
    }
  }, [setHasUnsavedChanges, setSearchParams])

  const handleCancelDiscard = useCallback(() => {
    setUnsavedDialogOpen(false)
    pendingTabRef.current = null
  }, [])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralSettings
            profile={profile}
            isLoading={isProfileLoading || isLoading}
            onSave={async (values) => {
              const result = await updateProfile(values)
              if (result.success) {
                await saveGeneral(useSettingsStore.getState().general)
              }
              return result
            }}
            isSaving={isSaving}
          />
        )
      case 'security':
        return <SecuritySettings onChangePassword={() => setPasswordOpen(true)} />
      case 'notifications':
        return (
          <NotificationsSettings
            isLoading={isLoading}
            isSaving={isSaving}
            onSave={saveNotifications}
          />
        )
      case 'appearance':
        return (
          <AppearanceSettings isLoading={isLoading} isSaving={isSaving} onSave={saveAppearance} />
        )
      case 'preferences':
        return (
          <PreferencesSettings isLoading={isLoading} isSaving={isSaving} onSave={saveGeneral} />
        )
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
        icon={Settings}
      />

      <SettingsLayout activeTab={activeTab} onTabChange={handleTabChange}>
        {renderContent()}
      </SettingsLayout>

      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
      <UnsavedChangesDialog
        open={unsavedDialogOpen}
        onDiscard={handleDiscard}
        onCancel={handleCancelDiscard}
      />
    </div>
  )
}
