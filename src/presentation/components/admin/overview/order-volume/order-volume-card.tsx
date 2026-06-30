import { motion } from 'framer-motion'
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'

import { OrderVolumePeriod } from '@/domain/enums'
import type { OrderVolumeSummary } from '@/domain/types'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'
import { DashboardPanelCard } from '@/presentation/components/dashboard/widgets/panel-card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { OrderVolumeBars } from './order-volume-bars'
import { OrderVolumePeriodFilter } from './order-volume-period-filter'

const CARD_EASE = [0.25, 0.1, 0.25, 1] as const

interface OrderVolumeCardProps {
  index?: number
  className?: string
  summary: OrderVolumeSummary | null
  period: OrderVolumePeriod
  onPeriodChange: (period: OrderVolumePeriod) => void
  isLoading?: boolean
}

export const OrderVolumeCard = ({
  index = 9,
  className,
  summary,
  period,
  onPeriodChange,
  isLoading = false,
}: OrderVolumeCardProps) => {
  const { t } = useTranslation('dashboard')

  const periodLabels = useMemo(
    () => ({
      [OrderVolumePeriod.LastWeek]: t('orderVolumeLastWeek'),
      [OrderVolumePeriod.Last14Days]: t('orderVolumeLast14Days'),
      [OrderVolumePeriod.LastMonth]: t('orderVolumeLastMonth'),
    }),
    [t],
  )

  const isPositive = (summary?.changePercent ?? 0) >= 0
  const changeFormatted = summary
    ? `${isPositive ? '+' : ''}${summary.changePercent.toFixed(1)}%`
    : '—'

  return (
    <DashboardPanelCard
      title={t('orderVolumeTitle')}
      icon={BarChart3}
      index={index}
      className={className}
      innerClassName="px-4 py-3"
      action={
        <OrderVolumePeriodFilter
          value={period}
          onChange={onPeriodChange}
          labels={periodLabels}
        />
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          {isLoading ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <motion.p
              key={`${period}-total`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: CARD_EASE }}
              className="text-[1.75rem] leading-none font-semibold tracking-tight text-foreground"
            >
              {(summary?.total ?? 0).toLocaleString()}
            </motion.p>
          )}

          {!isLoading && summary && (
            <motion.div
              key={`${period}-trend`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.08, ease: CARD_EASE }}
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium',
                isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {isPositive ? (
                <TrendingUp className="size-3.5" strokeWidth={2} />
              ) : (
                <TrendingDown className="size-3.5" strokeWidth={2} />
              )}
              <span>
                {changeFormatted} {t('orderVolumeVsPrevious')}
              </span>
            </motion.div>
          )}
        </div>

        {isLoading ? (
          <Skeleton className="h-4 w-56" />
        ) : (
          <motion.div
            key={`${period}-meta`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.12, ease: CARD_EASE }}
            className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"
          >
            <span>
              {t('orderVolumeAvgDaily')}:{' '}
              <span className="font-medium text-foreground">
                {(summary?.average ?? 0).toLocaleString()}
              </span>
            </span>
            <span>
              {t('orderVolumePeakDay')}:{' '}
              <span className="font-medium text-foreground">
                {summary?.peakDay.label ?? '—'} (
                {(summary?.peakDay.orders ?? 0).toLocaleString()})
              </span>
            </span>
          </motion.div>
        )}

        {isLoading ? (
          <Skeleton className="h-[200px] w-full rounded-lg" />
        ) : (
          <OrderVolumeBars data={summary?.data ?? []} />
        )}
      </div>
    </DashboardPanelCard>
  )
}
