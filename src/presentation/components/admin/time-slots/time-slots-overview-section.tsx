import { motion } from 'framer-motion'
import { CircleCheck, CircleOff, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ManagedTimeSlotStatTrends, ManagedTimeSlotStats } from '@/domain/entities'
import { DashboardStatCard } from '@/presentation/components/dashboard/widgets/stat-card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, fadeUp } from '@/presentation/utils'

interface TimeSlotsOverviewSectionProps {
  stats: ManagedTimeSlotStats
  statTrends: ManagedTimeSlotStatTrends
  isLoading?: boolean
  className?: string
}

type StatKey = keyof ManagedTimeSlotStats

const timeSlotStats: StatKey[] = ['totalSlots', 'activeSlots', 'inactiveSlots']

const statConfig: Record<
  StatKey,
  { titleKey: string; descKey: string; icon: LucideIcon; trend: 'positive' | 'negative' }
> = {
  totalSlots: {
    titleKey: 'statTotalSlots',
    descKey: 'statTotalSlotsDesc',
    icon: Clock,
    trend: 'positive',
  },
  activeSlots: {
    titleKey: 'statActiveSlots',
    descKey: 'statActiveSlotsDesc',
    icon: CircleCheck,
    trend: 'positive',
  },
  inactiveSlots: {
    titleKey: 'statInactiveSlots',
    descKey: 'statInactiveSlotsDesc',
    icon: CircleOff,
    trend: 'negative',
  },
}

export const TimeSlotsOverviewSection = ({
  stats,
  statTrends,
  isLoading = false,
  className,
}: TimeSlotsOverviewSectionProps) => {
  const { t } = useTranslation('timeSlots')

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
        {t('statsTimeSlots')}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {timeSlotStats.map((key, index) => {
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
