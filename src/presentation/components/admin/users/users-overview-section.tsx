import { motion } from 'framer-motion'
import { CircleCheck, CircleOff, ShieldAlert, UsersRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ManagedUserStatTrends, ManagedUserStats } from '@/domain/entities'
import { DashboardStatCard } from '@/presentation/components/dashboard/widgets/stat-card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, fadeUp } from '@/presentation/utils'

interface UsersOverviewSectionProps {
  stats: ManagedUserStats
  statTrends: ManagedUserStatTrends
  isLoading?: boolean
  className?: string
}

type StatKey = keyof ManagedUserStats

const userStats: StatKey[] = ['totalUsers', 'activeUsers', 'inactiveUsers', 'suspendedUsers']

const statConfig: Record<
  StatKey,
  { titleKey: string; descKey: string; icon: LucideIcon; trend: 'positive' | 'negative' }
> = {
  totalUsers: {
    titleKey: 'statTotalUsers',
    descKey: 'statTotalUsersDesc',
    icon: UsersRound,
    trend: 'positive',
  },
  activeUsers: {
    titleKey: 'statActiveUsers',
    descKey: 'statActiveUsersDesc',
    icon: CircleCheck,
    trend: 'positive',
  },
  inactiveUsers: {
    titleKey: 'statInactiveUsers',
    descKey: 'statInactiveUsersDesc',
    icon: CircleOff,
    trend: 'negative',
  },
  suspendedUsers: {
    titleKey: 'statSuspendedUsers',
    descKey: 'statSuspendedUsersDesc',
    icon: ShieldAlert,
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

const StatGroup = ({
  title,
  keys,
  stats,
  statTrends,
  startIndex,
}: {
  title: string
  keys: StatKey[]
  stats: ManagedUserStats
  statTrends: ManagedUserStatTrends
  startIndex: number
}) => {
  const { t } = useTranslation('users')

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
        {title}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {keys.map((key, index) => {
          const config = statConfig[key]

          return (
            <DashboardStatCard
              key={key}
              index={startIndex + index}
              title={t(config.titleKey)}
              value={stats[key]}
              description={t(config.descKey)}
              icon={config.icon}
              sparklineData={statTrends[key] ?? []}
              sparklineTrend={config.trend}
              highlight={
                key === 'suspendedUsers' && stats.suspendedUsers > 0
                  ? String(stats.suspendedUsers)
                  : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}

export const UsersOverviewSection = ({
  stats,
  statTrends,
  isLoading = false,
  className,
}: UsersOverviewSectionProps) => {
  const { t } = useTranslation('users')

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <OverviewSkeletonCard key={index} index={index} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      <StatGroup
        title={t('statsUsers')}
        keys={userStats}
        stats={stats}
        statTrends={statTrends}
        startIndex={0}
      />
    </div>
  )
}
