import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Briefcase,
  CircleCheck,
  CircleOff,
  ClipboardList,
  Package,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { OperationalBagStatTrends, OperationalBagStats } from '@/domain/entities'
import { DashboardStatCard } from '@/presentation/components/dashboard/widgets/stat-card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, fadeUp } from '@/presentation/utils'

interface BagsOverviewSectionProps {
  stats: OperationalBagStats
  statTrends: OperationalBagStatTrends
  isLoading?: boolean
  className?: string
}

type StatKey = keyof OperationalBagStats

const inventoryStats: StatKey[] = ['totalBags', 'activeBags', 'inactiveBags']
const operationsStats: StatKey[] = ['assignedBags', 'processingBags', 'missingBags', 'readyBags']

const statConfig: Record<StatKey, { titleKey: string; descKey: string }> = {
  totalBags: { titleKey: 'statTotalBags', descKey: 'statTotalBagsDesc' },
  activeBags: { titleKey: 'statActiveBags', descKey: 'statActiveBagsDesc' },
  inactiveBags: { titleKey: 'statInactiveBags', descKey: 'statInactiveBagsDesc' },
  assignedBags: { titleKey: 'statAssignedBags', descKey: 'statAssignedBagsDesc' },
  processingBags: { titleKey: 'statProcessingBags', descKey: 'statProcessingBagsDesc' },
  missingBags: { titleKey: 'statMissingBags', descKey: 'statMissingBagsDesc' },
  readyBags: { titleKey: 'statReadyBags', descKey: 'statReadyBagsDesc' },
}

const statIcons: Record<StatKey, LucideIcon> = {
  totalBags: Package,
  activeBags: CircleCheck,
  inactiveBags: CircleOff,
  assignedBags: Briefcase,
  processingBags: ClipboardList,
  missingBags: AlertTriangle,
  readyBags: Sparkles,
}

const statSparklineTrend: Record<StatKey, 'positive' | 'negative'> = {
  totalBags: 'positive',
  activeBags: 'positive',
  inactiveBags: 'negative',
  assignedBags: 'positive',
  processingBags: 'positive',
  missingBags: 'negative',
  readyBags: 'positive',
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
  stats: OperationalBagStats
  statTrends: OperationalBagStatTrends
  startIndex: number
}) => {
  const { t } = useTranslation('operationalBags')

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
        {title}
      </h3>
      <div
        className={cn(
          'grid gap-3',
          keys.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 xl:grid-cols-4',
        )}
      >
        {keys.map((key, index) => {
          const config = statConfig[key]
          return (
            <DashboardStatCard
              key={key}
              index={startIndex + index}
              title={t(config.titleKey)}
              value={stats[key]}
              description={t(config.descKey)}
              icon={statIcons[key]}
              sparklineData={statTrends[key] ?? []}
              sparklineTrend={statSparklineTrend[key]}
              highlight={
                key === 'missingBags' && stats.missingBags > 0
                  ? String(stats.missingBags)
                  : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}

export const BagsOverviewSection = ({
  stats,
  statTrends,
  isLoading = false,
  className,
}: BagsOverviewSectionProps) => {
  const { t } = useTranslation('operationalBags')

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <OverviewSkeletonCard key={index} index={index} />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <OverviewSkeletonCard key={index + 3} index={index + 3} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      <StatGroup
        title={t('statsInventory')}
        keys={inventoryStats}
        stats={stats}
        statTrends={statTrends}
        startIndex={0}
      />
      <StatGroup
        title={t('statsOperations')}
        keys={operationsStats}
        stats={stats}
        statTrends={statTrends}
        startIndex={3}
      />
    </div>
  )
}
