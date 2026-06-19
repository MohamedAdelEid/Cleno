import { BagStatus } from '@/domain/enums'
import { cn } from '@/presentation/utils'

const statusStyles: Record<BagStatus, string> = {
  [BagStatus.OnTheWay]: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  [BagStatus.Processing]: 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400',
  [BagStatus.Ready]: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
}

interface BagStatusBadgeProps {
  status: BagStatus
  label: string
}

export const BagStatusBadge = ({ status, label }: BagStatusBadgeProps) => (
  <span className={cn('inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium', statusStyles[status])}>
    {label}
  </span>
)
