import { motion } from 'framer-motion'
import { CircleCheck, CircleOff, Truck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ManagedDriverStatTrends, ManagedDriverStats } from '@/domain/entities'
import { DashboardStatCard } from '@/presentation/components/dashboard/widgets/stat-card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, fadeUp } from '@/presentation/utils'

interface DriversOverviewSectionProps {
  stats: ManagedDriverStats
  statTrends: ManagedDriverStatTrends
  isLoading?: boolean
  className?: string
}

type StatKey = keyof ManagedDriverStats

const driverStats: StatKey[] = ['totalDrivers', 'availableDrivers', 'unavailableDrivers']

const statConfig: Record<
  StatKey,
  { titleKey: string; descKey: string; icon: LucideIcon; trend: 'positive' | 'negative' }
> = {
  totalDrivers: {
    titleKey: 'statTotalDrivers',
    descKey: 'statTotalDriversDesc',
    icon: Truck,
    trend: 'positive',
  },
  availableDrivers: {
    titleKey: 'statAvailableDrivers',
    descKey: 'statAvailableDriversDesc',
    icon: CircleCheck,
    trend: 'positive',
  },
  unavailableDrivers: {
    titleKey: 'statUnavailableDrivers',
    descKey: 'statUnavailableDriversDesc',
    icon: CircleOff,
    trend: 'negative',
  },
}

const OverviewSkeletonCard = ({ index }: { index: number }) => (
  <motion.div
    {...fadeUp(index * 0.05)}
    className="overflow-hidden rounded-xl border border-border/80 bg-card"
  >
    <div className="flex items-start justify-between gap-3 px-4 pt-3 pb-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="size-4 rounded-md" />
    </div>
    <div className="mx-2 mb-2 rounded-lg border border-border/60 bg-background px-3.5 py-3">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-14" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  </motion.div>
)

export const DriversOverviewSection = ({
  stats,
  statTrends,
  isLoading = false,
  className,
}: DriversOverviewSectionProps) => {
  const { t } = useTranslation('drivers')

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <Skeleton className="h-3 w-24" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <OverviewSkeletonCard key={index} index={index} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
        {t('statsDrivers')}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {driverStats.map((key, index) => {
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
              highlight={
                key === 'unavailableDrivers' && stats.unavailableDrivers > 0
                  ? String(stats.unavailableDrivers)
                  : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}
