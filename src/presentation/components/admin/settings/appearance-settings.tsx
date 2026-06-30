import { motion } from 'framer-motion'
import { Check, Monitor, Moon, Save, Sun } from 'lucide-react'
import { memo, useCallback } from 'react'

import type { AppearancePreferences } from '@/domain/types'
import type { Theme } from '@/infrastructure/libs/theme/theme'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useSettingsStore, useThemeStore } from '@/presentation/store'
import { cn } from '@/presentation/utils'

interface AppearanceSettingsProps {
  isLoading: boolean
  isSaving: boolean
  onSave: (prefs: AppearancePreferences) => Promise<{ success: boolean }>
}

const themes = [
  { id: 'light' as const, label: 'Light', icon: Sun, preview: 'bg-white border-border' },
  { id: 'dark' as const, label: 'Dark', icon: Moon, preview: 'bg-slate-900 border-slate-700' },
  { id: 'system' as const, label: 'System', icon: Monitor, preview: 'bg-gradient-to-br from-white to-slate-900 border-border' },
]

export const AppearanceSettings = memo(
  ({ isLoading, isSaving, onSave }: AppearanceSettingsProps) => {
    const appearance = useSettingsStore((s) => s.appearance)
    const setAppearance = useSettingsStore((s) => s.setAppearance)
    const hasUnsavedChanges = useSettingsStore((s) => s.hasUnsavedChanges)
    const setTheme = useThemeStore((s) => s.setTheme)

    const handleThemeChange = useCallback(
      (theme: Theme) => {
        setAppearance({ theme })
        setTheme(theme)
      },
      [setAppearance, setTheme],
    )

    const handleSave = useCallback(async () => {
      await onSave(appearance)
    }, [appearance, onSave])

    if (isLoading) {
      return <AppearanceSkeleton />
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Appearance</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize the look and feel of your dashboard.
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold">Theme</h3>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((theme) => {
              const Icon = theme.icon
              const isSelected = appearance.theme === theme.id
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleThemeChange(theme.id)}
                  className={cn(
                    'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                    isSelected
                      ? 'border-primary bg-primary/4 shadow-sm'
                      : 'border-border/60 hover:border-border hover:bg-muted/30',
                  )}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute end-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary"
                    >
                      <Check className="size-3 text-primary-foreground" />
                    </motion.span>
                  )}
                  <span className={cn('size-12 rounded-lg border', theme.preview)} />
                  <div className="flex items-center gap-1.5">
                    <Icon className="size-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium">{theme.label}</span>
                  </div>
                </button>
              )
            })}
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

AppearanceSettings.displayName = 'AppearanceSettings'

const AppearanceSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-6 w-28" />
      <Skeleton className="h-4 w-52" />
    </div>
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <Skeleton className="mb-4 h-4 w-16" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
)
