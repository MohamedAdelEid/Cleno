import { motion } from 'framer-motion'
import { RefreshCw, WashingMachine } from 'lucide-react'
import { useMemo, useState } from 'react'

import { LaundryWorkflowStage } from '@/domain/enums'
import {
  AssignDriverModal,
  BulkConfirmModal,
  ItemBagAssignmentModal,
  KeyboardShortcutsHint,
  LaundryBoardView,
  LaundryFiltersSection,
  LaundryListView,
  LaundryStatsSection,
  OperationalAlerts,
  ScanVerifyModal,
  WorkflowNotice,
  useLaundryDashboard,
} from '@/presentation/components/admin/laundry'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { fadeUp } from '@/presentation/utils/motion'

export const LaundryOperationsPage = () => {
  const { t } = useTranslation('laundry')
  const [refreshKey, setRefreshKey] = useState(0)

  const {
    stats,
    overdueAlert,
    orders,
    allOrders,
    search,
    setSearch,
    customerFilter,
    setCustomerFilter,
    customerOptions,
    sortMode,
    setSortMode,
    viewMode,
    setViewMode,
    activeStage,
    setActiveStage,
    drivers,
    processingBagPool,
    bagModalOrder,
    isStatsLoading,
    isOrdersLoading,
    isBagModalLoading,
    isMutating,
    refreshAll,

    selectedIds,
    handleSelectChange,
    handleSelectAll,
    clearSelection,

    scanVerifyOrder,
    setScanVerifyOrder,
    verifiedBags,
    handleVerifyBag,
    handleScanVerify,
    handleScanVerifyConfirm,

    stageActionTarget,
    setStageActionTarget,
    handleStageAction,
    handleBulkSelectedAction,
    confirmStageAction,

    assignDriverOrder,
    setAssignDriverOrder,
    handleAssignDriver,
    handleAutoAssign,

    itemAssignOrder,
    setItemAssignOrder,
    handleSaveBagAssignments,

    handleAddNote,
    moveOrder,
    searchRef,
  } = useLaundryDashboard({ refreshKey })

  const stageConfirmDescription = useMemo(() => {
    if (!stageActionTarget) return ''

    if (stageActionTarget.type === 'single') {
      const { order } = stageActionTarget
      if (order.stage === LaundryWorkflowStage.IncomingToLaundry)
        return t('confirmMarkReceived').replace('{{orderNumber}}', order.orderNumber)
      if (order.stage === LaundryWorkflowStage.InLaundry)
        return t('confirmMarkReady').replace('{{orderNumber}}', order.orderNumber)
      return t('confirmDispatch').replace('{{orderNumber}}', order.orderNumber)
    }

    const count = stageActionTarget.orderIds.length
    if (stageActionTarget.stage === LaundryWorkflowStage.IncomingToLaundry)
      return t('bulkConfirmReceived').replace('{{count}}', String(count))
    if (stageActionTarget.stage === LaundryWorkflowStage.InLaundry)
      return t('bulkConfirmReady').replace('{{count}}', String(count))
    return t('bulkConfirmDispatch').replace('{{count}}', String(count))
  }, [stageActionTarget, t])

  const modKey = useMemo(() => {
    if (typeof navigator === 'undefined') return 'Ctrl'
    return /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? '⌘' : 'Ctrl'
  }, [])

  const shortcuts = useMemo(
    () => [
      { keys: ['R'], description: t('shortcutReceive') },
      { keys: ['D'], description: t('shortcutDispatch') },
      { keys: [modKey, 'K'], description: t('shortcutSearch') },
      { keys: ['V'], description: t('shortcutToggleView') },
      { keys: ['Esc'], description: t('shortcutEscape') },
    ],
    [modKey, t],
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
        icon={WashingMachine}
        action={
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={isMutating}
            onClick={() => {
              setRefreshKey((key) => key + 1)
              void refreshAll()
            }}
          >
            <motion.span
              key={refreshKey}
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="inline-flex"
            >
              <RefreshCw className="size-4" strokeWidth={2} />
            </motion.span>
          </Button>
        }
      />

      <motion.div {...fadeUp(0.08)}>
        <OperationalAlerts
          overdueAlert={overdueAlert}
          orders={allOrders}
          onOrderClick={(order) => setActiveStage(order.stage)}
        />
      </motion.div>

      <LaundryStatsSection stats={stats} isLoading={isStatsLoading} />

      <LaundryFiltersSection
        search={search}
        onSearchChange={setSearch}
        customerFilter={customerFilter}
        onCustomerFilterChange={setCustomerFilter}
        customerOptions={customerOptions}
        sortMode={sortMode}
        onSortChange={setSortMode}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchInputRef={searchRef}
      />

      <motion.div {...fadeUp(0.36)}>
        <WorkflowNotice message={t('workflowNotice')} />
      </motion.div>

      {isOrdersLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <LaundryListView
          orders={orders}
          activeStage={activeStage}
          onStageChange={setActiveStage}
          selectedIds={selectedIds}
          onSelectChange={handleSelectChange}
          onSelectAll={handleSelectAll}
          onClearSelection={clearSelection}
          onBulkSelectedAction={handleBulkSelectedAction}
          onStageAction={handleStageAction}
          onScanVerify={handleScanVerify}
          onAssignBags={setItemAssignOrder}
          onAssignDriver={setAssignDriverOrder}
          onAddNote={handleAddNote}
        />
      ) : (
        <LaundryBoardView
          orders={orders}
          selectedIds={selectedIds}
          onSelectChange={handleSelectChange}
          onStageAction={handleStageAction}
          onScanVerify={handleScanVerify}
          onAssignBags={setItemAssignOrder}
          onAssignDriver={setAssignDriverOrder}
          onAddNote={handleAddNote}
          onMoveOrder={moveOrder}
          onBulkSelectedAction={handleBulkSelectedAction}
          onClearSelection={clearSelection}
        />
      )}

      <ScanVerifyModal
        open={!!scanVerifyOrder}
        onOpenChange={(open) => !open && setScanVerifyOrder(null)}
        order={scanVerifyOrder}
        verifiedBags={verifiedBags}
        onVerifyBag={handleVerifyBag}
        onConfirm={handleScanVerifyConfirm}
      />

      <BulkConfirmModal
        open={!!stageActionTarget}
        onOpenChange={(open) => !open && setStageActionTarget(null)}
        title={t('bulkConfirmTitle')}
        description={stageConfirmDescription}
        confirmLabel={t('bulkConfirm')}
        cancelLabel={t('bulkCancel')}
        onConfirm={() => void confirmStageAction()}
        isLoading={isMutating}
      />

      <AssignDriverModal
        open={!!assignDriverOrder}
        onOpenChange={(open) => !open && setAssignDriverOrder(null)}
        order={assignDriverOrder}
        drivers={drivers}
        onAssign={handleAssignDriver}
        onAutoAssign={handleAutoAssign}
      />

      <ItemBagAssignmentModal
        open={!!itemAssignOrder}
        onOpenChange={(open) => !open && setItemAssignOrder(null)}
        order={bagModalOrder ?? itemAssignOrder}
        isLoading={isBagModalLoading}
        availableBags={processingBagPool}
        onSaveAssignments={(orderId, assignments, bags) =>
          void handleSaveBagAssignments(orderId, assignments, bags)
        }
      />

      <KeyboardShortcutsHint shortcuts={shortcuts} hintLabel={t('shortcutHint')} />
    </div>
  )
}
