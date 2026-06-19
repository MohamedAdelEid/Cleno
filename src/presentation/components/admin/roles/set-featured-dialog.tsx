import { AnimatePresence, motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ManagedRole } from '@/domain/entities'
import { rolesApi } from '@/infrastructure/api/roles.api'
import { notify } from '@/infrastructure/libs/toast/toast'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Button } from '@/presentation/components/ui/button'
import { SearchInput } from '@/presentation/components/ui/search-input'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { cn } from '@/presentation/utils'

const ROW_EASE = [0.25, 0.1, 0.25, 1] as const
const MAX_FEATURED = 3
const PICKER_PAGE_SIZE = 100

export interface SetFeaturedDialogLabels {
  title: string
  description: string
  searchPlaceholder: string
  selectedCount: string
  save: string
  cancel: string
  toastSuccess: string
  toastSuccessDesc: string
  toastError: string
  toastMaxReached: string
}

interface SetFeaturedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialRoleIds: string[]
  labels: SetFeaturedDialogLabels
  onSaved?: () => void
}

export const SetFeaturedDialog = ({
  open,
  onOpenChange,
  initialRoleIds,
  labels,
  onSaved,
}: SetFeaturedDialogProps) => {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [roles, setRoles] = useState<ManagedRole[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (open) {
      setSelectedIds(initialRoleIds.slice(0, MAX_FEATURED))
    }
  }, [open, initialRoleIds])

  const fetchRoles = useCallback(async () => {
    setIsLoading(true)
    const result = await rolesApi.getAll({
      keyword: debouncedQuery || undefined,
      pageSize: PICKER_PAGE_SIZE,
      pageNumber: 1,
    })

    if (result.hasValue && result.data) {
      setRoles(result.data.items)
    } else {
      setRoles([])
    }

    setIsLoading(false)
  }, [debouncedQuery])

  useEffect(() => {
    if (!open) return
    void fetchRoles()
  }, [open, fetchRoles])

  const toggleRole = (roleId: string) => {
    setSelectedIds((current) => {
      if (current.includes(roleId)) {
        return current.filter((id) => id !== roleId)
      }

      if (current.length >= MAX_FEATURED) {
        notify.warning({
          title: labels.toastMaxReached,
          description: labels.toastMaxReached,
        })
        return current
      }

      return [...current, roleId]
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    const result = await rolesApi.setFeatured(selectedIds)

    if (result.hasValue) {
      notify.success({
        title: labels.toastSuccess,
        description: labels.toastSuccessDesc,
      })
      onSaved?.()
      onOpenChange(false)
    } else {
      notify.error({
        title: labels.toastError,
        description: result.error?.message ?? labels.toastError,
      })
    }

    setIsSaving(false)
  }

  const selectedLabel = useMemo(
    () => labels.selectedCount.replace('{{count}}', String(selectedIds.length)),
    [labels.selectedCount, selectedIds.length],
  )

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setQuery('')
      setDebouncedQuery('')
    }
    onOpenChange(next)
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={labels.title}
      description={labels.description}
      size="md"
      bodyClassName="space-y-4"
      footer={
        <>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
            {labels.cancel}
          </Button>
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {labels.save}
          </Button>
        </>
      }
    >
      <div className="flex items-center justify-between gap-3">
        <SearchInput
          value={query}
          onValueChange={setQuery}
          placeholder={labels.searchPlaceholder}
          containerClassName="flex-1"
        />
        <span className="shrink-0 text-xs font-medium text-muted-foreground">{selectedLabel}</span>
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto pe-1">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))
        ) : (
          <AnimatePresence initial={false}>
            {roles.map((role, index) => {
              const isSelected = selectedIds.includes(role.id)

              return (
                <motion.button
                  key={role.id}
                  type="button"
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: ROW_EASE, delay: index * 0.02 }}
                  onClick={() => toggleRole(role.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-colors',
                    isSelected
                      ? 'border-primary/40 bg-primary/8 shadow-sm'
                      : 'border-border/70 bg-background hover:bg-muted/30',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg border',
                      isSelected
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-border/70 bg-muted/30 text-muted-foreground',
                    )}
                  >
                    <Star className="size-3.5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{role.name}</p>
                    {role.description ? (
                      <p className="truncate text-xs text-muted-foreground">{role.description}</p>
                    ) : null}
                  </div>
                  <span
                    className={cn(
                      'flex size-5 items-center justify-center rounded-full border transition-all',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border/80 bg-background',
                    )}
                  >
                    {isSelected && <Check className="size-3" strokeWidth={2.5} />}
                  </span>
                </motion.button>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </AppDialog>
  )
}
