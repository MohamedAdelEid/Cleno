import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

import { cn } from '@/presentation/utils'

const BAR_EASE = [0.25, 0.1, 0.25, 1] as const

interface DataTableBulkBarProps {
  visible: boolean
  selectedCount: number
  selectedLabel: string
  children: ReactNode
  className?: string
}

export const DataTableBulkBar = ({
  visible,
  selectedCount,
  selectedLabel,
  children,
  className,
}: DataTableBulkBarProps) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.26, ease: BAR_EASE }}
        className={cn(
          'absolute inset-x-2 bottom-2 z-20 flex flex-wrap items-center justify-between gap-3',
          'rounded-lg border border-border/80 bg-background/85 px-4 py-3 shadow-lg backdrop-blur-md',
          className,
        )}
      >
        <p className="text-sm font-medium text-foreground">
          <span className="text-primary">{selectedCount}</span> {selectedLabel}
        </p>
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      </motion.div>
    )}
  </AnimatePresence>
)
