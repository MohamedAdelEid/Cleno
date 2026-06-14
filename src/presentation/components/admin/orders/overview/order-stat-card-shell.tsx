import { motion } from 'framer-motion'
import { Info, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/presentation/utils'

const CARD_EASE = [0.25, 0.1, 0.25, 1] as const

interface OrderStatCardShellProps {
  title: string
  icon: LucideIcon
  info?: string
  index?: number
  className?: string
  children: ReactNode
}

export const OrderStatCardShell = ({
  title,
  icon: Icon,
  info,
  index = 0,
  className,
  children,
}: OrderStatCardShellProps) => (
  <motion.article
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.42, ease: CARD_EASE, delay: index * 0.08 }}
    className={cn(
      'flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-background shadow-xs',
      className,
    )}
  >
    <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/30">
          <Icon className="size-4 text-foreground/80" strokeWidth={1.75} />
        </span>
        <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {info && (
        <span
          title={info}
          aria-label={info}
          className="shrink-0 cursor-help text-muted-foreground/45 transition-colors hover:text-muted-foreground"
        >
          <Info className="size-4" strokeWidth={1.75} />
        </span>
      )}
    </div>

    <div className="px-4 py-4">{children}</div>
  </motion.article>
)
