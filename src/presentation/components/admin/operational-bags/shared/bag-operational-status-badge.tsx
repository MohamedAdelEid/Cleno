import { OperationalBagStatus } from '@/domain/enums'
import { cn } from '@/presentation/utils'

const statusStyles: Record<OperationalBagStatus, string> = {
  [OperationalBagStatus.Ready]:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300',
  [OperationalBagStatus.Processing]:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-300',
  [OperationalBagStatus.OnTheWay]:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300',
  [OperationalBagStatus.Assigned]:
    'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300',
  [OperationalBagStatus.InTransit]:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300',
  [OperationalBagStatus.Missing]:
    'border-red-300 bg-red-50 text-red-700 ring-1 ring-red-200/80 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900/60',
}

interface BagOperationalStatusBadgeProps {
  status: OperationalBagStatus
  label: string
}

export const BagOperationalStatusBadge = ({ status, label }: BagOperationalStatusBadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
      statusStyles[status],
      status === OperationalBagStatus.Missing && 'font-semibold',
    )}
  >
    {status === OperationalBagStatus.Missing && (
      <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
    )}
    {label}
  </span>
)
