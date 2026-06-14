import { ClipboardList, Receipt, Truck } from 'lucide-react'

import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'
import { ordersOverviewStats } from '../orders.data'
import { OrderStatCardShell } from './order-stat-card-shell'
import { StatDualProgress } from './stat-dual-progress'
import { StatOrdersSparkline } from './stat-orders-sparkline'
import { StatSegmentedBars } from './stat-segmented-bars'

interface OrdersOverviewSectionProps {
  className?: string
}

export const OrdersOverviewSection = ({ className }: OrdersOverviewSectionProps) => {
  const { t } = useTranslation('orders')
  const stats = ordersOverviewStats

  const totalPositive = stats.totalTrendPercent >= 0
  const totalTrendFormatted = `${totalPositive ? '+' : ''}${stats.totalTrendPercent.toFixed(1)}%`

  const activePositive = stats.activeTrendPercent >= 0
  const activeTrendFormatted = `${activePositive ? '+' : ''}${stats.activeTrendPercent.toFixed(1)}%`

  const totalDelivered = stats.deliveredOnTime + stats.deliveredDelayed
  const onTimeRatio = totalDelivered === 0 ? 0 : stats.deliveredOnTime / totalDelivered
  const delayedRatio = totalDelivered === 0 ? 0 : stats.deliveredDelayed / totalDelivered

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', className)}>
      <OrderStatCardShell
        title={t('statTotalOrders')}
        icon={ClipboardList}
        info={t('statTotalOrdersInfo')}
        index={0}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-[1.75rem] leading-none font-semibold tracking-tight text-foreground">
              {stats.totalOrders.toLocaleString()}
            </p>
            <p
              className={cn(
                'text-xs font-medium',
                totalPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {totalTrendFormatted}{' '}
              <span className="font-normal text-muted-foreground">{t('statTotalOrdersTrend')}</span>
            </p>
          </div>
          <StatOrdersSparkline
            data={stats.totalSparkline}
            peakLabel={stats.totalSparklinePeakLabel}
          />
        </div>
      </OrderStatCardShell>

      <OrderStatCardShell
        title={t('statActiveOrders')}
        icon={Receipt}
        info={t('statActiveOrdersInfo')}
        index={1}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-[1.75rem] leading-none font-semibold tracking-tight text-foreground">
              {stats.activeOrders.toLocaleString()}
            </p>
            <p
              className={cn(
                'text-xs font-medium',
                activePositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {activeTrendFormatted}{' '}
              <span className="font-normal text-muted-foreground">{t('statTotalOrdersTrend')}</span>
            </p>
          </div>
          <StatSegmentedBars
            bars={stats.activeSegmentedBars}
            highlightIndex={stats.activeHighlightIndex}
            tooltipValue={(bar) =>
              t('statActiveBarsTooltip', {
                day: bar.label ?? '',
                count: bar.value ?? 0,
              })
            }
          />
        </div>
      </OrderStatCardShell>

      <OrderStatCardShell
        title={t('statDeliveryPerformance')}
        icon={Truck}
        info={t('statDeliveryPerformanceInfo')}
        index={2}
        className="sm:col-span-2 xl:col-span-1"
      >
        <StatDualProgress
          primaryValue={stats.deliveredOnTime}
          primaryLabel={t('statOnTime')}
          primaryRatio={onTimeRatio}
          secondaryValue={stats.deliveredDelayed}
          secondaryLabel={t('statDelayed')}
          secondaryRatio={delayedRatio}
        />
      </OrderStatCardShell>
    </div>
  )
}
