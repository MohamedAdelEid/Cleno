import { AnimatePresence, motion } from 'framer-motion'
import { useId, useMemo, useState } from 'react'

import type { OrderAnalysisSummary } from '@/domain/types'
import { cn } from '@/presentation/utils'
import type { OrderAnalysisMode } from './order-analysis-toggle'

const CARD_EASE = [0.25, 0.1, 0.25, 1] as const
const INSET_X = 2.5
const TICK_COUNT = 5
const Y_GUTTER = 36

const COLORS = {
  delivered: 'hsl(221 83% 53%)',
  cancelled: 'hsl(0 0% 62%)',
}

interface OrderAnalysisChartProps {
  summary: OrderAnalysisSummary
  mode: OrderAnalysisMode
  labels: {
    delivered: string
    cancelled: string
  }
  className?: string
}

type Point = { x: number; y: number }

const buildSmoothPath = (points: Point[]) => {
  if (points.length === 0) return ''
  if (points.length < 3) {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  }

  let path = `M ${points[0]!.x} ${points[0]!.y}`
  const smoothing = 0.18

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]!
    const p1 = points[i]!
    const p2 = points[i + 1]!
    const p3 = points[i + 2] ?? p2

    const c1x = p1.x + (p2.x - p0.x) * smoothing
    const c1y = p1.y + (p2.y - p0.y) * smoothing
    const c2x = p2.x - (p3.x - p1.x) * smoothing
    const c2y = p2.y - (p3.y - p1.y) * smoothing

    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }

  return path
}

