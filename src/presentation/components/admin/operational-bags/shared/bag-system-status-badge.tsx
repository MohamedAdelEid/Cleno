import { OperationalBagSystemStatus } from '@/domain/enums'
import { cn } from '@/presentation/utils'

const statusStyles: Record<OperationalBagSystemStatus, string> = {
  [OperationalBagSystemStatus.Active]:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300',
  [OperationalBagSystemStatus.Inactive]:
    'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400',
}

interface BagSystemStatusBadgeProps {
  status: OperationalBagSystemStatus
  label: string
}

export const BagSystemStatusBadge = ({ status, label }: BagSystemStatusBadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
      statusStyles[status],
    )}
  >
    {label}
  </span>
)
