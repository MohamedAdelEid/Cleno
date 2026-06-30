import {
  AlertTriangle,
  ClipboardList,
  Clock,
  Package,
  PackageCheck,
  Shirt,
  Truck,
  Users,
  Wallet,
} from 'lucide-react'
import { useMemo } from 'react'

import { dashboardAdapter } from '@/application/adapters/dashboard.adapter'
import type { AdminDashboardKpis } from '@/domain/types'
import { ActiveDriversCard } from './active-drivers'
import { AlertsCard } from './alerts'
import { LatestUpdatesCard } from './latest-updates'
import { OrderVolumeCard } from './order-volume'
import {
  DashboardStatCard,
  type DashboardStatCardProps,
} from '@/presentation/components/dashboard/widgets/stat-card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, fadeUp } from '@/presentation/utils'
import { motion } from 'framer-motion'
import type { ActiveDriver } from '@/domain/entities'
import type { DashboardAlert } from '@/domain/entities'
import { OrderVolumePeriod } from '@/domain/enums'
import type { OrderVolumeSummary } from '@/domain/types'
import type { ActivityItem } from './latest-updates/latest-updates.types'
import type { UpdatesFilter } from './latest-updates/latest-updates.types'

const KPI_SKELETON_COUNT = 9

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

interface DashboardStatsProps {
  kpis: AdminDashboardKpis | null
  isKpisLoading: boolean
  orderVolume: OrderVolumeSummary | null
  orderVolumePeriod: OrderVolumePeriod
  onOrderVolumePeriodChange: (period: OrderVolumePeriod) => void
  isOrderVolumeLoading: boolean
  activeDrivers: ActiveDriver[]
  isActiveDriversLoading: boolean
  alerts: DashboardAlert[]
  isAlertsLoading: boolean
  activityItems: ActivityItem[]
  activityTotalCount: number
  activityFilter: UpdatesFilter
  onActivityFilterChange: (filter: UpdatesFilter) => void
  activityCustomDate: Date | undefined
  onActivityCustomDateChange: (date: Date | undefined) => void
  activitySearch: string
  onActivitySearchChange: (search: string) => void
  isActivityLoading: boolean
}

