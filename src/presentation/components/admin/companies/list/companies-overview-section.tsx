import { Building2, CircleCheck, CircleOff } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMemo } from 'react'

import type { CompanyStat, CompanyStatKey } from '@/domain/types'
import { DashboardStatCard } from '@/presentation/components/dashboard/widgets/stat-card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, fadeUp } from '@/presentation/utils'
import { motion } from 'framer-motion'

interface CompaniesOverviewSectionProps {
  stats: CompanyStat[]
  isLoading?: boolean
  className?: string
}

const statCardConfig: Record<
  CompanyStatKey,
  {
    titleKey: 'statTotal' | 'statActive' | 'statInactive' | 'statBranches'
    descriptionKey: 'statTotalDesc' | 'statActiveDesc' | 'statInactiveDesc' | 'statBranchesDesc'
    icon: LucideIcon
    sparklineTrend: 'positive' | 'negative'
  }
> = {
  totalCompanies: {
    titleKey: 'statTotal',
    descriptionKey: 'statTotalDesc',
    icon: Building2,
    sparklineTrend: 'positive',
  },
  activeCompanies: {
    titleKey: 'statActive',
    descriptionKey: 'statActiveDesc',
    icon: CircleCheck,
    sparklineTrend: 'positive',
  },
  inactiveCompanies: {
    titleKey: 'statInactive',
    descriptionKey: 'statInactiveDesc',
    icon: CircleOff,
    sparklineTrend: 'negative',
  },
  totalBranches: {
    titleKey: 'statBranches',
    descriptionKey: 'statBranchesDesc',
    icon: Building2,
    sparklineTrend: 'positive',
  },
}

const statOrder: CompanyStatKey[] = [
  'totalCompanies',
  'activeCompanies',
  'inactiveCompanies',
  'totalBranches',
]

const OverviewSkeletonCard = ({ index }: { index: number }) => (
  <motion.div
    {...fadeUp(index * 0.06)}
    className="overflow-hidden rounded-xl border border-border/80 bg-[#f6f6f6] dark:bg-[#1a1a1a]"
  >
    <div className="flex items-start justify-between gap-3 px-4 pt-3 pb-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="size-4 rounded-md" />
    </div>
    <div className="mx-2 mb-2 rounded-lg border border-border/60 bg-background px-3.5 py-3">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  </motion.div>
)

export const CompaniesOverviewSection = ({
  stats,
  isLoading = false,
  className,
}: CompaniesOverviewSectionProps) => {
  const { t } = useTranslation('companies')

  const statsByKey = useMemo(
    () => new Map(stats.map((stat) => [stat.key, stat])),
    [stats],
  )

  if (isLoading) {
    return (
      <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>
        {statOrder.map((_, index) => (
          <OverviewSkeletonCard key={index} index={index} />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {statOrder.map((key, index) => {
        const stat = statsByKey.get(key)
        const config = statCardConfig[key]

        return (
          <DashboardStatCard
            key={key}
            index={index}
            title={t(config.titleKey)}
            value={stat?.value ?? 0}
            description={t(config.descriptionKey)}
            icon={config.icon}
            sparklineData={stat?.sparkline.map((point) => point.value) ?? []}
            sparklineTrend={config.sparklineTrend}
          />
        )
      })}
    </div>
  )
}
