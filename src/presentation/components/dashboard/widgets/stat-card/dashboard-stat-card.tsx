import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/presentation/utils'
import { StatSparkline, type SparklineTrend } from './stat-sparkline'

const CARD_EASE = [0.25, 0.1, 0.25, 1] as const

export type StatTrendDirection = 'up' | 'down' | 'neutral'

export interface DashboardStatCardProps {
  title: string
  value: string | number
  description?: string
  highlight?: string
  trend?: {
    value: string
    label: string
    direction: StatTrendDirection
  }
  icon: LucideIcon
  sparklineData: number[]
  sparklineTrend?: SparklineTrend
  index?: number
  className?: string
}

const trendTextClass: Record<StatTrendDirection, string> = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-muted-foreground',
}

export const DashboardStatCard = ({
  title,
  value,
  description,
  highlight,
  trend,
  icon: Icon,
  sparklineData,
  sparklineTrend = 'positive',
  index = 0,
  className,
}: DashboardStatCardProps) => (
  <motion.article
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.42, ease: CARD_EASE, delay: index * 0.08 }}
    className={cn(
      'flex flex-col overflow-hidden rounded-xl border border-border/80 bg-[#f6f6f6] dark:bg-[#1a1a1a]',
      className,
    )}
  >
    <div
      className={cn(
        'relative flex items-start justify-between gap-3 px-4 pt-3 pb-2',
        'bg-[#]',
      )}
    >
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <Icon className="size-4 shrink-0 text-muted-foreground/70" strokeWidth={1.75} />
    </div>

    <div className="mx-2 mb-2 rounded-lg border border-border/60 bg-background px-3.5 py-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 + 0.12, ease: CARD_EASE }}
            className="text-[1.65rem] leading-none font-semibold tracking-tight text-foreground"
          >
            {value}
          </motion.p>

          {(trend || description || highlight) && (
            <div className="space-y-0.5 text-xs leading-snug">
              {trend && (
                <p className={cn('font-medium', trendTextClass[trend.direction])}>
                  {trend.value}{' '}
                  <span className="font-normal text-muted-foreground">{trend.label}</span>
                </p>
              )}

              {description && (
                <p className="truncate text-muted-foreground sm:whitespace-normal">
                  {description}
                  {highlight && (
                    <>
                      {' '}
                      <span className="font-medium text-red-600 dark:text-red-400">
                        ({highlight})
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        <StatSparkline
          data={sparklineData}
          trend={sparklineTrend}
          delay={index * 0.08 + 0.1}
        />
      </div>
    </div>
  </motion.article>
)
