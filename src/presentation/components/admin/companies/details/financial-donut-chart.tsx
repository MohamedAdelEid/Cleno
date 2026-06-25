import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'

import type { CompanyFinancials } from '@/domain/entities/company-details.entity'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, PAGE_EASE } from '@/presentation/utils'

interface DonutSegment {
  key: 'paid' | 'pending' | 'overdue'
  value: number
  label: string
  color: string
  trackColor: string
}

interface FinancialDonutChartProps {
  financials: CompanyFinancials
}

const SIZE = 140
const STROKE = 22
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export const FinancialDonutChart = ({ financials }: FinancialDonutChartProps) => {
  const { t } = useTranslation('companies')
  const [hoveredKey, setHoveredKey] = useState<DonutSegment['key'] | null>(null)

  const segments: DonutSegment[] = useMemo(
    () => [
      {
        key: 'paid',
        value: financials.paidInvoices,
        label: t('detailsPaidInvoices'),
        color: 'hsl(142 71% 45%)',
        trackColor: 'hsl(142 71% 45% / 0.15)',
      },
      {
        key: 'pending',
        value: financials.pendingInvoices,
        label: t('detailsPendingInvoicesLabel'),
        color: 'hsl(38 92% 50%)',
        trackColor: 'hsl(38 92% 50% / 0.15)',
      },
      {
        key: 'overdue',
        value: financials.overdueInvoices,
        label: t('detailsOverdueInvoicesLabel'),
        color: 'hsl(0 72% 51%)',
        trackColor: 'hsl(0 72% 51% / 0.15)',
      },
    ],
    [financials, t],
  )

  const total = financials.totalInvoices
  const activeSegment = segments.find((s) => s.key === hoveredKey)

  let offset = 0
  const arcs = segments.map((segment) => {
    const fraction = total > 0 ? segment.value / total : 0
    const dash = fraction * CIRCUMFERENCE
    const arc = {
      ...segment,
      dash,
      gap: CIRCUMFERENCE - dash,
      rotation: offset,
    }
    offset += fraction * 360
    return arc
  })

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
      <div className="relative shrink-0">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-muted/30"
          />
          {arcs.map((arc) => (
            arc.value > 0 && (
              <circle
                key={arc.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeDasharray={`${arc.dash} ${arc.gap}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                transform={`rotate(${arc.rotation} ${SIZE / 2} ${SIZE / 2})`}
                className={cn(
                  'cursor-pointer transition-opacity duration-200',
                  hoveredKey && hoveredKey !== arc.key && 'opacity-40',
                )}
                onMouseEnter={() => setHoveredKey(arc.key)}
                onMouseLeave={() => setHoveredKey(null)}
              />
            )
          ))}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {activeSegment ? (
              <motion.div
                key={activeSegment.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15, ease: PAGE_EASE }}
              >
                <p className="text-2xl font-semibold tabular-nums text-foreground">{activeSegment.value}</p>
                <p className="text-[10px] text-muted-foreground">{activeSegment.label}</p>
              </motion.div>
            ) : (
              <motion.div
                key="total"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15, ease: PAGE_EASE }}
              >
                <p className="text-2xl font-semibold tabular-nums text-foreground">{total}</p>
                <p className="text-[10px] text-muted-foreground">{t('detailsTotalInvoices')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col gap-2">
        {segments.map((segment) => (
          <button
            key={segment.key}
            type="button"
            onMouseEnter={() => setHoveredKey(segment.key)}
            onMouseLeave={() => setHoveredKey(null)}
            className={cn(
              'flex items-center justify-between rounded-lg px-3 py-2 text-start transition-colors',
              hoveredKey === segment.key ? 'bg-muted/50' : 'hover:bg-muted/30',
            )}
          >
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
              {segment.label}
            </span>
            <span className="text-sm font-semibold tabular-nums text-foreground">{segment.value}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
