import { motion } from 'framer-motion'
import { Bell, Mail, Save } from 'lucide-react'
import { memo, useCallback } from 'react'

import type { NotificationPreferences } from '@/domain/types'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useSettingsStore } from '@/presentation/store'
import { cn } from '@/presentation/utils'

interface NotificationsSettingsProps {
  isLoading: boolean
  isSaving: boolean
  onSave: (prefs: NotificationPreferences) => Promise<{ success: boolean }>
}

interface ToggleItemProps {
  icon: React.ElementType
  iconColor: string
  iconBg: string
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  index: number
}

const ToggleItem = memo(
  ({ icon: Icon, iconColor, iconBg, title, description, checked, onChange, index }: ToggleItemProps) => (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="flex items-center justify-between gap-4 rounded-lg p-4 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-center gap-3">
        <span className={cn('flex size-9 items-center justify-center rounded-lg', iconBg)}>
          <Icon className={cn('size-4', iconColor)} />
        </span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          checked ? 'bg-primary' : 'bg-muted',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200',
            checked ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </motion.div>
  ),
)

ToggleItem.displayName = 'ToggleItem'

export const NotificationsSettings = memo(
  ({ isLoading, isSaving, onSave }: NotificationsSettingsProps) => {
    const notifications = useSettingsStore((s) => s.notifications)
    const setNotifications = useSettingsStore((s) => s.setNotifications)
    const hasUnsavedChanges = useSettingsStore((s) => s.hasUnsavedChanges)

    const handleSave = useCallback(async () => {
      await onSave(notifications)
    }, [notifications, onSave])

    if (isLoading) {
      return <NotificationsSkeleton />
    }

    const items = [
      {
        key: 'emailNotifications' as const,
        icon: Mail,
        iconColor: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-500/10',
        title: 'Email Notifications',
        description: 'Receive important updates and alerts via email',
      },
      {
        key: 'pushNotifications' as const,
        icon: Bell,
        iconColor: 'text-purple-600 dark:text-purple-400',
        iconBg: 'bg-purple-500/10',
        title: 'Push Notifications',
        description: 'Browser push notifications for real-time updates',
      },
    ]

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose how you&apos;d like to be notified.
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-2">
          <div className="divide-y divide-border/40">
            {items.map((item, index) => (
              <ToggleItem
                key={item.key}
                icon={item.icon}
                iconColor={item.iconColor}
                iconBg={item.iconBg}
                title={item.title}
                description={item.description}
                checked={notifications[item.key]}
                onChange={(checked) => setNotifications({ [item.key]: checked })}
                index={index}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!hasUnsavedChanges || isSaving}>
            <Save className="size-3.5" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    )
  },
)

NotificationsSettings.displayName = 'NotificationsSettings'

const NotificationsSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-56" />
    </div>
    <div className="rounded-xl border border-border/60 bg-card p-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>
      ))}
    </div>
  </div>
)
