import { motion } from 'framer-motion'
import { useId, useMemo, useState } from 'react'

import { cn } from '@/presentation/utils'

const CARD_EASE = [0.25, 0.1, 0.25, 1] as const
const WIDTH = 120
const HEIGHT = 56
const PADDING = 4

interface StatOrdersSparklineProps {
  data: number[]
  peakLabel?: string
  className?: string
}

const buildPaths = (data: number[]) => {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = (WIDTH - PADDING * 2) / (data.length - 1)

  const points = data.map((value, index) => ({
    x: PADDING + index * step,
    y: PADDING + (HEIGHT - PADDING * 2) * (1 - (value - min) / range),
    value,
  }))

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')

  const last = points[points.length - 1]!
  const first = points[0]!
  const areaPath = `${linePath} L ${last.x.toFixed(2)} ${HEIGHT} L ${first.x.toFixed(2)} ${HEIGHT} Z`

  return { linePath, areaPath, points }
}

export const StatOrdersSparkline = ({ data, peakLabel, className }: StatOrdersSparklineProps) => {
  const gradientId = useId()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const { linePath, areaPath, points } = useMemo(() => buildPaths(data), [data])

  const peakIndex = useMemo(() => {
    let max = -Infinity
    let index = 0
    data.forEach((value, i) => {
      if (value > max) {
        max = value
        index = i
      }
    })
    return index
  }, [data])

  const activeIndex = hoverIndex ?? peakIndex
  const activePoint = points[activeIndex]!

  return (
    <div
      className={cn('relative h-14 w-[7.5rem] shrink-0', className)}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" aria-hidden>
        <defs>
          <pattern id={`${gradientId}-grid`} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" className="fill-muted-foreground/15" />
          </pattern>
          <linearGradient id={`${gradientId}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(221 83% 53%)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill={`url(#${gradientId}-grid)`} />

        <motion.path
          d={areaPath}
          fill={`url(#${gradientId}-fill)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        />

        <motion.path
          d={linePath}
          fill="none"
          className="stroke-primary"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.75, delay: 0.1, ease: CARD_EASE }}
        />

        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={6}
            className="fill-transparent"
            onMouseEnter={() => setHoverIndex(index)}
          />
        ))}

        <circle
          cx={activePoint.x}
          cy={activePoint.y}
          r={3}
          className="fill-primary stroke-background"
          strokeWidth={1.5}
        />
      </svg>

      {peakLabel && (
        <motion.span
          key={activeIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: CARD_EASE }}
          className="pointer-events-none absolute -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-background shadow-sm"
          style={{
            left: `${(activePoint.x / WIDTH) * 100}%`,
            top: `${(activePoint.y / HEIGHT) * 100 - 28}%`,
          }}
        >
          {hoverIndex !== null ? activePoint.value.toLocaleString() : peakLabel}
        </motion.span>
      )}
    </div>
  )
}
