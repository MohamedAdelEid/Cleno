import { format, isPast, differenceInHours } from 'date-fns'

import { UrgencyLevel } from '@/domain/enums'
import { cn } from '@/presentation/utils'

interface TimeDisplayProps {
  time: string
  label: string
  isDeadline?: boolean
}

const formatDisplayTime = (time: string): string => {
  const parsed = new Date(time)
  if (!Number.isNaN(parsed.getTime())) {
    return format(parsed, 'h:mm a')
  }
  return time
}

const getTimeUrgency = (time: string): UrgencyLevel => {
  const target = new Date(time)
  if (Number.isNaN(target.getTime())) return UrgencyLevel.Normal
  if (isPast(target)) return UrgencyLevel.Overdue

  const hoursUntil = differenceInHours(target, new Date())
  if (hoursUntil <= 1) return UrgencyLevel.Urgent
  if (hoursUntil <= 3) return UrgencyLevel.Warning
  return UrgencyLevel.Normal
}

const urgencyTextStyles: Record<UrgencyLevel, string> = {
  [UrgencyLevel.Normal]: 'text-muted-foreground',
  [UrgencyLevel.Warning]: 'text-amber-700 dark:text-amber-400',
  [UrgencyLevel.Urgent]: 'text-orange-700 dark:text-orange-400',
  [UrgencyLevel.Overdue]: 'text-red-700 dark:text-red-400',
}

export const TimeDisplay = ({ time, label, isDeadline = false }: TimeDisplayProps) => {
  const urgency = isDeadline ? getTimeUrgency(time) : UrgencyLevel.Normal
  const formatted = formatDisplayTime(time)

  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">{label}</p>
      <p className={cn('text-xs font-semibold tabular-nums', urgencyTextStyles[urgency])}>
        {formatted}
      </p>
    </div>
  )
}
