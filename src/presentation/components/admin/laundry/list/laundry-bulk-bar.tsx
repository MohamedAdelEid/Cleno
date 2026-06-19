import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/presentation/components/ui/button'
import { cn } from '@/presentation/utils'

const BAR_EASE = [0.25, 0.1, 0.25, 1] as const

interface LaundryBulkBarProps {
  visible: boolean
  selectedCount: number
  selectedLabel: string
  actionLabel: string
  onAction: () => void
  onClear: () => void
  selectAllLabel?: string
  onSelectAllToggle?: () => void
  actionDisabled?: boolean
  className?: string
  children?: ReactNode
}

export const LaundryBulkBar = ({
  visible,
  selectedCount,
  selectedLabel,
  actionLabel,
  onAction,
  onClear,
  selectAllLabel,
  onSelectAllToggle,
  actionDisabled,
  className,
  children,
}: LaundryBulkBarProps) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.28, ease: BAR_EASE }}
        className={cn(
          'fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3',
          'rounded-xl border border-border/80 bg-background/95 px-4 py-3 shadow-xl backdrop-blur-md',
          className,
        )}
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon-xs" onClick={onClear} aria-label="Clear selection">
            <X className="size-3.5" />
          </Button>
          <p className="text-sm font-medium text-foreground">
            <span className="text-primary">{selectedCount}</span> {selectedLabel}
          </p>
          {selectAllLabel && onSelectAllToggle && (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onSelectAllToggle}>
              {selectAllLabel}
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {children}
          <Button size="sm" onClick={onAction} disabled={actionDisabled}>
            {actionLabel}
          </Button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)
