import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  Package,
  Truck,
  FileText,
  CreditCard,
  Building2,
  RefreshCw,
  UserCheck,
  PackageCheck,
  History,
  CheckCircle2,
  XCircle,
  WashingMachine,
  AlertTriangle,
  UserPlus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { CompanyActivity, CompanyActivityType } from '@/domain/entities/company-details.entity'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, PAGE_EASE } from '@/presentation/utils'

interface ActivityTabProps {
  activities: CompanyActivity[]
  isLoading?: boolean
}

export const activityConfig: Record<
  CompanyActivityType,
  { icon: LucideIcon; color: string; bgColor: string; labelKey: string }
> = {
  company_registered: {
    icon: UserPlus,
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/40',
    labelKey: 'detailsCompanyRegistered',
  },
  company_approved: {
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    labelKey: 'detailsCompanyApproved',
  },
  branch_created: {
    icon: Building2,
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/40',
    labelKey: 'detailsBranchCreated',
  },
  order_created: {
    icon: Package,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    labelKey: 'detailsOrderCreated',
  },
  order_delivered: {
    icon: Truck,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    labelKey: 'detailsOrderDelivered',
  },
  order_in_laundry: {
    icon: WashingMachine,
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/40',
    labelKey: 'detailsOrderInLaundry',
  },
  order_ready: {
    icon: PackageCheck,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-950/40',
    labelKey: 'detailsOrderReady',
  },
  order_cancelled: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    labelKey: 'detailsOrderCancelled',
  },
  invoice_generated: {
    icon: FileText,
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/40',
    labelKey: 'detailsInvoiceGenerated',
  },
  payment_received: {
    icon: CreditCard,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    labelKey: 'detailsPaymentReceived',
  },
  branch_added: {
    icon: Building2,
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/40',
    labelKey: 'detailsBranchAdded',
  },
  incident_reported: {
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    labelKey: 'detailsIncidentReported',
  },
  status_changed: {
    icon: RefreshCw,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    labelKey: 'detailsStatusChanged',
  },
  driver_assigned: {
    icon: UserCheck,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    labelKey: 'detailsDriverAssigned',
  },
  order_picked_up: {
    icon: PackageCheck,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-950/40',
    labelKey: 'detailsOrderPickedUp',
  },
}

const formatRelativeTime = (iso: string) => {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return iso
  }
}

export const ActivityTimelineItem = ({
  activity,
  isLast,
}: {
  activity: CompanyActivity
  isLast: boolean
}) => {
  const { t } = useTranslation('companies')
  const config = activityConfig[activity.type]
  const Icon = config.icon

  return (
    <div className="relative flex gap-3 pb-4 last:pb-0">
      {!isLast && (
        <span className="absolute start-[15px] top-8 bottom-0 w-px bg-border/60" />
      )}

      <span className={cn('relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full', config.bgColor)}>
        <Icon className={cn('size-3.5', config.color)} strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground">
              {activity.title || t(config.labelKey)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{activity.description}</p>
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground/70">
            {formatRelativeTime(activity.timestamp)}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-muted-foreground/60">by {activity.user}</p>
      </div>
    </div>
  )
}

export const ActivityTab = ({ activities, isLoading = false }: ActivityTabProps) => {
  const { t } = useTranslation('companies')

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: PAGE_EASE }}
        className="flex flex-col items-center justify-center rounded-xl border border-border/70 py-16"
      >
        <History className="size-10 animate-pulse text-muted-foreground/40" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-muted-foreground">{t('detailsLoadingActivity')}</p>
      </motion.div>
    )
  }

  if (activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: PAGE_EASE }}
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 py-16"
      >
        <History className="size-10 text-muted-foreground/40" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-muted-foreground">{t('detailsNoActivity')}</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: PAGE_EASE }}
      className="overflow-hidden rounded-xl border border-border/70 bg-card"
    >
      <div className="border-b border-border/60 px-5 py-3.5">
        <h3 className="text-sm font-semibold text-foreground">{t('detailsActivityTimeline')}</h3>
      </div>
      <div className="px-5 py-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
          >
            <ActivityTimelineItem
              activity={activity}
              isLast={index === activities.length - 1}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
