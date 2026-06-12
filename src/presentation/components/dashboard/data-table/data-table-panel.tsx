import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

import { cn } from '@/presentation/utils'

const PANEL_EASE = [0.25, 0.1, 0.25, 1] as const

export interface DataTablePanelProps {
  toolbar: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
  tableClassName?: string
  index?: number
}

export const DataTablePanel = ({
  toolbar,
  children,
  footer,
  className,
  tableClassName,
  index = 0,
}: DataTablePanelProps) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.36, ease: PANEL_EASE, delay: index * 0.06 }}
    className={cn(
      'overflow-hidden rounded-xl border border-border/80 bg-muted/15',
      className,
    )}
  >
    <div className="px-4 py-4">{toolbar}</div>

    <div
      className={cn(
        'mx-4 overflow-hidden rounded-lg border border-border/60 bg-background',
        footer ? 'mb-0 rounded-b-none border-b-0' : 'mb-4',
        tableClassName,
      )}
    >
      {children}
    </div>

    {footer && (
      <div className="border-t border-border/60 bg-background/70 px-4 py-3 backdrop-blur-sm">
        {footer}
      </div>
    )}
  </motion.section>
)
