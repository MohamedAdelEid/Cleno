import { CircleCheck, CircleOff } from 'lucide-react'

import { DriverAvailability } from '@/domain/enums'
import type { DriverAvailability as DriverAvailabilityType } from '@/domain/enums'
import { Badge } from '@/presentation/components/ui/badge'
import { cn } from '@/presentation/utils'

interface DriverStatusBadgeProps {
  status: DriverAvailabilityType
  label: string
}

const statusConfig = {
  [DriverAvailability.Available]: {
    icon: CircleCheck,
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  [DriverAvailability.Unavailable]: {
    icon: CircleOff,
    className:
      'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300',
  },
} as const

export const DriverStatusBadge = ({ status, label }: DriverStatusBadgeProps) => {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn('gap-1.5 px-2.5', config.className)}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
