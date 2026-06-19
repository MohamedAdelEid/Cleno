import type { LucideIcon } from 'lucide-react'
import { CircleCheck, CircleX, Mail, ShieldCheck } from 'lucide-react'

import { CompanyAccountStatus } from '@/domain/enums'
import { cn } from '@/presentation/utils'

interface CompanyStatusBadgeProps {
  status: CompanyAccountStatus
  label: string
}

const statusConfig: Record<
  CompanyAccountStatus,
  { icon: LucideIcon; className: string }
> = {
  [CompanyAccountStatus.PendingEmailVerification]: {
    icon: Mail,
    className:
      'border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300',
  },
  [CompanyAccountStatus.PendingAdminApproval]: {
    icon: ShieldCheck,
    className:
      'border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300',
  },
  [CompanyAccountStatus.Approved]: {
    icon: CircleCheck,
    className:
      'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  [CompanyAccountStatus.Rejected]: {
    icon: CircleX,
    className:
      'border-red-200/80 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300',
  },
}

export const CompanyStatusBadge = ({ status, label }: CompanyStatusBadgeProps) => {
  const { icon: Icon, className } = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0 opacity-80" strokeWidth={2} />
      <span className="truncate">{label}</span>
    </span>
  )
}
