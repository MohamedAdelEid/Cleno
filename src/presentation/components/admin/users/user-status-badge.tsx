import { CircleCheck, CircleOff, ShieldAlert } from 'lucide-react'

import { ManagedUserStatus, type ManagedUserStatus as ManagedUserStatusType } from '@/domain/enums'
import { Badge } from '@/presentation/components/ui/badge'
import { cn } from '@/presentation/utils'

interface UserStatusBadgeProps {
  status: ManagedUserStatusType
  label: string
}

const statusConfig = {
  [ManagedUserStatus.Active]: {
    icon: CircleCheck,
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  [ManagedUserStatus.Inactive]: {
    icon: CircleOff,
    className:
      'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300',
  },
  [ManagedUserStatus.Suspended]: {
    icon: ShieldAlert,
    className:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300',
  },
} as const

export const UserStatusBadge = ({ status, label }: UserStatusBadgeProps) => {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn('gap-1.5 px-2.5', config.className)}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
