import { UrgencyLevel } from '@/domain/enums'
import { cn } from '@/presentation/utils'

const urgencyStyles: Record<UrgencyLevel, string> = {
  [UrgencyLevel.Normal]: 'bg-muted/60 text-muted-foreground border-border/50',
  [UrgencyLevel.Warning]: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40',
  [UrgencyLevel.Urgent]: 'bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/40',
  [UrgencyLevel.Overdue]: 'bg-red-50 text-red-700 border-red-200/80 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40',
}

interface UrgencyBadgeProps {
  urgency: UrgencyLevel
  label: string
  className?: string
}

export const UrgencyBadge = ({ urgency, label, className }: UrgencyBadgeProps) => {
  if (urgency === UrgencyLevel.Normal) return null

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        urgencyStyles[urgency],
        className,
      )}
    >
      {urgency === UrgencyLevel.Overdue && (
        <span className="me-1 size-1.5 animate-pulse rounded-full bg-current" />
      )}
      {label}
    </span>
  )
}
