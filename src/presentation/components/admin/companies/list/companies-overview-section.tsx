import { Building2, CircleCheck, CircleOff } from 'lucide-react'
import { useMemo } from 'react'

import type { ManagedCompany } from '@/domain/entities'
import { DashboardStatCard } from '@/presentation/components/dashboard/widgets/stat-card'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'

interface CompaniesOverviewSectionProps {
  companies: ManagedCompany[]
  className?: string
}

export const CompaniesOverviewSection = ({
  companies,
  className,
}: CompaniesOverviewSectionProps) => {
  const { t } = useTranslation('companies')

  const stats = useMemo(() => {
    const total = companies.length
    const active = companies.filter((company) => company.isActive).length
    const inactive = total - active
    const totalBranches = companies.reduce((sum, company) => sum + company.branchesCount, 0)

    return { total, active, inactive, totalBranches }
  }, [companies])

  const cards = [
    {
      title: t('statTotal'),
      value: stats.total,
      description: t('statTotalDesc'),
      icon: Building2,
      sparklineData: [8, 9, 9, 10, 10, 11, 11, 12, 12, stats.total],
      sparklineTrend: 'positive' as const,
    },
    {
      title: t('statActive'),
      value: stats.active,
      description: t('statActiveDesc'),
      icon: CircleCheck,
      sparklineData: [6, 7, 7, 8, 8, 9, 9, 9, 10, stats.active],
      sparklineTrend: 'positive' as const,
    },
    {
      title: t('statInactive'),
      value: stats.inactive,
      description: t('statInactiveDesc'),
      icon: CircleOff,
      sparklineData: [3, 2, 2, 2, 3, 2, 2, 2, 3, stats.inactive],
      sparklineTrend: 'negative' as const,
    },
    {
      title: t('statBranches'),
      value: stats.totalBranches,
      description: t('statBranchesDesc'),
      icon: Building2,
      sparklineData: [28, 30, 32, 33, 35, 36, 38, 39, 40, stats.totalBranches],
      sparklineTrend: 'positive' as const,
    },
  ]

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {cards.map((card, index) => (
        <DashboardStatCard
          key={card.title}
          index={index}
          title={card.title}
          value={card.value}
          description={card.description}
          icon={card.icon}
          sparklineData={card.sparklineData}
          sparklineTrend={card.sparklineTrend}
        />
      ))}
    </div>
  )
}
