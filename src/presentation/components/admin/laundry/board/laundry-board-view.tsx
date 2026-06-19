import { motion } from 'framer-motion'
import { Package } from 'lucide-react'

import type { LaundryOrder } from '@/domain/entities/laundry-order.entity'
import { LaundryWorkflowStage } from '@/domain/enums'
import { cn } from '@/presentation/utils'

import { OrderCard, type OrderCardLabels } from '../cards/order-card'
import { LaundryBulkBar } from '../list/laundry-bulk-bar'

interface LaundryBoardViewProps {
  orders: LaundryOrder[]
  selectedIds: Set<string>
  onSelectChange: (orderId: string, selected: boolean) => void
  onStageAction: (order: LaundryOrder) => void
  onScanVerify: (order: LaundryOrder) => void
  onAssignBags: (order: LaundryOrder) => void
  onAssignDriver: (order: LaundryOrder) => void
  onAddNote: (orderId: string, content: string) => void
  onMoveOrder: (orderId: string, toStage: LaundryWorkflowStage) => void
  onBulkSelectedAction: () => void
  onClearSelection: () => void
  labels: {
    boardIncoming: string
    boardProcessing: string
    boardReady: string
    selectedLabel: string
    bulkMarkSelectedReceived: string
    bulkMarkSelectedReady: string
    bulkDispatchSelected: string
  }
  cardLabels: OrderCardLabels
}

interface BoardColumnProps {
  title: string
  count: number
  orders: LaundryOrder[]
  stage: LaundryWorkflowStage
  selectedIds: Set<string>
  onSelectChange: (orderId: string, selected: boolean) => void
  onStageAction: (order: LaundryOrder) => void
  onScanVerify: (order: LaundryOrder) => void
  onAssignBags: (order: LaundryOrder) => void
  onAssignDriver: (order: LaundryOrder) => void
  onAddNote: (orderId: string, content: string) => void
  onMoveOrder: (orderId: string, toStage: LaundryWorkflowStage) => void
  cardLabels: OrderCardLabels
  accentColor: string
  columnIndex: number
}

const stageConfig: Record<LaundryWorkflowStage, { color: string }> = {
  [LaundryWorkflowStage.IncomingToLaundry]: { color: 'bg-blue-500' },
  [LaundryWorkflowStage.InLaundry]: { color: 'bg-violet-500' },
  [LaundryWorkflowStage.ReadyForDelivery]: { color: 'bg-emerald-500' },
}

export const LaundryBoardView = ({
  orders,
  selectedIds,
  onSelectChange,
  onStageAction,
  onScanVerify,
  onAssignBags,
  onAssignDriver,
  onAddNote,
  onMoveOrder,
  onBulkSelectedAction,
  onClearSelection,
  labels,
  cardLabels,
}: LaundryBoardViewProps) => {
  const incoming = orders.filter((o) => o.stage === LaundryWorkflowStage.IncomingToLaundry)
  const inLaundry = orders.filter((o) => o.stage === LaundryWorkflowStage.InLaundry)
  const ready = orders.filter((o) => o.stage === LaundryWorkflowStage.ReadyForDelivery)

  const selectedOrders = orders.filter((o) => selectedIds.has(o.id))
  const hasSelection = selectedOrders.length > 0
  const selectedStage = selectedOrders[0]?.stage
  const homogeneousStage = selectedOrders.every((o) => o.stage === selectedStage)

  const bulkActionLabel =
    selectedStage === LaundryWorkflowStage.IncomingToLaundry
      ? labels.bulkMarkSelectedReceived
      : selectedStage === LaundryWorkflowStage.InLaundry
        ? labels.bulkMarkSelectedReady
        : labels.bulkDispatchSelected

  const columns: Omit<BoardColumnProps, 'columnIndex'>[] = [
    {
      title: labels.boardIncoming,
      count: incoming.length,
      orders: incoming,
      stage: LaundryWorkflowStage.IncomingToLaundry,
      accentColor: stageConfig[LaundryWorkflowStage.IncomingToLaundry].color,
      selectedIds,
      onSelectChange,
      onStageAction,
      onScanVerify,
      onAssignBags,
      onAssignDriver,
      onAddNote,
      onMoveOrder,
      cardLabels,
    },
    {
      title: labels.boardProcessing,
      count: inLaundry.length,
      orders: inLaundry,
      stage: LaundryWorkflowStage.InLaundry,
      accentColor: stageConfig[LaundryWorkflowStage.InLaundry].color,
      selectedIds,
      onSelectChange,
      onStageAction,
      onScanVerify,
      onAssignBags,
      onAssignDriver,
      onAddNote,
      onMoveOrder,
      cardLabels,
    },
    {
      title: labels.boardReady,
      count: ready.length,
      orders: ready,
      stage: LaundryWorkflowStage.ReadyForDelivery,
      accentColor: stageConfig[LaundryWorkflowStage.ReadyForDelivery].color,
      selectedIds,
      onSelectChange,
      onStageAction,
      onScanVerify,
      onAssignBags,
      onAssignDriver,
      onAddNote,
      onMoveOrder,
      cardLabels,
    },
  ]

  return (
    <div className="relative grid gap-4 pb-20 lg:grid-cols-3">
      {columns.map((col, index) => (
        <BoardColumn key={col.stage} {...col} columnIndex={index} />
      ))}

      <LaundryBulkBar
        visible={hasSelection}
        selectedCount={selectedOrders.length}
        selectedLabel={labels.selectedLabel}
        actionLabel={bulkActionLabel}
        onAction={onBulkSelectedAction}
        onClear={onClearSelection}
        actionDisabled={!homogeneousStage}
      />
    </div>
  )
}

