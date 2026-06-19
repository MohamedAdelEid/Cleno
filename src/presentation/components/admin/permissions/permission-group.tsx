import { AnimatePresence, motion } from 'framer-motion'
import { ChevronUp } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Checkbox } from '@/presentation/components/ui/checkbox'
import { cn } from '@/presentation/utils'
import { PermissionCheckbox } from './permission-checkbox'

const ACCORDION_EASE = [0.25, 0.1, 0.25, 1] as const

export interface PermissionOption {
  id: string
  label: string
}

interface PermissionGroupProps {
  title: string
  subtitle: string
  items: PermissionOption[]
  selectedIds: string[]
  onChange?: (ids: string[]) => void
  selectAllLabel: string
  emptyLabel: string
  defaultOpen?: boolean
  readOnly?: boolean
}

export const PermissionGroup = ({
  items,
  selectedIds,
  onChange,
  title,
  subtitle,
  selectAllLabel,
  emptyLabel,
  defaultOpen = false,
  readOnly = false,
}: PermissionGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const visibleItems = readOnly ? items.filter((item) => selectedSet.has(item.id)) : items

  const allSelected = items.length > 0 && items.every((item) => selectedSet.has(item.id))
  const someSelected = items.some((item) => selectedSet.has(item.id))

  const handleToggle = (id: string, checked: boolean) => {
    if (readOnly || !onChange) return

    const next = new Set(selectedSet)
    if (checked) {
      next.add(id)
    } else {
      next.delete(id)
    }
    onChange(Array.from(next))
  }

  const handleSelectAll = (checked: boolean) => {
    if (readOnly || !onChange) return

    const next = new Set(selectedSet)
    items.forEach((item) => {
      if (checked) {
        next.add(item.id)
      } else {
        next.delete(item.id)
      }
    })
    onChange(Array.from(next))
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center gap-4 px-4 py-4 text-start transition-colors hover:bg-muted/20"
      >
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300',
            isOpen ? 'rotate-0' : 'rotate-180',
          )}
        >
          <ChevronUp className="size-4" strokeWidth={2.5} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: ACCORDION_EASE }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 px-4 py-4">
              {!readOnly && items.length > 0 ? (
                <div className="mb-4 flex px-1">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                      onCheckedChange={(value) => handleSelectAll(value === true)}
                    />
                    <span>{selectAllLabel}</span>
                  </label>
                </div>
              ) : null}

              {visibleItems.length ? (
                <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
                  {visibleItems.map((item, index) => (
                    <PermissionCheckbox
                      key={item.id}
                      id={item.id}
                      label={item.label}
                      checked={selectedSet.has(item.id)}
                      disabled={readOnly}
                      onCheckedChange={(checked) => handleToggle(item.id, checked)}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{emptyLabel}</p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
