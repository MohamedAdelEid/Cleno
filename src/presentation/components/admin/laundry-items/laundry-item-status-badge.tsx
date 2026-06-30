import { CircleCheck, CircleOff } from 'lucide-react'

import { Badge } from '@/presentation/components/ui/badge'
import { cn } from '@/presentation/utils'

interface LaundryItemStatusBadgeProps {
  isActive: boolean
  activeLabel: string
  inactiveLabel: string
}

export const LaundryItemStatusBadge = ({
  isActive,
  activeLabel,
  inactiveLabel,
}: LaundryItemStatusBadgeProps) => {
  const Icon = isActive ? CircleCheck : CircleOff

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 px-2.5',
        isActive
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
          : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300',
      )}
    >
      <Icon className="size-3" />
      {isActive ? activeLabel : inactiveLabel}
    </Badge>
  )
}
