import { Plus, RefreshCw, ShoppingBag } from 'lucide-react'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { useState } from 'react'

import {
  OrderAnalysisCard,
  OrdersOverviewSection,
  OrdersTableSection,
  ShipmentTrackingCard,
  useOrders,
} from '@/presentation/components/admin/orders'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'

export const OrdersPage = () => {
  const { t } = useTranslation('orders')
  const { isRtl } = useDirection()
  const [refreshTick, setRefreshTick] = useState(0)

  const {
    overviewStats,
    analysisSummary,
    orders,
    totalRows,
    activeShipment,
    activeOrderSlug,
    assignableDrivers,
    isDashboardLoading,
    isOrdersLoading,
    isTrackingLoading,
    isDriversLoading,
    isMutating,
    lastUpdated,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    analysisInterval,
    setAnalysisInterval,
    paginationState,
    setPaginationState,
    selectActiveOrder,
    refreshAll,
    fetchDrivers,
    assignDriver,
    cancelOrder,
    bulkUpdateStatus,
    bulkCancelOrders,
  } = useOrders()

  const formattedLastUpdated = format(lastUpdated, 'MMM d, yyyy h:mm a', {
    locale: isRtl ? arSA : enUS,
  })

  const handleRefresh = async () => {
    setRefreshTick((tick) => tick + 1)
    await refreshAll()
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
              onClick={() => void handleRefresh()}
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
          <OrdersOverviewSection stats={overviewStats} isLoading={isDashboardLoading} />
          <OrderAnalysisCard
            index={3}
            className="min-h-0 flex-1"
            summary={analysisSummary}
            interval={analysisInterval}
            onIntervalChange={setAnalysisInterval}
            isLoading={isDashboardLoading}
          />
        </div>

        <ShipmentTrackingCard
          index={4}
          className="h-full min-h-0 lg:col-span-1"
          shipment={activeShipment}
          isLoading={isTrackingLoading && !activeShipment}
          isEmpty={!activeOrderSlug}
        />
      </div>

      <OrdersTableSection
        orders={orders}
        totalRows={totalRows}
        isLoading={isOrdersLoading}
        isMutating={isMutating}
        keyword={keyword}
        onKeywordChange={setKeyword}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        paginationState={paginationState}
        onPaginationStateChange={setPaginationState}
        activeOrderSlug={activeOrderSlug}
        onOrderSelect={selectActiveOrder}
        assignableDrivers={assignableDrivers}
        isDriversLoading={isDriversLoading}
        onAssignDialogOpen={fetchDrivers}
        onAssignDriver={assignDriver}
        onCancelOrder={cancelOrder}
        onBulkUpdateStatus={bulkUpdateStatus}
        onBulkCancel={bulkCancelOrders}
      />
    </div>
  )
}
