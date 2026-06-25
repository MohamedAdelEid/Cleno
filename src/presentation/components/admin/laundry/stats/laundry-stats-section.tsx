import { motion } from 'framer-motion'
import { ArrowDownToLine, Clock, Package, Send, ShoppingBag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { LaundryStats } from '@/domain/entities/laundry-order.entity'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { cn } from '@/presentation/utils'

const CARD_EASE = [0.25, 0.1, 0.25, 1] as const

interface StatItem {
  title: string
  value: string | number
  icon: LucideIcon
  accent: string
}

interface LaundryStatsSectionProps {
  stats: LaundryStats | null
  isLoading?: boolean
  labels: {
    receivedToday: string
    processedToday: string
    dispatchedToday: string
    avgProcessingTime: string
    bagsInLaundry: string
  }
}

const StatSkeleton = ({ index }: { index: number }) => (
  <motion.article
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.38, ease: CARD_EASE, delay: index * 0.06 }}
    className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-background px-4 py-3.5 shadow-xs"
  >
    <Skeleton className="size-10 rounded-lg" />
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-16" />
    </div>
  </motion.article>
)

export const LaundryStatsSection = ({ stats, isLoading = false, labels }: LaundryStatsSectionProps) => {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <StatSkeleton key={index} index={index} />
        ))}
      </div>
    )
  }

  const items: StatItem[] = [
    { title: labels.receivedToday, value: stats.receivedToday, icon: ArrowDownToLine, accent: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40' },
    { title: labels.processedToday, value: stats.processedToday, icon: ShoppingBag, accent: 'text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/40' },
    { title: labels.dispatchedToday, value: stats.dispatchedToday, icon: Send, accent: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40' },
    { title: labels.avgProcessingTime, value: stats.avgProcessingTime, icon: Clock, accent: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40' },
    { title: labels.bagsInLaundry, value: stats.bagsInLaundry, icon: Package, accent: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40' },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item, index) => (
        <motion.article
          key={item.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: CARD_EASE, delay: index * 0.06 }}
          className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-background px-4 py-3.5 shadow-xs"
        >
          <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', item.accent)}>
            <item.icon className="size-[18px]" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-muted-foreground">{item.title}</p>
            <p className="text-lg font-semibold tracking-tight text-foreground">{item.value}</p>
          </div>
        </motion.article>
      ))}
    </div>
  )
}