export const OrderAnalysisChart = ({
  summary,
  mode,
  labels,
  className,
}: OrderAnalysisChartProps) => {
  const gradientId = useId()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const { points, axisMax } = summary
  const count = points.length

  const xPercent = (index: number) =>
    count <= 1 ? 50 : INSET_X + (index / (count - 1)) * (100 - INSET_X * 2)

  const volumeAt = (point: (typeof points)[number]) => point.delivered + point.cancelled
  const yPercent = (value: number) => 100 - (value / axisMax) * 100

  const { deliveredPath, deliveredArea, cancelledPath } = useMemo(() => {
    const deliveredPoints = points.map((point, index) => ({
      x: xPercent(index),
      y: yPercent(point.delivered),
    }))
    const cancelledPoints = points.map((point, index) => ({
      x: xPercent(index),
      y: yPercent(point.cancelled),
    }))

    const deliveredLine = buildSmoothPath(deliveredPoints)
    const first = deliveredPoints[0]!
    const last = deliveredPoints[deliveredPoints.length - 1]!

    return {
      deliveredPath: deliveredLine,
      deliveredArea: `${deliveredLine} L ${last.x} 100 L ${first.x} 100 Z`,
      cancelledPath: buildSmoothPath(cancelledPoints),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, axisMax])

  const ticks = useMemo(
    () =>
      Array.from({ length: TICK_COUNT }, (_, index) =>
        Math.round((axisMax / (TICK_COUNT - 1)) * index),
      ),
    [axisMax],
  )

  const groupWidth = (100 - INSET_X * 2) / count
  const barWidth = Math.min(groupWidth * 0.3, 3)

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    const index = Math.round(ratio * (count - 1))
    setHoverIndex(Math.min(Math.max(index, 0), count - 1))
  }

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null
  const tooltipLeft =
    hoverIndex !== null ? Math.min(Math.max(xPercent(hoverIndex), 18), 82) : 50

  return (
    <div className={cn('flex min-h-[280px] flex-1 flex-col select-none', className)} dir="ltr">
      <div className="flex min-h-0 flex-1 gap-2">
        <div className="relative shrink-0 self-stretch" style={{ width: Y_GUTTER }}>
          {ticks
            .slice()
            .reverse()
            .map((tick) => (
              <span
                key={tick}
                className="absolute end-0 -translate-y-1/2 text-[10px] tabular-nums text-muted-foreground"
                style={{ top: `${yPercent(tick)}%` }}
              >
                {tick.toLocaleString()}
              </span>
            ))}
        </div>

        <div
          className="relative min-h-[240px] min-w-0 flex-1"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {ticks.map((tick) => (
            <div
              key={tick}
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border/60"
              style={{ top: `${yPercent(tick)}%` }}
            />
          ))}

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
            aria-hidden
          >
            <defs>
              <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.delivered} stopOpacity={0.18} />
                <stop offset="100%" stopColor={COLORS.delivered} stopOpacity={0} />
              </linearGradient>
            </defs>

            {mode === 'line' ? (
              <>
                {points.map((point, index) => {
                  const height = (volumeAt(point) / axisMax) * 100
                  return (
                    <rect
                      key={point.label}
                      x={xPercent(index) - barWidth / 2}
                      y={100 - height}
                      width={barWidth}
                      height={height}
                      rx={0.4}
                      className="fill-muted-foreground/10"
                    />
                  )
                })}

                <motion.path
                  d={deliveredArea}
                  fill={`url(#${gradientId}-area)`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                />
                <motion.path
                  key={`delivered-${deliveredPath}`}
                  d={deliveredPath}
                  fill="none"
                  stroke={COLORS.delivered}
                  strokeWidth={0.35}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: CARD_EASE }}
                />
                <motion.path
                  key={`cancelled-${cancelledPath}`}
                  d={cancelledPath}
                  fill="none"
                  stroke={COLORS.cancelled}
                  strokeWidth={0.35}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: CARD_EASE }}
                />
              </>
            ) : (
              points.map((point, index) => {
                const cx = xPercent(index)
                const deliveredHeight = (point.delivered / axisMax) * 100
                const cancelledHeight = (point.cancelled / axisMax) * 100

                return (
                  <g key={point.label}>
                    <motion.rect
                      x={cx - barWidth - 0.4}
                      y={100 - deliveredHeight}
                      width={barWidth}
                      height={deliveredHeight}
                      rx={0.6}
                      fill={COLORS.delivered}
                      style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      transition={{ duration: 0.45, delay: 0.1 + index * 0.04, ease: CARD_EASE }}
                    />
                    <motion.rect
                      x={cx + 0.4}
                      y={100 - cancelledHeight}
                      width={barWidth}
                      height={cancelledHeight}
                      rx={0.6}
                      fill={COLORS.cancelled}
                      style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      transition={{ duration: 0.45, delay: 0.16 + index * 0.04, ease: CARD_EASE }}
                    />
                  </g>
                )
              })
            )}
          </svg>

          {hoverIndex !== null && (
            <>
              <div
                className="pointer-events-none absolute top-0 bottom-0 border-l border-dashed border-foreground/40"
                style={{ left: `${xPercent(hoverIndex)}%` }}
              />

              {mode === 'line' && hoveredPoint && (
                <>
                  <span
                    className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background"
                    style={{
                      left: `${xPercent(hoverIndex)}%`,
                      top: `${yPercent(hoveredPoint.delivered)}%`,
                      backgroundColor: COLORS.delivered,
                    }}
                  />
                  <span
                    className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background"
                    style={{
                      left: `${xPercent(hoverIndex)}%`,
                      top: `${yPercent(hoveredPoint.cancelled)}%`,
                      backgroundColor: COLORS.cancelled,
                    }}
                  />
                </>
              )}
            </>
          )}

          <AnimatePresence>
            {hoveredPoint && hoverIndex !== null && (
              <motion.div
                key={hoverIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.18, ease: CARD_EASE }}
                className="pointer-events-none absolute top-3 z-10 w-44 -translate-x-1/2 rounded-xl border border-border/70 bg-background/95 p-3 shadow-lg backdrop-blur-sm"
                style={{ left: `${tooltipLeft}%` }}
              >
                <p className="mb-2 text-xs font-semibold text-foreground">{hoveredPoint.label}</p>
                <div className="space-y-1.5">
                  <TooltipRow
                    color={COLORS.delivered}
                    label={labels.delivered}
                    value={hoveredPoint.delivered}
                  />
                  <TooltipRow
                    color={COLORS.cancelled}
                    label={labels.cancelled}
                    value={hoveredPoint.cancelled}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-2 flex shrink-0 gap-2">
        <div className="shrink-0" style={{ width: Y_GUTTER }} />
        <div className="relative h-4 flex-1">
          {points.map((point, index) => (
            <span
              key={point.label}
              className={cn(
                '-translate-x-1/2 absolute text-[10px] text-muted-foreground',
                hoverIndex === index && 'font-medium text-foreground',
              )}
              style={{ left: `${xPercent(index)}%` }}
            >
              {point.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const TooltipRow = ({
  color,
  label,
  value,
}: {
  color: string
  label: string
  value: number
}) => (
  <div className="flex items-center justify-between gap-3 text-xs">
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
    <span className="font-medium tabular-nums text-foreground">{value.toLocaleString()}</span>
  </div>
)
