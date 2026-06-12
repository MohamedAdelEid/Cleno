import { motion } from 'framer-motion'
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'

import { OrderVolumePeriod } from '@/domain/enums'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'
import { DashboardPanelCard } from '@/presentation/components/dashboard/widgets/panel-card'
import { getOrderVolumeSummary } from './order-volume.data'
import { OrderVolumeBars } from './order-volume-bars'
import { OrderVolumePeriodFilter } from './order-volume-period-filter'

const CARD_EASE = [0.25, 0.1, 0.25, 1] as const

interface OrderVolumeCardProps {
  index?: number
  className?: string
}

export const OrderVolumeCard = ({ index = 9, className }: OrderVolumeCardProps) => {
  const { t } = useTranslation('dashboard')
  const { isRtl } = useDirection()
  const [period, setPeriod] = useState<OrderVolumePeriod>(OrderVolumePeriod.Last14Days)

  const periodLabels = useMemo(
    () => ({
      [OrderVolumePeriod.LastWeek]: t('orderVolumeLastWeek'),
      [OrderVolumePeriod.Last14Days]: t('orderVolumeLast14Days'),
      [OrderVolumePeriod.LastMonth]: t('orderVolumeLastMonth'),
    }),
    [t],
  )

  const summary = useMemo(
    () => getOrderVolumeSummary(period, isRtl),
    [period, isRtl],
  )

  const isPositive = summary.changePercent >= 0
  const changeFormatted = `${isPositive ? '+' : ''}${summary.changePercent.toFixed(1)}%`

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
          onChange={setPeriod}
          labels={periodLabels}
        />
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <motion.p
            key={`${period}-total`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: CARD_EASE }}
            className="text-[1.75rem] leading-none font-semibold tracking-tight text-foreground"
          >
            {summary.total.toLocaleString()}
          </motion.p>

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
        </div>

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
              {summary.average.toLocaleString()}
            </span>
          </span>
          <span>
            {t('orderVolumePeakDay')}:{' '}
            <span className="font-medium text-foreground">
              {summary.peakDay.label} ({summary.peakDay.orders.toLocaleString()})
            </span>
          </span>
        </motion.div>

        <OrderVolumeBars data={summary.data} />
      </div>
    </DashboardPanelCard>
  )
}
