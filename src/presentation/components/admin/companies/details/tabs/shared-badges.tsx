import { OrderStatus } from '@/domain/enums'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'

interface OrderStatusBadgeProps {
  status: (typeof OrderStatus)[keyof typeof OrderStatus]
}

const orderStatusConfig: Record<
  (typeof OrderStatus)[keyof typeof OrderStatus],
  { labelKey: string; className: string }
> = {
  [OrderStatus.OrderCreated]: {
    labelKey: 'orderStatusCreated',
    className: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300',
  },
  [OrderStatus.PickedUp]: {
    labelKey: 'orderStatusOnTheWay',
    className: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  },
  [OrderStatus.InLaundry]: {
    labelKey: 'orderStatusInLaundry',
    className: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300',
  },
  [OrderStatus.ReadyForDelivery]: {
    labelKey: 'orderStatusReady',
    className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  },
  [OrderStatus.Delivered]: {
    labelKey: 'orderStatusDelivered',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  [OrderStatus.Cancelled]: {
    labelKey: 'orderStatusCancelled',
    className: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300',
  },
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const { t } = useTranslation('companies')
  const config = orderStatusConfig[status]

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium', config.className)}>
      {t(config.labelKey)}
    </span>
  )
}

interface InvoiceStatusBadgeProps {
  status: 'paid' | 'pending' | 'overdue'
}

const invoiceStatusConfig: Record<
  'paid' | 'pending' | 'overdue',
  { labelKey: string; className: string }
> = {
  paid: {
    labelKey: 'invoiceStatusPaid',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  pending: {
    labelKey: 'invoiceStatusPending',
    className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  },
  overdue: {
    labelKey: 'invoiceStatusOverdue',
    className: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300',
  },
}

export const InvoiceStatusBadge = ({ status }: InvoiceStatusBadgeProps) => {
  const { t } = useTranslation('companies')
  const config = invoiceStatusConfig[status]

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium', config.className)}>
      {t(config.labelKey)}
    </span>
  )
}
