import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { OrderDriver } from '@/domain/entities'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { Button } from '@/presentation/components/ui/button'
import { SearchInput } from '@/presentation/components/ui/search-input'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { cn } from '@/presentation/utils'

const ROW_EASE = [0.25, 0.1, 0.25, 1] as const

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export interface AssignDriverDialogLabels {
  title: string
  description: string
  searchPlaceholder: string
  removeAssignment: string
  assign: string
  cancel: string
}

interface AssignDriverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderNumber: string
  currentDriverId: string | null
  drivers: OrderDriver[]
  isLoading?: boolean
  labels: AssignDriverDialogLabels
  onAssign?: (driver: OrderDriver) => void
  onRemove?: () => void
}

export const AssignDriverDialog = ({
  open,
  onOpenChange,
  orderNumber,
  currentDriverId,
  drivers,
  isLoading = false,
  labels,
  onAssign,
  onRemove,
}: AssignDriverDialogProps) => {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filteredDrivers = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return drivers

    return drivers.filter(
      (driver) =>
        driver.fullName.toLowerCase().includes(normalized) ||
        driver.email.toLowerCase().includes(normalized),
    )
  }, [drivers, query])

  const selectedDriver = drivers.find((driver) => driver.id === selectedId) ?? null

  const handleAssign = () => {
    if (!selectedDriver) return
    onAssign?.(selectedDriver)
    setSelectedId(null)
    setQuery('')
    onOpenChange(false)
  }

  const handleRemove = () => {
    onRemove?.()
    setSelectedId(null)
    setQuery('')
    onOpenChange(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedId(null)
      setQuery('')
    }
    onOpenChange(next)
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={labels.title}
      description={labels.description.replace('{{order}}', orderNumber)}
      size="md"
      bodyClassName="space-y-4"
      footer={
        <>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {labels.cancel}
          </Button>
          <Button onClick={handleAssign} disabled={!selectedDriver}>
            {labels.assign}
          </Button>
        </>
      }
    >
      <SearchInput
        value={query}
        onValueChange={setQuery}
        placeholder={labels.searchPlaceholder}
        containerClassName="w-full"
      />

      {currentDriverId && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-center text-muted-foreground"
          onClick={handleRemove}
        >
          {labels.removeAssignment}
        </Button>
      )}

      <div className="max-h-72 space-y-2 overflow-y-auto pe-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 rounded-xl border px-3 py-2.5">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))
        ) : (
        <AnimatePresence initial={false}>
          {filteredDrivers.map((driver, index) => {
            const isSelected = selectedId === driver.id
            const isCurrent = driver.id === currentDriverId

            return (
              <motion.button
                key={driver.id}
                type="button"
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22, ease: ROW_EASE, delay: index * 0.03 }}
                onClick={() => setSelectedId(driver.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-colors',
                  isSelected
                    ? 'border-primary/40 bg-primary/8 shadow-sm'
                    : isCurrent
                      ? 'border-border/70 bg-muted/20 hover:bg-muted/30'
                      : 'border-border/70 bg-background hover:bg-muted/30',
                )}
              >
                <Avatar size="sm">
                  <AvatarImage src={driver.avatarUrl ?? undefined} alt={driver.fullName} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(driver.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{driver.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{driver.email}</p>
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
