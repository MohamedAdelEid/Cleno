import { motion } from 'framer-motion'
import { useState } from 'react'

import { cn } from '@/presentation/utils'

const CARD_EASE = [0.25, 0.1, 0.25, 1] as const

export interface SegmentedBarSegment {
  top: number
  bottom: number
  value?: number
  label?: string
}

interface StatSegmentedBarsProps {
  bars: SegmentedBarSegment[]
  highlightIndex?: number
  tooltipValue?: (bar: SegmentedBarSegment, index: number) => string
  className?: string
}

export const StatSegmentedBars = ({
  bars,
  highlightIndex = 2,
  tooltipValue,
  className,
}: StatSegmentedBarsProps) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const activeBar = hoverIndex !== null ? bars[hoverIndex] : null

  return (
    <div
      className={cn('relative h-14 w-[5.5rem] shrink-0', className)}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <div className="flex h-full items-end justify-end gap-2" aria-hidden>
        {bars.map((bar, index) => {
          const isHighlighted = index === highlightIndex
          const isHovered = hoverIndex === index

          return (
            <div
              key={index}
              className="flex h-full w-3 flex-col justify-end gap-1"
              onMouseEnter={() => setHoverIndex(index)}
            >
              <motion.span
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05, ease: CARD_EASE }}
                className={cn(
                  'w-full origin-bottom rounded-full bg-muted-foreground/15 transition-colors',
                  isHighlighted && 'bg-primary',
                  isHovered && !isHighlighted && 'bg-primary/70',
                )}
                style={{ height: `${bar.top * 100}%` }}
              />
              <motion.span
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.16 + index * 0.05, ease: CARD_EASE }}
                className="w-full origin-bottom rounded-full bg-muted-foreground/15"
                style={{ height: `${bar.bottom * 100}%` }}
              />
            </div>
          )
        })}
      </div>

      {(hoverIndex !== null && activeBar && tooltipValue) && (
        <motion.div
          key={hoverIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: CARD_EASE }}
          className="pointer-events-none absolute -top-1 end-0 z-10 max-w-[9rem] -translate-y-full rounded-md border border-border/70 bg-background px-2 py-1 text-[10px] leading-snug text-foreground shadow-sm"
        >
          {tooltipValue(activeBar, hoverIndex)}
        </motion.div>
      )}
    </div>
  )
}
