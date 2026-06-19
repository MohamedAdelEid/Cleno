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
import { useTranslation } from '@/presentation/hooks/use-translation'
import { fadeUp } from '@/presentation/utils/motion'

export const LaundryOperationsPage = () => {
  const { t } = useTranslation('laundry')
  const [refreshTick, setRefreshTick] = useState(0)

  const {
    stats,
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
  } = useLaundryDashboard()

  const statsLabels = {
    receivedToday: t('statReceivedToday'),
    processedToday: t('statProcessedToday'),
    dispatchedToday: t('statDispatchedToday'),
    avgProcessingTime: t('statAvgProcessingTime'),
    bagsInLaundry: t('statBagsInLaundry'),
  }

  const filterLabels = {
    searchPlaceholder: t('searchPlaceholder'),
    filterCustomer: t('filterCustomer'),
    filterAllCustomers: t('filterAllCustomers'),
    sortNewest: t('sortNewest'),
    sortOldest: t('sortOldest'),
    viewList: t('viewList'),
    viewBoard: t('viewBoard'),
  }

  const listLabels = {
    tabIncoming: t('tabIncoming'),
    tabInLaundry: t('tabInLaundry'),
    tabReady: t('tabReady'),
    emptyIncoming: t('emptyIncoming'),
    emptyInLaundry: t('emptyInLaundry'),
    emptyReady: t('emptyReady'),
    selectedLabel: t('selectedLabel'),
    selectAll: t('selectAll'),
    deselectAll: t('deselectAll'),
    bulkMarkSelectedReceived: t('bulkMarkSelectedReceived'),
    bulkMarkSelectedReady: t('bulkMarkSelectedReady'),
    bulkDispatchSelected: t('bulkDispatchSelected'),
  }

  const cardLabels = {
    items: t('orderItems'),
    bags: t('orderBags'),
    pickupTime: t('pickupTime'),
    deliverBy: t('deliverBy'),
    assignedBags: t('assignedBags'),
    bagsExpanded: t('bagsExpanded'),
    bagStatusOnTheWay: t('bagStatusOnTheWay'),
    bagStatusProcessing: t('bagStatusProcessing'),
    bagStatusReady: t('bagStatusReady'),
    inLaundryFor: t('inLaundryFor'),
    urgencyWarning: t('urgencyWarning'),
    urgencyUrgent: t('urgencyUrgent'),
    urgencyOverdue: t('urgencyOverdue'),
    markReceived: t('markReceived'),
    markReady: t('markReady'),
    dispatch: t('dispatch'),
    assignBags: t('assignBags'),
    assignDriver: t('assignDriver'),
    scanVerify: t('scanVerify'),
    addNote: t('addNote'),
    notePlaceholder: t('notePlaceholder'),
    noteSubmit: t('noteSubmit'),
    noteCancel: t('noteCancel'),
    pickupBags: t('pickupBags'),
    processingBags: t('processingBags'),
  }

  const boardLabels = {
    boardIncoming: t('boardIncoming'),
    boardProcessing: t('boardProcessing'),
    boardReady: t('boardReady'),
    selectedLabel: t('selectedLabel'),
    bulkMarkSelectedReceived: t('bulkMarkSelectedReceived'),
    bulkMarkSelectedReady: t('bulkMarkSelectedReady'),
    bulkDispatchSelected: t('bulkDispatchSelected'),
  }

  const scanLabels = {
    title: t('scanVerifyTitle'),
    subtitle: t('scanVerifySubtitle'),
    tapToVerify: t('tapToVerify'),
    verified: t('verified'),
    allVerified: t('allVerified'),
    verifyRequired: t('verifyRequired'),
  }

  const driverLabels = {
    assignDriver: t('assignDriver'),
    reassignDriver: t('reassignDriver'),
    autoAssign: t('autoAssign'),
    searchPlaceholder: t('searchDriverPlaceholder'),
  }

  const itemLabels = {
    title: t('assignItemsToBag'),
    selectItems: t('selectItems'),
    selectQuantity: t('selectQuantity'),
    addAssignment: t('addAssignment'),
    selectBag: t('selectBag'),
    searchBagPlaceholder: t('searchBagPlaceholder'),
    currentAssignments: t('currentAssignments'),
    remaining: t('remaining'),
    unassigned: t('unassigned'),
    done: t('done'),
    back: t('back'),
    noBagsFound: t('noBagsFound'),
    edit: t('editAssignment'),
    delete: t('deleteAssignment'),
    save: t('saveAssignment'),
    cancel: t('cancelAssignment'),
  }

  const alertLabels = {
    title: t('alertOverdueTitle'),
    subtitle: t('alertOverdueSubtitle'),
    affectedOrders: t('alertAffectedOrders'),
  }

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
            onClick={() => setRefreshTick((tick) => tick + 1)}
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
        }
      />

      <motion.div {...fadeUp(0.08)}>
        <OperationalAlerts orders={allOrders} labels={alertLabels} />
      </motion.div>

      <LaundryStatsSection stats={stats} labels={statsLabels} />

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
        labels={filterLabels}
      />

      <motion.div {...fadeUp(0.36)}>
        <WorkflowNotice message={t('workflowNotice')} />
      </motion.div>

      {viewMode === 'list' ? (
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
          labels={listLabels}
          cardLabels={cardLabels}
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
          labels={boardLabels}
          cardLabels={cardLabels}
        />
      )}

      <ScanVerifyModal
        open={!!scanVerifyOrder}
        onOpenChange={(open) => !open && setScanVerifyOrder(null)}
        order={scanVerifyOrder}
        verifiedBags={verifiedBags}
        onVerifyBag={handleVerifyBag}
        onConfirm={handleScanVerifyConfirm}
        labels={scanLabels}
      />

      <BulkConfirmModal
        open={!!stageActionTarget}
        onOpenChange={(open) => !open && setStageActionTarget(null)}
        title={t('bulkConfirmTitle')}
        description={stageConfirmDescription}
        confirmLabel={t('bulkConfirm')}
        cancelLabel={t('bulkCancel')}
        onConfirm={confirmStageAction}
      />

      <AssignDriverModal
        open={!!assignDriverOrder}
        onOpenChange={(open) => !open && setAssignDriverOrder(null)}
        order={assignDriverOrder}
        drivers={drivers}
        onAssign={handleAssignDriver}
        onAutoAssign={handleAutoAssign}
        labels={driverLabels}
      />

      <ItemBagAssignmentModal
        open={!!itemAssignOrder}
        onOpenChange={(open) => !open && setItemAssignOrder(null)}
        order={itemAssignOrder}
        availableBags={processingBagPool}
        onSaveAssignments={handleSaveBagAssignments}
        labels={itemLabels}
      />

      <KeyboardShortcutsHint shortcuts={shortcuts} hintLabel={t('shortcutHint')} />
    </div>
  )
}
