import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

import { cn } from '@/presentation/utils'

const BULK_EASE = [0.25, 0.1, 0.25, 1] as const

interface DataTableBulkActionsProps {
  visible: boolean
  selectedCount: number
  selectedLabel: string
  children: ReactNode
  className?: string
}

export const DataTableBulkActions = ({
  visible,
  selectedCount,
  selectedLabel,
  children,
  className,
}: DataTableBulkActionsProps) => (
  <AnimatePresence initial={false}>
    {visible && (
      <motion.div
        initial={{ opacity: 0, x: 12, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: BULK_EASE }}
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-lg border border-primary/20',
          'bg-primary/5 px-2.5 py-1.5 shadow-sm',
          className,
        )}
      >
        <span className="px-1 text-xs font-medium text-foreground">
          <span className="text-primary">{selectedCount}</span> {selectedLabel}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">{children}</div>
      </motion.div>
    )}
  </AnimatePresence>
)
