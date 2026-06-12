import type { LucideIcon } from 'lucide-react'
import {
  CircleCheck,
  FileText,
  PackageCheck,
  Sparkles,
  Truck,
} from 'lucide-react'

import { OrderStatus } from '@/domain/enums'
import { cn } from '@/presentation/utils'

interface OrderStatusBadgeProps {
  status: OrderStatus
  label: string
  className?: string
}

const statusConfig: Record<
  OrderStatus,
  { icon: LucideIcon; className: string }
> = {
  [OrderStatus.OrderCreated]: {
    icon: FileText,
    className:
      'border-slate-200/80 bg-slate-50 text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300',
  },
  [OrderStatus.OnTheWayToLaundry]: {
    icon: Truck,
    className:
      'border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300',
  },
  [OrderStatus.InLaundry]: {
    icon: Sparkles,
    className:
      'border-violet-200/80 bg-violet-50 text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-300',
  },
  [OrderStatus.ReadyForDelivery]: {
    icon: PackageCheck,
    className:
      'border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300',
  },
  [OrderStatus.Delivered]: {
    icon: CircleCheck,
    className:
      'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
}

export const OrderStatusBadge = ({ status, label, className }: OrderStatusBadgeProps) => {
  const { icon: Icon, className: toneClass } = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        toneClass,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0 opacity-80" strokeWidth={2} />
      <span className="truncate">{label}</span>
    </span>
  )
}
