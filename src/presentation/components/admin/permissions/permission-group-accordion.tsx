import { AnimatePresence, motion } from 'framer-motion'
import { ChevronUp } from 'lucide-react'
import { useState } from 'react'

import type { Permission } from '@/domain/types/permission.type'
import { Checkbox } from '@/presentation/components/ui/checkbox'
import { cn } from '@/presentation/utils'

const ACCORDION_EASE = [0.25, 0.1, 0.25, 1] as const

export interface PermissionGroupItem {
  permission: Permission
  label: string
}

interface PermissionGroupAccordionProps {
  title: string
  subtitle: string
  groupLabel: string
  items: PermissionGroupItem[]
  emptyLabel: string
  defaultOpen?: boolean
}

export const PermissionGroupAccordion = ({
  title,
  subtitle,
  groupLabel,
  items,
  emptyLabel,
  defaultOpen = false,
}: PermissionGroupAccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/15">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          'flex w-full items-center gap-4 px-4 py-4 text-start transition-colors',
          'hover:bg-muted/25',
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground',
            'transition-transform duration-300',
            isOpen ? 'rotate-0' : 'rotate-180',
          )}
        >
          <ChevronUp className="size-4" strokeWidth={2.5} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: ACCORDION_EASE }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 bg-background px-4 py-4">
              <span className="mb-4 block text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {groupLabel}
              </span>

              {items.length ? (
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {items.map((item, index) => (
                    <motion.label
                      key={item.permission}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: ACCORDION_EASE, delay: index * 0.03 }}
                      className="flex cursor-default items-center gap-2 text-sm text-foreground"
                    >
                      <Checkbox checked disabled />
                      <span>{item.label}</span>
                    </motion.label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{emptyLabel}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
