import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, CircleDot } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ManagedIncidentStatTrends, ManagedIncidentStats } from '@/domain/entities'
import { DashboardStatCard } from '@/presentation/components/dashboard/widgets/stat-card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, fadeUp } from '@/presentation/utils'

interface IncidentsOverviewSectionProps {
  stats: ManagedIncidentStats
  statTrends: ManagedIncidentStatTrends
  isLoading?: boolean
  className?: string
}

type StatKey = keyof ManagedIncidentStats

const statKeys: StatKey[] = ['total', 'open', 'closed']

const statConfig: Record<StatKey, { titleKey: string; descKey: string; icon: LucideIcon; trend: 'positive' | 'negative' }> = {
  total: {
    titleKey: 'statTotal',
    descKey: 'statTotalDesc',
    icon: AlertTriangle,
    trend: 'positive',
  },
  open: {
    titleKey: 'statOpen',
    descKey: 'statOpenDesc',
    icon: CircleDot,
    trend: 'negative',
  },
  closed: {
    titleKey: 'statClosed',
    descKey: 'statClosedDesc',
    icon: CheckCircle2,
    trend: 'positive',
  },
}

export const IncidentsOverviewSection = ({
  stats,
  statTrends,
  isLoading = false,
  className,
}: IncidentsOverviewSectionProps) => {
  const { t } = useTranslation('incidents')

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <Skeleton className="h-3 w-24" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <motion.div key={index} {...fadeUp(index * 0.05)} className="overflow-hidden rounded-xl border border-border/80 bg-card p-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-4 h-8 w-16" />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
        {t('statsOverview')}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {statKeys.map((key, index) => {
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
              highlight={key === 'open' && stats.open > 0 ? String(stats.open) : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
