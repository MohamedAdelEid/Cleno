import { motion } from 'framer-motion'
import { Package, XCircle } from 'lucide-react'
import { useState } from 'react'

import type { LaundryOrder } from '@/domain/entities/laundry-order.entity'
import { LaundryWorkflowStage } from '@/domain/enums'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'

import { OrderCard } from '../cards/order-card'
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
  accentColor: string
  columnIndex: number
  draggedOrder: LaundryOrder | null
  dropTarget: DropTarget | null
  onDragStart: (order: LaundryOrder) => void
  onDragEnd: () => void
  onDragOverColumn: (
    event: React.DragEvent<HTMLDivElement>,
    stage: LaundryWorkflowStage,
    orders: LaundryOrder[],
  ) => void
  onDropOnColumn: (stage: LaundryWorkflowStage) => void
  onClearDropTarget: (stage: LaundryWorkflowStage) => void
}

const stageConfig: Record<LaundryWorkflowStage, { color: string }> = {
  [LaundryWorkflowStage.IncomingToLaundry]: { color: 'bg-blue-500' },
  [LaundryWorkflowStage.InLaundry]: { color: 'bg-violet-500' },
  [LaundryWorkflowStage.ReadyForDelivery]: { color: 'bg-emerald-500' },
}

const stageRank: Record<LaundryWorkflowStage, number> = {
  [LaundryWorkflowStage.IncomingToLaundry]: 0,
  [LaundryWorkflowStage.InLaundry]: 1,
  [LaundryWorkflowStage.ReadyForDelivery]: 2,
}

interface DropTarget {
  stage: LaundryWorkflowStage
  index: number
  allowed: boolean
}

