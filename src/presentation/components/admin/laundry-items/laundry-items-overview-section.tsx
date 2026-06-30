import { motion } from 'framer-motion'
import { CircleCheck, CircleOff, Shirt } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ManagedLaundryItemStatTrends, ManagedLaundryItemStats } from '@/domain/entities'
import { DashboardStatCard } from '@/presentation/components/dashboard/widgets/stat-card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, fadeUp } from '@/presentation/utils'

interface LaundryItemsOverviewSectionProps {
  stats: ManagedLaundryItemStats
  statTrends: ManagedLaundryItemStatTrends
  isLoading?: boolean
  className?: string
}

type StatKey = keyof ManagedLaundryItemStats

const laundryItemStats: StatKey[] = ['totalItems', 'activeItems', 'inactiveItems']

const statConfig: Record<
  StatKey,
  { titleKey: string; descKey: string; icon: LucideIcon; trend: 'positive' | 'negative' }
> = {
  totalItems: {
    titleKey: 'statTotalItems',
    descKey: 'statTotalItemsDesc',
    icon: Shirt,
    trend: 'positive',
  },
  activeItems: {
    titleKey: 'statActiveItems',
    descKey: 'statActiveItemsDesc',
    icon: CircleCheck,
    trend: 'positive',
  },
  inactiveItems: {
    titleKey: 'statInactiveItems',
    descKey: 'statInactiveItemsDesc',
    icon: CircleOff,
    trend: 'negative',
  },
}

export const LaundryItemsOverviewSection = ({
  stats,
  statTrends,
  isLoading = false,
  className,
}: LaundryItemsOverviewSectionProps) => {
  const { t } = useTranslation('laundryItems')

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <Skeleton className="h-3 w-24" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <motion.div
              key={index}
              {...fadeUp(index * 0.05)}
              className="overflow-hidden rounded-xl border border-border/80 bg-card p-4"
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-4 h-8 w-14" />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
        {t('statsLaundryItems')}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {laundryItemStats.map((key, index) => {
          const config = statConfig[key]

          return (
            <DashboardStatCard
              key={key}
              index={index}
              title={t(config.titleKey)}
              value={stats[key]}
              description={t(config.descKey)}
              icon={config.icon}
              sparklineData={statTrends[key] ?? []}
              sparklineTrend={config.trend}
            />
          )
        })}
      </div>
    </div>
  )
}
