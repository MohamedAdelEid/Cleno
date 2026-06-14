import { motion } from 'framer-motion'

import { cn } from '@/presentation/utils'

const CARD_EASE = [0.25, 0.1, 0.25, 1] as const

interface StatDualProgressProps {
  primaryValue: number
  primaryLabel: string
  primaryRatio: number
  secondaryValue: number
  secondaryLabel: string
  secondaryRatio: number
  className?: string
}

export const StatDualProgress = ({
  primaryValue,
  primaryLabel,
  primaryRatio,
  secondaryValue,
  secondaryLabel,
  secondaryRatio,
  className,
}: StatDualProgressProps) => {
  const primaryClamped = Math.min(Math.max(primaryRatio, 0), 1)
  const secondaryClamped = Math.min(Math.max(secondaryRatio, 0), 1)

  return (
    <div className={cn('flex flex-1 items-stretch gap-4', className)} aria-hidden>
      <ConnectedMetric
        value={primaryValue}
        label={primaryLabel}
        ratio={primaryClamped}
        accent
      />

      <PlainMetric
        value={secondaryValue}
        label={secondaryLabel}
        ratio={secondaryClamped}
        align="end"
      />
    </div>
  )
}

const ConnectedMetric = ({
  value,
  label,
  ratio,
  accent,
}: {
  value: number
  label: string
  ratio: number
  accent?: boolean
}) => (
  <div className="flex min-w-0 flex-1 gap-0">
    <div
      className={cn(
        'w-[2px] shrink-0 self-stretch rounded-t-full',
        accent ? 'bg-primary' : 'bg-muted-foreground/25',
      )}
    />
    <div className="flex min-w-0 flex-1 flex-col justify-between">
      <div className="ps-3">
        <p className="text-[1.35rem] leading-none font-semibold text-foreground">
          {value.toLocaleString()}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
      </div>
      <ProgressTrack ratio={ratio} accent={accent} connected />
    </div>
  </div>
)

const PlainMetric = ({
  value,
  label,
  ratio,
  align,
}: {
  value: number
  label: string
  ratio: number
  align?: 'end'
}) => (
  <div className="flex min-w-0 flex-1 gap-0">
    <div className="w-[2px] shrink-0 self-stretch rounded-t-full bg-muted-foreground/35 ms-[-2px]" />
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col justify-between',
      )}
    >
      <div className="ps-3">
        <p className="text-[1.35rem] leading-none font-semibold text-muted-foreground">
          {value.toLocaleString()}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
      </div>
      <ProgressTrack ratio={ratio} className={align === 'end' ? 'self-end' : undefined} connected />
    </div>
  </div>
)

const ProgressTrack = ({
  ratio,
  accent,
  connected,
  className,
}: {
  ratio: number
  accent?: boolean
  connected?: boolean
  className?: string
}) => (
  <div
    className={cn(
      'mt-2 h-2 w-full overflow-hidden rounded-full bg-muted-foreground/15',
      connected && 'rounded-s-none',
      className,
    )}
  >
    <motion.span
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.55, delay: 0.15, ease: CARD_EASE }}
      className={cn(
        'block h-full origin-left rounded-full -ms-1',
        accent ? 'bg-primary' : 'bg-muted-foreground/35',
        connected && 'rounded-s-none',
      )}
      style={{ width: `${ratio * 100}%` }}
    />
  </div>
)
