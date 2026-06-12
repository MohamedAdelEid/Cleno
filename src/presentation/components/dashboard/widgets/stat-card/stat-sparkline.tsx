import { motion } from 'framer-motion'
import { useId, useMemo } from 'react'
import { cn } from '@/presentation/utils'

export type SparklineTrend = 'positive' | 'negative' | 'neutral'

interface StatSparklineProps {
  data: number[]
  trend?: SparklineTrend
  className?: string
  delay?: number
}

const WIDTH = 88
const HEIGHT = 36
const PADDING = 3

const buildPaths = (data: number[]) => {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = (WIDTH - PADDING * 2) / (data.length - 1)

  const points = data.map((value, index) => ({
    x: PADDING + index * step,
    y: PADDING + (HEIGHT - PADDING * 2) * (1 - (value - min) / range),
  }))

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')

  const last = points[points.length - 1]!
  const first = points[0]!
  const areaPath = `${linePath} L ${last.x.toFixed(2)} ${HEIGHT} L ${first.x.toFixed(2)} ${HEIGHT} Z`

  return { linePath, areaPath }
}

const trendColors: Record<SparklineTrend, { stroke: string; fill: string }> = {
  positive: {
    stroke: 'hsl(142 71% 45%)',
    fill: 'hsl(142 71% 45%)',
  },
  negative: {
    stroke: 'hsl(0 72% 51%)',
    fill: 'hsl(0 72% 51%)',
  },
  neutral: {
    stroke: 'hsl(221 83% 53%)',
    fill: 'hsl(221 83% 53%)',
  },
}

export const StatSparkline = ({
  data,
  trend = 'positive',
  className,
  delay = 0,
}: StatSparklineProps) => {
  const id = useId()
  const { linePath, areaPath } = useMemo(() => buildPaths(data), [data])
  const colors = trendColors[trend]

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn('h-9 w-[5.5rem] shrink-0', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.fill} stopOpacity={0.22} />
          <stop offset="100%" stopColor={colors.fill} stopOpacity={0} />
        </linearGradient>
      </defs>

      <motion.path
        d={areaPath}
        fill={`url(#${id}-fill)`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.15, ease: 'easeOut' }}
      />

      <motion.path
        d={linePath}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.75, delay: delay + 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </svg>
  )
}
