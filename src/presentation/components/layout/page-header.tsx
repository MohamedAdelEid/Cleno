import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/presentation/utils'

const HEADER_EASE = [0.25, 0.1, 0.25, 1] as const

export interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
  index?: number
}

export const PageHeader = ({
  title,
  description,
  icon: Icon,
  action,
  className,
  index = 0,
}: PageHeaderProps) => (
  <motion.header
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.38, ease: HEADER_EASE, delay: index * 0.05 }}
    className={cn(
      'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
      className,
    )}
  >
    <div className="space-y-1.5">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="flex size-9 items-center justify-center rounded-xl border border-border/80 bg-muted/40">
            <Icon className="size-4 text-muted-foreground" strokeWidth={1.75} />
          </span>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {description && (
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      )}
    </div>

    {action && <div className="shrink-0 self-start">{action}</div>}
  </motion.header>
)