const canMoveToStage = (order: LaundryOrder | null, targetStage: LaundryWorkflowStage) => {
  if (!order) return true
  return stageRank[targetStage] >= stageRank[order.stage]
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
}: LaundryBoardViewProps) => {
  const { t } = useTranslation('laundry')
  const [draggedOrder, setDraggedOrder] = useState<LaundryOrder | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)

  const incoming = orders.filter((o) => o.stage === LaundryWorkflowStage.IncomingToLaundry)
  const inLaundry = orders.filter((o) => o.stage === LaundryWorkflowStage.InLaundry)
  const ready = orders.filter((o) => o.stage === LaundryWorkflowStage.ReadyForDelivery)

  const selectedOrders = orders.filter((o) => selectedIds.has(o.id))
  const hasSelection = selectedOrders.length > 0
  const selectedStage = selectedOrders[0]?.stage
  const homogeneousStage = selectedOrders.every((o) => o.stage === selectedStage)

  const bulkActionLabel =
    selectedStage === LaundryWorkflowStage.IncomingToLaundry
      ? t('bulkMarkSelectedReceived')
      : selectedStage === LaundryWorkflowStage.InLaundry
        ? t('bulkMarkSelectedReady')
        : t('bulkDispatchSelected')

  const handleDragStart = (order: LaundryOrder) => {
    setDraggedOrder(order)
    setDropTarget(null)
  }

  const handleDragEnd = () => {
    setDraggedOrder(null)
    setDropTarget(null)
  }

  const getDropIndex = (event: React.DragEvent<HTMLDivElement>, columnOrders: LaundryOrder[]) => {
    const cardElements = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[data-order-card-id]'),
    )
    const pointerY = event.clientY
    const hoveredIndex = cardElements.findIndex((element) => {
      const rect = element.getBoundingClientRect()
      return pointerY < rect.top + rect.height / 2
    })

    if (hoveredIndex === -1) return columnOrders.length
    return hoveredIndex
  }

  const handleDragOverColumn = (
    event: React.DragEvent<HTMLDivElement>,
    stage: LaundryWorkflowStage,
    columnOrders: LaundryOrder[],
  ) => {
    event.preventDefault()

    const allowed = canMoveToStage(draggedOrder, stage)
    event.dataTransfer.dropEffect = allowed ? 'move' : 'none'

    setDropTarget({
      stage,
      index: getDropIndex(event, columnOrders),
      allowed,
    })
  }

  const handleDropOnColumn = (stage: LaundryWorkflowStage) => {
    if (!draggedOrder || !canMoveToStage(draggedOrder, stage)) {
      handleDragEnd()
      return
    }

    onMoveOrder(draggedOrder.id, stage)
    handleDragEnd()
  }

  const handleClearDropTarget = (stage: LaundryWorkflowStage) => {
    setDropTarget((current) => (current?.stage === stage ? null : current))
  }

  const columns: Omit<
    BoardColumnProps,
    | 'columnIndex'
    | 'draggedOrder'
    | 'dropTarget'
    | 'onDragStart'
    | 'onDragEnd'
    | 'onDragOverColumn'
    | 'onDropOnColumn'
    | 'onClearDropTarget'
  >[] = [
    {
      title: t('boardIncoming'),
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
    },
    {
      title: t('boardProcessing'),
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
    },
    {
      title: t('boardReady'),
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
    },
  ]

  return (
    <div className="relative grid gap-4 pb-20 lg:grid-cols-3">
      {columns.map((col, index) => (
        <BoardColumn
          key={col.stage}
          {...col}
          columnIndex={index}
          draggedOrder={draggedOrder}
          dropTarget={dropTarget}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOverColumn={handleDragOverColumn}
          onDropOnColumn={handleDropOnColumn}
          onClearDropTarget={handleClearDropTarget}
        />
      ))}

      <LaundryBulkBar
        visible={hasSelection}
        selectedCount={selectedOrders.length}
        selectedLabel={t('selectedLabel')}
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
  columnIndex,
  draggedOrder,
  dropTarget,
  onDragStart,
  onDragEnd,
  onDragOverColumn,
  onDropOnColumn,
  onClearDropTarget,
}: BoardColumnProps) => {
  const columnDropTarget = dropTarget?.stage === stage ? dropTarget : null
  const isInvalidDropTarget = !!draggedOrder && columnDropTarget?.allowed === false
  const showEmptyDropLine =
    columnDropTarget?.allowed && columnOrders.length === 0 && columnDropTarget.index === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.4 + columnIndex * 0.08 }}
      className={cn(
        'relative flex min-h-[34rem] flex-col rounded-xl border border-border/70 bg-muted/20 transition-colors xl:min-h-[42rem] 2xl:min-h-[48rem]',
        isInvalidDropTarget && 'border-destructive/40 bg-destructive/5',
        columnDropTarget?.allowed && 'border-primary/30 bg-primary/[0.03]',
      )}
      onDragOver={(event) => onDragOverColumn(event, stage, columnOrders)}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return
        onClearDropTarget(stage)
      }}
      onDrop={(event) => {
        event.preventDefault()
        onDropOnColumn(stage)
      }}
    >
      <div className="flex items-center gap-2.5 px-4 py-3">
        <span className={cn('size-2.5 rounded-full', accentColor)} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
          {count}
        </span>
      </div>

      <div
        className="relative flex-1 space-y-2.5 overflow-y-auto px-2.5 pb-3"
        style={{ maxHeight: 'calc(100vh - 250px)' }}
      >
        {isInvalidDropTarget && (
          <div className="pointer-events-none absolute inset-2 z-20 flex items-center justify-center rounded-lg border border-dashed border-destructive/45 bg-background/75 text-destructive shadow-sm backdrop-blur-[2px]">
            <XCircle className="size-8" strokeWidth={1.8} />
          </div>
        )}

        {columnOrders.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center py-10">
            {showEmptyDropLine && <DropIndicator />}
            <Package className="size-5 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="mt-2 text-xs text-muted-foreground/60">No orders</p>
          </div>
        ) : (
          <>
            {columnDropTarget?.allowed && columnDropTarget.index === 0 ? <DropIndicator /> : null}
            {columnOrders.map((order, index) => (
              <div key={order.id} data-order-card-id={order.id}>
                <DraggableOrderCard
                  order={order}
                  selected={selectedIds.has(order.id)}
                  onSelectChange={onSelectChange}
                  onStageAction={onStageAction}
                  onScanVerify={onScanVerify}
                  onAssignBags={onAssignBags}
                  onAssignDriver={onAssignDriver}
                  onAddNote={onAddNote}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
                {columnDropTarget?.allowed && columnDropTarget.index === index + 1 ? (
                  <DropIndicator />
                ) : null}
              </div>
            ))}
          </>
        )}
      </div>
    </motion.div>
  )
}

const DropIndicator = () => (
  <motion.div
    layout
    initial={{ opacity: 0, scaleX: 0.9 }}
    animate={{ opacity: 1, scaleX: 1 }}
    exit={{ opacity: 0, scaleX: 0.9 }}
    transition={{ duration: 0.14 }}
    className="my-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
  />
)

interface DraggableOrderCardProps {
  order: LaundryOrder
  selected: boolean
  onSelectChange: (orderId: string, selected: boolean) => void
  onStageAction: (order: LaundryOrder) => void
  onScanVerify: (order: LaundryOrder) => void
  onAssignBags: (order: LaundryOrder) => void
  onAssignDriver: (order: LaundryOrder) => void
  onAddNote: (orderId: string, content: string) => void
  onDragStart: (order: LaundryOrder) => void
  onDragEnd: () => void
}

const DraggableOrderCard = ({
  order,
  selected,
  onSelectChange,
  onStageAction,
  onScanVerify,
  onAssignBags,
  onAssignDriver,
  onAddNote,
  onDragStart,
  onDragEnd,
}: DraggableOrderCardProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', order.id)
    e.dataTransfer.effectAllowed = 'move'
    onDragStart(order)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className="cursor-grab active:cursor-grabbing"
    >
      <OrderCard
        order={order}
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
