import { format, isPast, differenceInHours, parse } from 'date-fns'

import { UrgencyLevel } from '@/domain/enums'
import { cn } from '@/presentation/utils'

interface TimeDisplayProps {
  date?: string | null
  time: string
  label: string
  isDeadline?: boolean
}

const parseSchedule = (date: string | null | undefined, time: string): Date | null => {
  if (date && time) {
    const combined = parse(`${date} ${time}`, 'yyyy-MM-dd hh:mm a', new Date())
    if (!Number.isNaN(combined.getTime())) return combined
  }

  const timeOnly = parse(time, 'hh:mm a', new Date())
  if (!Number.isNaN(timeOnly.getTime())) return timeOnly

  const iso = new Date(time)
  if (!Number.isNaN(iso.getTime())) return iso

  return null
}

const formatDisplayDate = (date: string | null | undefined): string | null => {
  if (!date) return null
  const parsed = parse(date, 'yyyy-MM-dd', new Date())
  if (Number.isNaN(parsed.getTime())) return null
  return format(parsed, 'MMM d')
}

const formatDisplayTime = (time: string): string => {
  const parsed = parse(time, 'hh:mm a', new Date())
  if (!Number.isNaN(parsed.getTime())) return format(parsed, 'h:mm a')

  const iso = new Date(time)
  if (!Number.isNaN(iso.getTime())) return format(iso, 'h:mm a')

  return time
}

const getTimeUrgency = (date: string | null | undefined, time: string): UrgencyLevel => {
  const target = parseSchedule(date, time)
  if (!target) return UrgencyLevel.Normal
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

export const TimeDisplay = ({ date, time, label, isDeadline = false }: TimeDisplayProps) => {
  const urgency = isDeadline ? getTimeUrgency(date, time) : UrgencyLevel.Normal
  const formattedDate = formatDisplayDate(date)
  const formattedTime = formatDisplayTime(time)

  return (
    <div className="space-y-0.5 text-end">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">{label}</p>
      {formattedDate && (
        <p className={cn('text-[10px] font-medium tabular-nums', urgencyTextStyles[urgency])}>
          {formattedDate}
        </p>
      )}
      <p className={cn('text-xs font-semibold tabular-nums', urgencyTextStyles[urgency])}>
        {formattedTime}
      </p>
    </div>
  )
}

export const getScheduleTimestamp = (date: string | null | undefined, time: string): number => {
  const parsed = parseSchedule(date, time)
  return parsed ? parsed.getTime() : Number.NaN
}
