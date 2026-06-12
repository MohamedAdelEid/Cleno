import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/presentation/utils'

const CARD_EASE = [0.25, 0.1, 0.25, 1] as const

export interface DashboardPanelCardProps {
  title: string
  icon?: LucideIcon
  action?: ReactNode
  index?: number
  className?: string
  innerClassName?: string
  children: ReactNode
}

export const DashboardPanelCard = ({
  title,
  icon: Icon,
  action,
  index = 0,
  className,
  innerClassName,
  children,
}: DashboardPanelCardProps) => (
  <motion.article
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.42, ease: CARD_EASE, delay: index * 0.08 }}
    className={cn(
      'flex flex-col overflow-hidden rounded-xl border border-border/80 bg-[#f6f6f6] dark:bg-[#1a1a1a]',
      className,
    )}
  >
    <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
      <div className="flex min-w-0 items-center gap-2">
        {Icon && (
          <Icon className="size-4 shrink-0 text-muted-foreground/70" strokeWidth={1.75} />
        )}
        <h3 className="truncate text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      {action}
    </div>

    <div
      className={cn(
        'mx-2 mb-2 min-w-0 rounded-lg border border-border/60 bg-background',
        innerClassName,
      )}
    >
      {children}
    </div>
  </motion.article>
)