const BoardColumn = ({
  title,
  count,
  orders: columnOrders,
  stage,
  accentColor,
  selectedIds,
  onSelectChange,
  onStageAction,
  onScanVerify,
  onAssignBags,
  onAssignDriver,
  onAddNote,
  onMoveOrder,
  cardLabels,
  columnIndex,
}: BoardColumnProps) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const orderId = e.dataTransfer.getData('text/plain')
    if (orderId) onMoveOrder(orderId, stage)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.4 + columnIndex * 0.08 }}
      className="flex flex-col rounded-xl border border-border/70 bg-muted/20"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2.5 px-4 py-3">
        <span className={cn('size-2.5 rounded-full', accentColor)} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
          {count}
        </span>
      </div>

      <div
        className="flex-1 space-y-2.5 overflow-y-auto px-2.5 pb-3"
        style={{ maxHeight: 'calc(100vh - 380px)' }}
      >
        {columnOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Package className="size-5 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="mt-2 text-xs text-muted-foreground/60">No orders</p>
          </div>
        ) : (
          columnOrders.map((order, index) => (
            <DraggableOrderCard
              key={order.id}
              order={order}
              index={index}
              selected={selectedIds.has(order.id)}
              cardLabels={cardLabels}
              onSelectChange={onSelectChange}
              onStageAction={onStageAction}
              onScanVerify={onScanVerify}
              onAssignBags={onAssignBags}
              onAssignDriver={onAssignDriver}
              onAddNote={onAddNote}
            />
          ))
        )}
      </div>
    </motion.div>
  )
}

interface DraggableOrderCardProps {
  order: LaundryOrder
  index: number
  selected: boolean
  cardLabels: OrderCardLabels
  onSelectChange: (orderId: string, selected: boolean) => void
  onStageAction: (order: LaundryOrder) => void
  onScanVerify: (order: LaundryOrder) => void
  onAssignBags: (order: LaundryOrder) => void
  onAssignDriver: (order: LaundryOrder) => void
  onAddNote: (orderId: string, content: string) => void
}

const DraggableOrderCard = ({
  order,
  index,
  selected,
  cardLabels,
  onSelectChange,
  onStageAction,
  onScanVerify,
  onAssignBags,
  onAssignDriver,
  onAddNote,
}: DraggableOrderCardProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', order.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div draggable onDragStart={handleDragStart} className="cursor-grab active:cursor-grabbing">
      <OrderCard
        order={order}
        labels={cardLabels}
        selected={selected}
        onSelectChange={onSelectChange}
        onStageAction={onStageAction}
        onScanVerify={onScanVerify}
        onAssignBags={onAssignBags}
        onAssignDriver={onAssignDriver}
        onAddNote={onAddNote}
      />
    </div>
  )
}
