import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { Check } from 'lucide-react'

import type { OrderStatus } from '@/domain/enums'
import type { ShipmentTimelineStep } from '@/domain/types'
import { cn } from '@/presentation/utils'

interface OrderTimelineProps {
  steps: ShipmentTimelineStep[]
  statusLabels: Record<OrderStatus, string>
  estimatedLabel: (date: string) => string
  isRtl: boolean
  className?: string
}

export const OrderTimeline = ({
  steps,
  statusLabels,
  estimatedLabel,
  isRtl,
  className,
}: OrderTimelineProps) => {
  const locale = isRtl ? arSA : enUS

  return (
    <ol className={cn('relative', className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const date = format(new Date(step.at), 'd MMM yyyy', { locale })
        const time = format(new Date(step.at), 'h:mm a', { locale })
        const dateText = step.state === 'upcoming' ? estimatedLabel(date) : date

        return (
          <li key={step.status} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span
                className={cn(
                  'absolute top-6 bottom-0 w-px',
                  step.state === 'upcoming' ? 'bg-border' : 'bg-primary/60',
                )}
                style={{ insetInlineStart: 11 }}
              />
            )}

            <StepIndicator state={step.state} />

            <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className={cn(
                    'truncate text-sm',
                    step.state === 'upcoming'
                      ? 'text-muted-foreground'
                      : 'font-medium text-foreground',
                  )}
                >
                  {statusLabels[step.status]}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{dateText}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{time}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

const StepIndicator = ({ state }: { state: ShipmentTimelineStep['state'] }) => {
  if (state === 'completed') {
    return (
      <span className="z-10 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    )
  }

  if (state === 'active') {
    return (
      <span className="z-10 flex size-6 shrink-0 items-center justify-center rounded-md border-2 border-primary bg-background">
        <span className="size-2 animate-pulse rounded-full bg-primary" />
      </span>
    )
  }

  return (
    <span className="z-10 flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background">
      <span className="size-2 rounded-full bg-muted-foreground/30" />
    </span>
  )
}
