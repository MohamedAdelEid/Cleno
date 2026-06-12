import { formatDistanceToNow } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, Clock, MessageSquareWarning } from 'lucide-react'

import { AlertCategory, Language } from '@/domain/enums'
import type { DashboardAlert } from '@/domain/entities'
import { useLanguageStore } from '@/presentation/store'
import { cn } from '@/presentation/utils'

const ITEM_EASE = [0.25, 0.1, 0.25, 1] as const

interface AlertItemProps {
  alert: DashboardAlert
  index: number
  categoryLabel: string
  onOrderClick?: (alert: DashboardAlert) => void
}

const categoryConfig: Record<
  AlertCategory,
  { icon: LucideIcon; iconBox: string; badge: string }
> = {
  [AlertCategory.DelayedOrder]: {
    icon: Clock,
    iconBox: 'border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  },
  [AlertCategory.IssueReported]: {
    icon: MessageSquareWarning,
    iconBox: 'border-orange-200/80 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
  },
  [AlertCategory.OpenIncident]: {
    icon: AlertTriangle,
    iconBox: 'border-red-200/80 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300',
    badge: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
  },
}

export const AlertItem = ({
  alert,
  index,
  categoryLabel,
  onOrderClick,
}: AlertItemProps) => {
  const language = useLanguageStore((state) => state.language)
  const locale = language === Language.Arabic ? arSA : enUS
  const { icon: Icon, iconBox, badge } = categoryConfig[alert.category]

  const relativeTime = formatDistanceToNow(new Date(alert.occurredAt), {
    addSuffix: true,
    locale,
  })

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: ITEM_EASE, delay: index * 0.05 + 0.1 }}
    >
      <div
        className={cn(
          'group rounded-lg border border-transparent px-2 py-2.5 transition-colors',
          'hover:border-border/50 hover:bg-muted/35',
        )}
      >
        <div className="flex items-start gap-2.5">
          <div
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-lg border',
              iconBox,
            )}
          >
            <Icon className="size-3.5" strokeWidth={2} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                  badge,
                )}
              >
                {categoryLabel}
              </span>
              <time
                dateTime={alert.occurredAt}
                className="shrink-0 text-[10px] text-muted-foreground/80"
              >
                {relativeTime}
              </time>
            </div>

            <button
              type="button"
              onClick={() => onOrderClick?.(alert)}
              className={cn(
                'mt-1.5 text-sm font-semibold text-foreground transition-colors',
                'hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              )}
            >
              {alert.orderNumber}
            </button>

            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {alert.description}
            </p>
          </div>
        </div>
      </div>
    </motion.li>
  )
}
