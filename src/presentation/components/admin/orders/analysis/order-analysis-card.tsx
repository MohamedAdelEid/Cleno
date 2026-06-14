import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'

import { OrderAnalysisInterval } from '@/domain/enums'
import { DashboardPanelCard } from '@/presentation/components/dashboard/widgets/panel-card'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'
import { getOrderAnalysisSummary } from './order-analysis.data'
import { OrderAnalysisChart } from './order-analysis-chart'
import { OrderAnalysisIntervalFilter } from './order-analysis-interval-filter'
import { OrderAnalysisToggle, type OrderAnalysisMode } from './order-analysis-toggle'

const CARD_EASE = [0.25, 0.1, 0.25, 1] as const

const LEGEND_COLORS = {
  delivered: 'hsl(221 83% 53%)',
  cancelled: 'hsl(0 0% 62%)',
}

interface OrderAnalysisCardProps {
  index?: number
  className?: string
}

export const OrderAnalysisCard = ({ index = 3, className }: OrderAnalysisCardProps) => {
  const { t } = useTranslation('orders')
  const { isRtl } = useDirection()
  const [interval, setInterval] = useState<OrderAnalysisInterval>(OrderAnalysisInterval.Monthly)
  const [mode, setMode] = useState<OrderAnalysisMode>('line')

  const intervalLabels = useMemo(
    () => ({
      [OrderAnalysisInterval.Weekly]: t('analysisWeekly'),
      [OrderAnalysisInterval.Monthly]: t('analysisMonthly'),
      [OrderAnalysisInterval.Quarterly]: t('analysisQuarterly'),
    }),
    [t],
  )

  const summary = useMemo(
    () => getOrderAnalysisSummary(interval, isRtl),
    [interval, isRtl],
  )

  return (
    <DashboardPanelCard
      title={t('analysisTitle')}
      index={index}
      className={cn('flex flex-1 flex-col', className)}
      innerClassName="flex flex-1 flex-col p-4 sm:p-5"
      action={
        <div className="flex items-center gap-2">
          <OrderAnalysisToggle
            value={mode}
            onChange={setMode}
            labels={{ line: t('analysisLine'), bar: t('analysisBar') }}
          />
          <OrderAnalysisIntervalFilter
            value={interval}
            onChange={setInterval}
            labels={intervalLabels}
          />
        </div>
      }
    >
      <div className="flex flex-1 flex-col space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
            <div>
              <p className="text-xs text-muted-foreground">{t('analysisTotalOrders')}</p>
              <motion.p
                key={`${interval}-total`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: CARD_EASE }}
                className="text-2xl leading-tight font-semibold tracking-tight text-foreground"
              >
                {summary.totalOrders.toLocaleString()}
              </motion.p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('analysisFulfillmentRate')}</p>
              <motion.p
                key={`${interval}-rate`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05, ease: CARD_EASE }}
                className="text-2xl leading-tight font-semibold tracking-tight text-foreground"
              >
                {summary.fulfillmentRate.toFixed(1)}%
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <LegendItem color={LEGEND_COLORS.delivered} label={t('analysisLegendDelivered')} />
            <LegendItem color={LEGEND_COLORS.cancelled} label={t('analysisLegendCancelled')} />
          </div>
        </div>

        <OrderAnalysisChart
          summary={summary}
          mode={mode}
          labels={{
            delivered: t('analysisTooltipDelivered'),
            cancelled: t('analysisTooltipCancelled'),
          }}
        />
      </div>
    </DashboardPanelCard>
  )
}

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
    {label}
  </span>
)