export const DashboardStats = ({
  kpis,
  isKpisLoading,
  orderVolume,
  orderVolumePeriod,
  onOrderVolumePeriodChange,
  isOrderVolumeLoading,
  activeDrivers,
  isActiveDriversLoading,
  alerts,
  isAlertsLoading,
  activityItems,
  activityTotalCount,
  activityFilter,
  onActivityFilterChange,
  activityCustomDate,
  onActivityCustomDateChange,
  activitySearch,
  onActivitySearchChange,
  isActivityLoading,
}: DashboardStatsProps) => {
  const { t } = useTranslation('dashboard')

  const stats = useMemo((): DashboardStatCardProps[] => {
    if (!kpis) return []

    const vsLastWeek = t('statsVsLastWeek')

    const buildCard = (
      title: string,
      description: string,
      icon: DashboardStatCardProps['icon'],
      data: { count: number; deltaPercent: number; sparkline: number[] },
      invertSparkline = false,
      highlight?: string,
    ): DashboardStatCardProps => ({
      title,
      value: data.count >= 1000 ? data.count.toLocaleString() : data.count,
      description,
      highlight,
      trend: {
        value: dashboardAdapter.formatDeltaPercent(data.deltaPercent),
        label: vsLastWeek,
        direction: dashboardAdapter.toTrendDirection(data.deltaPercent),
      },
      icon,
      sparklineData: data.sparkline,
      sparklineTrend: dashboardAdapter.toSparklineTrend(data.deltaPercent, invertSparkline),
    })

    return [
      buildCard(
        t('statsActiveOrders'),
        t('statsActiveOrdersDesc'),
        ClipboardList,
        kpis.activeOrders,
      ),
      buildCard(t('statsInLaundry'), t('statsInLaundryDesc'), Shirt, kpis.inLaundry),
      buildCard(
        t('statsOutstanding'),
        t('statsOutstandingDesc'),
        Wallet,
        kpis.outstanding,
        true,
        kpis.outstanding.overdueCount > 0
          ? t('statsOverdue', { count: kpis.outstanding.overdueCount })
          : undefined,
      ),
      buildCard(
        t('statsActiveCustomers'),
        t('statsActiveCustomersDesc'),
        Users,
        kpis.activeCustomers,
      ),
      buildCard(
        t('statsBagsCirculating'),
        t('statsBagsCirculatingDesc'),
        Package,
        kpis.bagsCirculating,
      ),
      buildCard(
        t('statsReadyForPickup'),
        t('statsReadyForPickupDesc'),
        PackageCheck,
        kpis.readyForPickup,
      ),
      buildCard(
        t('statsOutForDelivery'),
        t('statsOutForDeliveryDesc'),
        Truck,
        kpis.outForDelivery,
      ),
      buildCard(
        t('statsDelayedOrders'),
        t('statsDelayedOrdersDesc'),
        Clock,
        kpis.delayedOrders,
        true,
        kpis.delayedOrders.criticalCount > 0
          ? t('statsDelayedCritical', { count: kpis.delayedOrders.criticalCount })
          : undefined,
      ),
      buildCard(
        t('statsOpenIncidents'),
        t('statsOpenIncidentsDesc'),
        AlertTriangle,
        kpis.openIncidents,
        true,
        kpis.openIncidents.escalatedCount > 0
          ? t('statsIncidentsEscalated', { count: kpis.openIncidents.escalatedCount })
          : undefined,
      ),
    ]
  }, [kpis, t])

  return (
    <div
      className={cn(
        'grid items-start gap-5 xl:items-stretch',
        'grid-cols-1',
        'xl:grid-cols-[minmax(0,1fr)_clamp(280px,28vw,420px)]',
        '2xl:grid-cols-[minmax(0,1fr)_450px]',
      )}
    >
      <div className="flex min-w-0 flex-col gap-5">
        <div
          className={cn(
            'grid min-w-0 grid-cols-1 gap-4',
            'min-[520px]:grid-cols-2',
            'xl:grid-cols-3',
          )}
        >
          {isKpisLoading
            ? Array.from({ length: KPI_SKELETON_COUNT }, (_, index) => (
                <OverviewSkeletonCard key={index} index={index} />
              ))
            : stats.map((stat, index) => (
                <DashboardStatCard
                  key={stat.title}
                  {...stat}
                  index={index}
                  className="min-w-0 self-start"
                />
              ))}
        </div>

        <div
          className={cn(
            'grid min-w-0 gap-4',
            'grid-cols-1',
            'min-[900px]:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]',
            'xl:grid-cols-[minmax(0,1fr)_260px]',
            '2xl:grid-cols-[minmax(0,1fr)_280px]',
          )}
        >
          <OrderVolumeCard
            className="min-w-0"
            summary={orderVolume}
            period={orderVolumePeriod}
            onPeriodChange={onOrderVolumePeriodChange}
            isLoading={isOrderVolumeLoading}
          />
          <ActiveDriversCard
            className="min-w-0 self-stretch"
            drivers={activeDrivers}
            isLoading={isActiveDriversLoading}
          />
        </div>
      </div>

      <div
        className={cn(
          'flex min-w-0 flex-col gap-4',
          'w-full self-start',
          'xl:h-full xl:min-h-0 xl:self-stretch',
        )}
      >
        <LatestUpdatesCard
          index={9}
          className="min-h-0 min-w-0 flex-1"
          items={activityItems}
          totalCount={activityTotalCount}
          filter={activityFilter}
          onFilterChange={onActivityFilterChange}
          customDate={activityCustomDate}
          onCustomDateChange={onActivityCustomDateChange}
          searchQuery={activitySearch}
          onSearchQueryChange={onActivitySearchChange}
          isLoading={isActivityLoading}
        />
        <AlertsCard className="min-w-0 shrink-0" alerts={alerts} isLoading={isAlertsLoading} />
      </div>
    </div>
  )
}
