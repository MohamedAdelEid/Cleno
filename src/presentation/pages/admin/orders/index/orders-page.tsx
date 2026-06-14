import {
  OrderAnalysisCard,
  OrdersOverviewSection,
  OrdersTableSection,
  ShipmentTrackingCard,
  ordersTableDummyData,
} from '@/presentation/components/admin/orders'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Plus, RefreshCw, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

export const OrdersPage = () => {
  const { t } = useTranslation('orders')
  const { isRtl } = useDirection()
  const [lastUpdated, setLastUpdated] = useState(() => new Date())
  const [refreshTick, setRefreshTick] = useState(0)
  const [orders, setOrders] = useState(ordersTableDummyData)

  const formattedLastUpdated = format(lastUpdated, 'MMM d, yyyy h:mm a', {
    locale: isRtl ? arSA : enUS,
  })

  const handleRefresh = () => {
    setLastUpdated(new Date())
    setRefreshTick((tick) => tick + 1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
        icon={ShoppingBag}
        action={
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <Button type="button">
              <Plus />
              {t('createOrder')}
            </Button>

            <div className="leading-tight">
              <p className="text-[11px] text-muted-foreground">{t('lastUpdated')}</p>
              <p className="text-xs font-medium text-foreground tabular-nums">
                {formattedLastUpdated}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t('refresh')}
              onClick={handleRefresh}
            >
              <motion.span
                key={refreshTick}
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="inline-flex"
              >
                <RefreshCw className="size-4" strokeWidth={2} />
              </motion.span>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <OrdersOverviewSection />
          <OrderAnalysisCard index={3} className="min-h-0 flex-1" />
        </div>

        <ShipmentTrackingCard index={4} className="h-full min-h-0 lg:col-span-1" />
      </div>

      <OrdersTableSection orders={orders} setOrders={setOrders} />
    </div>
  )
}
