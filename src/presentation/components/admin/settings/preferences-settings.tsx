import { memo, useCallback } from 'react'
import { RotateCcw, Save } from 'lucide-react'

import type { GeneralPreferences } from '@/domain/types'
import { Button } from '@/presentation/components/ui/button'
import { Field, FieldLabel } from '@/presentation/components/ui/field'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useSettingsStore } from '@/presentation/store'
import { cn } from '@/presentation/utils'

interface PreferencesSettingsProps {
  isLoading: boolean
  isSaving: boolean
  onSave: (prefs: GeneralPreferences) => Promise<{ success: boolean }>
}

const itemsPerPageOptions = [5, 10, 15, 20, 25, 50]
const autoRefreshOptions = [
  { value: 0, label: 'Off' },
  { value: 15, label: '15s' },
  { value: 30, label: '30s' },
  { value: 60, label: '1m' },
  { value: 300, label: '5m' },
]

export const PreferencesSettings = memo(
  ({ isLoading, isSaving, onSave }: PreferencesSettingsProps) => {
    const general = useSettingsStore((s) => s.general)
    const setGeneral = useSettingsStore((s) => s.setGeneral)
    const hasUnsavedChanges = useSettingsStore((s) => s.hasUnsavedChanges)
    const resetGeneral = useSettingsStore((s) => s.resetGeneral)

    const handleSave = useCallback(async () => {
      await onSave(general)
    }, [general, onSave])

    const handleReset = useCallback(() => {
      resetGeneral({
        language: 'en',
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h',
        weekStartsOn: 'sunday',
        defaultDashboardPage: '/dashboard',
        itemsPerPage: 10,
        autoRefreshInterval: 0,
      })
    }, [resetGeneral])

    if (isLoading) {
      return <PreferencesSkeleton />
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Preferences</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize display preferences for tables and dashboards.
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Display
          </h3>

          <div className="space-y-5">
            <Field>
              <FieldLabel>Items Per Page</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {itemsPerPageOptions.map((count) => (
                  <OptionChip
                    key={count}
                    label={String(count)}
                    selected={general.itemsPerPage === count}
                    onClick={() => setGeneral({ itemsPerPage: count })}
                  />
                ))}
              </div>
            </Field>

            <Field>
              <FieldLabel>Auto Refresh Interval</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {autoRefreshOptions.map((opt) => (
                  <OptionChip
                    key={opt.value}
                    label={opt.label}
                    selected={general.autoRefreshInterval === opt.value}
                    onClick={() => setGeneral({ autoRefreshInterval: opt.value })}
                  />
                ))}
              </div>
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <RotateCcw className="size-3.5" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={!hasUnsavedChanges || isSaving}>
            <Save className="size-3.5" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    )
  },
)

PreferencesSettings.displayName = 'PreferencesSettings'

const OptionChip = memo(
  ({
    label,
    selected,
    onClick,
  }: {
    label: string
    selected: boolean
    onClick: () => void
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border px-3 py-1.5 text-sm font-medium transition-all',
        selected
          ? 'border-primary bg-primary/8 text-primary'
          : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground',
      )}
      aria-pressed={selected}
    >
      {label}
    </button>
  ),
)

OptionChip.displayName = 'OptionChip'

const PreferencesSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-6 w-28" />
      <Skeleton className="h-4 w-48" />
    </div>
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <Skeleton className="mb-4 h-4 w-24" />
      <div className="space-y-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-9 w-24 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)
