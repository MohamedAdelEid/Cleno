import { LayoutGroup, motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { useEffect } from 'react'

import type { LaundryOrder } from '@/domain/entities/laundry-order.entity'
import { LaundryWorkflowStage } from '@/domain/enums'

import { OrderCard, type OrderCardLabels } from '../cards/order-card'
import { LaundryBulkBar } from './laundry-bulk-bar'
import { WorkflowTabs } from '../tabs/workflow-tabs'

interface LaundryListViewProps {
  orders: LaundryOrder[]
  activeStage: LaundryWorkflowStage
  onStageChange: (stage: LaundryWorkflowStage) => void
  selectedIds: Set<string>
  onSelectChange: (orderId: string, selected: boolean) => void
  onSelectAll: (orderIds: string[]) => void
  onClearSelection: () => void
  onBulkSelectedAction: () => void
  onStageAction: (order: LaundryOrder) => void
  onScanVerify: (order: LaundryOrder) => void
  onAssignBags: (order: LaundryOrder) => void
  onAssignDriver: (order: LaundryOrder) => void
  onAddNote: (orderId: string, content: string) => void
  labels: {
    tabIncoming: string
    tabInLaundry: string
    tabReady: string
    emptyIncoming: string
    emptyInLaundry: string
    emptyReady: string
    selectedLabel: string
    selectAll: string
    deselectAll: string
    bulkMarkSelectedReceived: string
    bulkMarkSelectedReady: string
    bulkDispatchSelected: string
  }
  cardLabels: OrderCardLabels
}

export const LaundryListView = ({
  orders,
  activeStage,
  onStageChange,
  selectedIds,
  onSelectChange,
  onSelectAll,
  onClearSelection,
  onBulkSelectedAction,
  onStageAction,
  onScanVerify,
  onAssignBags,
  onAssignDriver,
  onAddNote,
  labels,
  cardLabels,
}: LaundryListViewProps) => {
  const incoming = orders.filter((o) => o.stage === LaundryWorkflowStage.IncomingToLaundry)
  const inLaundry = orders.filter((o) => o.stage === LaundryWorkflowStage.InLaundry)
  const ready = orders.filter((o) => o.stage === LaundryWorkflowStage.ReadyForDelivery)

  const tabs = [
    { stage: LaundryWorkflowStage.IncomingToLaundry, label: labels.tabIncoming, count: incoming.length },
    { stage: LaundryWorkflowStage.InLaundry, label: labels.tabInLaundry, count: inLaundry.length },
    { stage: LaundryWorkflowStage.ReadyForDelivery, label: labels.tabReady, count: ready.length },
  ]

  const activeOrders =
    activeStage === LaundryWorkflowStage.IncomingToLaundry
      ? incoming
      : activeStage === LaundryWorkflowStage.InLaundry
        ? inLaundry
        : ready

  const emptyMessage =
    activeStage === LaundryWorkflowStage.IncomingToLaundry
      ? labels.emptyIncoming
      : activeStage === LaundryWorkflowStage.InLaundry
        ? labels.emptyInLaundry
        : labels.emptyReady

  const bulkActionLabel =
    activeStage === LaundryWorkflowStage.IncomingToLaundry
      ? labels.bulkMarkSelectedReceived
      : activeStage === LaundryWorkflowStage.InLaundry
        ? labels.bulkMarkSelectedReady
        : labels.bulkDispatchSelected

  const selectedInStage = activeOrders.filter((o) => selectedIds.has(o.id))
  const hasSelection = selectedInStage.length > 0
  const allSelected =
    activeOrders.length > 0 && activeOrders.every((o) => selectedIds.has(o.id))

  useEffect(() => {
    onClearSelection()
  }, [activeStage, onClearSelection])

  return (
    <div className="relative space-y-4 pb-20">
      <WorkflowTabs activeStage={activeStage} onStageChange={onStageChange} tabs={tabs} />

      {activeOrders.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <LayoutGroup>
          <motion.div layout className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {activeOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                labels={cardLabels}
                selected={selectedIds.has(order.id)}
                onSelectChange={onSelectChange}
                onStageAction={onStageAction}
                onScanVerify={onScanVerify}
                onAssignBags={onAssignBags}
                onAssignDriver={onAssignDriver}
                onAddNote={onAddNote}
              />
            ))}
          </motion.div>
        </LayoutGroup>
      )}

      <LaundryBulkBar
        visible={hasSelection}
        selectedCount={selectedInStage.length}
        selectedLabel={labels.selectedLabel}
        actionLabel={bulkActionLabel}
        onAction={onBulkSelectedAction}
        onClear={onClearSelection}
        selectAllLabel={allSelected ? labels.deselectAll : labels.selectAll}
        onSelectAllToggle={() =>
          allSelected
            ? onClearSelection()
            : onSelectAll(activeOrders.map((o) => o.id))
        }
      />
    </div>
  )
}

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="flex size-14 items-center justify-center rounded-full bg-muted/50">
      <Package className="size-6 text-muted-foreground/50" strokeWidth={1.5} />
    </div>
    <p className="mt-3 text-sm text-muted-foreground">{message}</p>
  </div>
)
