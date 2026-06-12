import { isSameDay } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'

import {
  ORDER_VOLUME_Y_AXIS_MAX,
  ORDER_VOLUME_Y_AXIS_TICK_COUNT,
} from '@/domain/constants'
import type { DailyOrderVolume } from '@/domain/types'
import { cn } from '@/presentation/utils'

const CARD_EASE = [0.25, 0.1, 0.25, 1] as const
const CHART_HEIGHT = 200
const Y_AXIS_WIDTH = 36

interface OrderVolumeBarsProps {
  data: DailyOrderVolume[]
  className?: string
}

const buildYAxis = () => {
  const max = ORDER_VOLUME_Y_AXIS_MAX
  const tickCount = Math.max(ORDER_VOLUME_Y_AXIS_TICK_COUNT, 2)
  const ticks = Array.from({ length: tickCount }, (_, index) =>
    Math.round((max / (tickCount - 1)) * index),
  )

  return { max, ticks }
}

export const OrderVolumeBars = ({ data, className }: OrderVolumeBarsProps) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const todayIndex = useMemo(() => {
    const now = new Date()
    return data.findIndex((item) => isSameDay(new Date(item.date), now))
  }, [data])

  const highlightedIndex = hoverIndex ?? (todayIndex >= 0 ? todayIndex : null)

  const { max, ticks } = useMemo(() => buildYAxis(), [])

  const highlightedItem =
    highlightedIndex !== null ? data[highlightedIndex] : null
  const highlightedBarTop =
    highlightedItem !== null && highlightedItem !== undefined
      ? CHART_HEIGHT - Math.min(highlightedItem.orders / max, 1) * CHART_HEIGHT
      : null

  return (
    <div className={cn('relative w-full', className)}>
      <div className="flex gap-3">
        <div className="relative min-w-0 flex-1">
          <div
            className="relative px-1"
            style={{ height: CHART_HEIGHT }}
            onMouseLeave={() => setHoverIndex(null)}
          >
            {ticks.map((tick) => {
              const top = CHART_HEIGHT - (tick / max) * CHART_HEIGHT

              return (
                <div
                  key={tick}
                  className="pointer-events-none absolute right-0 left-0 border-t border-dashed border-border/70"
                  style={{ top }}
                />
              )
            })}

            <div className="absolute inset-x-1 bottom-0 top-0 z-0 flex items-end justify-between gap-0.5">
              {data.map((item, index) => {
                const height = Math.min(item.orders / max, 1) * CHART_HEIGHT
                const isHighlighted = highlightedIndex === index
                const isHovered = hoverIndex === index

                return (
                  <div
                    key={item.date}
                    className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                    onMouseEnter={() => setHoverIndex(index)}
                  >
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          key={`tooltip-${item.date}`}
                          initial={{ opacity: 0, y: 6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.96 }}
                          transition={{ duration: 0.2, ease: CARD_EASE }}
                          className="pointer-events-none absolute bottom-full z-20 mb-2 rounded-lg bg-foreground px-2.5 py-1.5 text-center text-background shadow-sm"
                          style={{ bottom: `calc(${height}px + 8px)` }}
                        >
                          <p className="text-[11px] font-medium whitespace-nowrap">
                            {item.dateLabel}
                          </p>
                          <p className="text-[10px] opacity-80">
                            {item.orders.toLocaleString()}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="button"
                      aria-label={`${item.dateLabel}: ${item.orders}`}
                      className={cn(
                        'origin-bottom w-full max-w-8 rounded-t-md transition-colors duration-200',
                        isHighlighted
                          ? 'bg-foreground'
                          : 'bg-muted/80 hover:bg-muted-foreground/35 dark:bg-muted/60',
                      )}
                      style={{ height }}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      whileHover={{ scaleX: 1.08 }}
                      transition={{
                        scaleY: {
                          duration: 0.55,
                          delay: index * 0.035 + 0.15,
                          ease: CARD_EASE,
                        },
                        opacity: { duration: 0.3, delay: index * 0.03 + 0.1 },
                        scaleX: { duration: 0.2, ease: 'easeOut' },
                      }}
                    />
                  </div>
                )
              })}
            </div>

            <AnimatePresence>
              {highlightedItem && highlightedBarTop !== null && (
                <motion.div
                  key={`guide-${highlightedItem.date}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="pointer-events-none absolute right-0 left-0 z-10 border-t border-dashed border-foreground/55"
                  style={{ top: highlightedBarTop }}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="mt-2 flex justify-between gap-0.5 px-1">
            {data.map((item, index) => {
              const showLabel =
                data.length <= 14 || index % Math.ceil(data.length / 10) === 0

              return (
                <span
                  key={`label-${item.date}`}
                  className={cn(
                    'min-w-0 flex-1 truncate text-center text-[10px] text-muted-foreground',
                    !showLabel && 'opacity-0',
                    highlightedIndex === index && 'font-medium text-foreground',
                  )}
                >
                  {item.label}
                </span>
              )
            })}
          </div>
        </div>

        <div
          className="relative shrink-0 text-[10px] text-muted-foreground"
          style={{ width: Y_AXIS_WIDTH, height: CHART_HEIGHT }}
        >
          {ticks
            .slice()
            .reverse()
            .map((tick) => {
              const top = CHART_HEIGHT - (tick / max) * CHART_HEIGHT

              return (
                <span
                  key={tick}
                  className="absolute end-0 -translate-y-1/2 tabular-nums"
                  style={{ top }}
                >
                  {tick.toLocaleString()}
                </span>
              )
            })}

          <AnimatePresence>
            {highlightedItem && highlightedBarTop !== null && (
              <motion.span
                key={`axis-dot-${highlightedItem.date}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute end-0 size-1.5 -translate-y-1/2 rounded-full bg-foreground"
                style={{ top: highlightedBarTop }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
