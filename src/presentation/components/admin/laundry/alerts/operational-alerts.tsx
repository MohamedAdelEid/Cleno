import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight } from 'lucide-react'

import type { LaundryOrder } from '@/domain/entities/laundry-order.entity'
import { ROUTES } from '@/presentation/routes/routes.constants'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { useNavigate } from 'react-router-dom'

export interface OverdueAlertOrder {
  slug: string
  orderNumber: string
}

interface OperationalAlertsProps {
  overdueAlert: { count: number; orders: OverdueAlertOrder[] } | null
  orders?: LaundryOrder[]
  onOrderClick?: (order: LaundryOrder) => void
}

export const OperationalAlerts = ({
  overdueAlert,
  orders = [],
  onOrderClick,
}: OperationalAlertsProps) => {
  const { t } = useTranslation('laundry')
  const navigate = useNavigate()

  if (!overdueAlert || overdueAlert.count === 0) return null

  const handleChipClick = (order: OverdueAlertOrder) => {
    const matched = orders.find((item) => item.slug === order.slug)
    if (matched) {
      onOrderClick?.(matched)
      return
    }

    const params = new URLSearchParams({
      keyword: order.orderNumber,
      isOpen: 'true',
    })
    navigate(`${ROUTES.INCIDENTS.INDEX}?${params.toString()}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="overflow-hidden rounded-xl border border-red-200/80 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20"
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
          <AlertCircle className="size-[18px] text-red-700 dark:text-red-400" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">
              {t('alertOverdueTitle').replace('{{count}}', String(overdueAlert.count))}
            </h3>
            <span className="hidden text-red-300 sm:inline dark:text-red-700">·</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {overdueAlert.orders.map((order) => (
                <button
                  key={order.slug}
                  type="button"
                  onClick={() => handleChipClick(order)}
                  className="inline-flex items-center gap-1 rounded-md border border-red-200/80 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-red-800 transition-colors hover:bg-red-50 dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-950/70"
                >
                  {order.orderNumber}
                  <ArrowRight className="size-2.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-red-700/80 dark:text-red-400/80">{t('alertOverdueSubtitle')}</p>
        </div>
      </div>
    </motion.div>
  )
}
