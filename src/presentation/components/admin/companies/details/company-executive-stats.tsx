import { motion } from 'framer-motion'
import {
  Building2,
  ClipboardList,
  CheckCircle2,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, PAGE_EASE } from '@/presentation/utils'

interface StatItem {
  key: string
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  variant: 'default' | 'success' | 'warning' | 'danger'
}

interface CompanyExecutiveStatsProps {
  stats: {
    branches: number
    activeOrders: number
    completedOrders: number
    ordersThisMonth: number
    outstandingBalance: number
    totalRevenue: number
    pendingInvoices: number
    overdueInvoices: number
  }
}

const formatCurrency = (val: number) =>
  `$${val.toLocaleString('en-US', { minimumFractionDigits: 0 })}`

const variantColors: Record<StatItem['variant'], string> = {
  default: 'text-blue-600 dark:text-blue-400',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-red-400',
}

const variantBg: Record<StatItem['variant'], string> = {
  default: 'bg-blue-50 dark:bg-blue-950/30',
  success: 'bg-emerald-50 dark:bg-emerald-950/30',
  warning: 'bg-amber-50 dark:bg-amber-950/30',
  danger: 'bg-red-50 dark:bg-red-950/30',
}

export const CompanyExecutiveStats = ({ stats }: CompanyExecutiveStatsProps) => {
  const { t } = useTranslation('companies')

  const items: StatItem[] = [
    { key: 'branches', title: t('detailsStatBranches'), value: stats.branches, description: t('detailsStatBranchesDesc'), icon: Building2, variant: 'default' },
    { key: 'activeOrders', title: t('detailsStatActiveOrders'), value: stats.activeOrders, description: t('detailsStatActiveOrdersDesc'), icon: ClipboardList, variant: 'default' },
    { key: 'completedOrders', title: t('detailsStatCompletedOrders'), value: stats.completedOrders, description: t('detailsStatCompletedOrdersDesc'), icon: CheckCircle2, variant: 'success' },
    { key: 'ordersThisMonth', title: t('detailsStatOrdersThisMonth'), value: stats.ordersThisMonth, description: t('detailsStatOrdersThisMonthDesc'), icon: CalendarDays, variant: 'default' },
    { key: 'outstandingBalance', title: t('detailsStatOutstandingBalance'), value: formatCurrency(stats.outstandingBalance), description: t('detailsStatOutstandingBalanceDesc'), icon: DollarSign, variant: stats.outstandingBalance > 0 ? 'warning' : 'success' },
    { key: 'totalRevenue', title: t('detailsStatTotalRevenue'), value: formatCurrency(stats.totalRevenue), description: t('detailsStatTotalRevenueDesc'), icon: TrendingUp, variant: 'success' },
    { key: 'pendingInvoices', title: t('detailsStatPendingInvoices'), value: stats.pendingInvoices, description: t('detailsStatPendingInvoicesDesc'), icon: Clock, variant: stats.pendingInvoices > 0 ? 'warning' : 'default' },
    { key: 'overdueInvoices', title: t('detailsStatOverdueInvoices'), value: stats.overdueInvoices, description: t('detailsStatOverdueInvoicesDesc'), icon: AlertCircle, variant: stats.overdueInvoices > 0 ? 'danger' : 'default' },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <motion.article
          key={item.key}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: PAGE_EASE, delay: 0.1 + index * 0.05 }}
          className="group overflow-hidden rounded-xl border border-border/80 bg-card transition-shadow hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-2 px-4 pt-3.5 pb-2">
            <h3 className="text-xs font-medium text-muted-foreground">{item.title}</h3>
            <span className={cn('flex size-7 items-center justify-center rounded-lg', variantBg[item.variant])}>
              <item.icon className={cn('size-3.5', variantColors[item.variant])} strokeWidth={2} />
            </span>
          </div>
          <div className="px-4 pb-3.5">
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {item.value}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{item.description}</p>
          </div>
        </motion.article>
      ))}
    </div>
  )
}
