import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle2,
  ChevronDown,
  Package,
  Pencil,
  ScanLine,
  Send,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import { useState } from 'react'

import type { LaundryOrder } from '@/domain/entities/laundry-order.entity'
import { BagStatus, LaundryWorkflowStage, UrgencyLevel } from '@/domain/enums'
import { Button } from '@/presentation/components/ui/button'
import { Checkbox } from '@/presentation/components/ui/checkbox'
import { cn } from '@/presentation/utils'

import { OrderIncidentTrigger } from '../incidents/order-incident-trigger'
import { OrderNoteTrigger } from '../notes/order-note-trigger'
import {
  getPickupBagCount,
  getProcessingBagCount,
} from '../shared/laundry-order.utils'
import { BagStatusBadge } from './bag-status-badge'
import { ProcessingTimer } from './processing-timer'
import { TimeDisplay } from './time-display'
import { UrgencyBadge } from './urgency-badge'

const LAYOUT_EASE = [0.25, 0.1, 0.25, 1] as const

export interface OrderCardLabels {
  items: string
  bags: string
  pickupTime: string
  deliverBy: string
  assignedBags: string
  bagsExpanded: string
  bagStatusOnTheWay: string
  bagStatusProcessing: string
  bagStatusReady: string
  inLaundryFor: string
  urgencyWarning: string
  urgencyUrgent: string
  urgencyOverdue: string
  markReceived: string
  markReady: string
  dispatch: string
  assignBags: string
  assignDriver: string
  scanVerify: string
  addNote: string
  notePlaceholder: string
  noteSubmit: string
  noteCancel: string
  pickupBags: string
  processingBags: string
}

interface OrderCardProps {
  order: LaundryOrder
  labels: OrderCardLabels
  selected?: boolean
  onSelectChange?: (orderId: string, selected: boolean) => void
  onStageAction?: (order: LaundryOrder) => void
  onScanVerify?: (order: LaundryOrder) => void
  onAssignBags?: (order: LaundryOrder) => void
  onAssignDriver?: (order: LaundryOrder) => void
  onAddNote?: (orderId: string, content: string) => void
}

const getBagStatusLabel = (status: BagStatus, labels: OrderCardLabels): string => {
  switch (status) {
    case BagStatus.OnTheWay:
      return labels.bagStatusOnTheWay
    case BagStatus.Processing:
      return labels.bagStatusProcessing
    case BagStatus.Ready:
      return labels.bagStatusReady
  }
}

export const OrderCard = ({
  order,
  labels,
  selected = false,
  onSelectChange,
  onStageAction,
  onScanVerify,
  onAssignBags,
  onAssignDriver,
  onAddNote,
}: OrderCardProps) => {
  const [bagsExpanded, setBagsExpanded] = useState(false)

  const customerInitial = order.customer.name.charAt(0).toUpperCase()
  const isIncoming = order.stage === LaundryWorkflowStage.IncomingToLaundry
  const isInLaundry = order.stage === LaundryWorkflowStage.InLaundry
  const isReady = order.stage === LaundryWorkflowStage.ReadyForDelivery

  const displayBags = isIncoming ? order.pickupBags : order.processingBags
  const bagCount = isIncoming ? getPickupBagCount(order) : getProcessingBagCount(order)
  const bagsLabel = isIncoming ? labels.pickupBags : labels.processingBags

  const stageActionLabel = isIncoming
    ? labels.markReceived
    : isInLaundry
      ? labels.markReady
      : labels.dispatch

  const StageIcon = isIncoming ? CheckCircle2 : isInLaundry ? Package : Send

  return (
    <motion.article
      layout
      transition={{ layout: { duration: 0.35, ease: LAYOUT_EASE } }}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-background shadow-xs transition-shadow duration-200',
        'hover:shadow-md',
        selected ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border/70',
      )}
    >
      <div className="flex items-start gap-2.5 px-4 pt-4 pb-3">
        {onSelectChange && (
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelectChange(order.id, checked === true)}
            className="mt-1 shrink-0"
            aria-label={`Select ${order.orderNumber}`}
          />
        )}

        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-sm font-bold text-foreground/80">
          {customerInitial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">{order.orderNumber}</span>
            <UrgencyBadge
              urgency={order.urgency}
              label={
                order.urgency === UrgencyLevel.Warning
                  ? labels.urgencyWarning
                  : order.urgency === UrgencyLevel.Urgent
                    ? labels.urgencyUrgent
                    : order.urgency === UrgencyLevel.Overdue
                      ? labels.urgencyOverdue
                      : ''
              }
            />
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {order.customer.name}
            <span className="mx-1.5 text-border">·</span>
            <span className="text-muted-foreground/70">{order.customer.type}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/60">{order.customer.branchName}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <OrderIncidentTrigger order={order} />
          {onAddNote && (
            <OrderNoteTrigger
              order={order}
              onAddNote={onAddNote}
              labels={{
                title: labels.addNote,
                placeholder: labels.notePlaceholder,
                submit: labels.noteSubmit,
                cancel: labels.noteCancel,
              }}
            />
          )}
        </div>
      </div>

      {isInLaundry && order.inLaundrySince && (
        <div className="px-4 pb-2">
          <ProcessingTimer since={order.inLaundrySince} label={labels.inLaundryFor} />
        </div>
      )}

      <div className="flex items-center gap-4 border-t border-border/50 px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShoppingBag className="size-3.5" strokeWidth={1.75} />
          <span className="font-medium">{labels.items.replace('{{count}}', String(order.itemCount))}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Package className="size-3.5" strokeWidth={1.75} />
          <span className="font-medium">{labels.bags.replace('{{count}}', String(bagCount))}</span>
        </div>
        <div className="ms-auto flex items-center gap-4">
          <TimeDisplay time={order.pickupTime} label={labels.pickupTime} />
          <TimeDisplay time={order.deliverBy} label={labels.deliverBy} isDeadline />
        </div>
      </div>

      {displayBags.length > 0 && (
        <div className="border-t border-border/50">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/30"
            onClick={() => setBagsExpanded(!bagsExpanded)}
          >
            <span>
              {bagsLabel} — {labels.bagsExpanded.replace('{{count}}', String(displayBags.length))}
            </span>
            <motion.span animate={{ rotate: bagsExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="size-3.5" />
            </motion.span>
          </button>

          <AnimatePresence>
            {bagsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="space-y-1.5 px-4 pb-3">
                  {displayBags.map((bag) => (
                    <div
                      key={bag.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2"
                    >
                      <span className="font-mono text-xs font-medium text-foreground/90">{bag.bagId}</span>
                      <BagStatusBadge
                        status={bag.status}
                        label={getBagStatusLabel(bag.status, labels)}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-border/50 px-4 py-3">
        {isIncoming && onScanVerify && (
          <Button variant="outline" size="xs" className="gap-1.5" onClick={() => onScanVerify(order)}>
            <ScanLine className="size-3" />
            {labels.scanVerify}
          </Button>
        )}

        {isInLaundry && onAssignBags && (
          <Button variant="outline" size="xs" className="gap-1.5" onClick={() => onAssignBags(order)}>
            <Package className="size-3" />
            {labels.assignBags}
          </Button>
        )}

        {isReady && onAssignDriver && (
          order.driver ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5">
              <span className="max-w-[120px] truncate text-xs font-medium text-foreground">
                {order.driver.fullName}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                className="size-6 shrink-0"
                onClick={() => onAssignDriver(order)}
                aria-label={labels.assignDriver}
              >
                <Pencil className="size-3" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="xs" className="gap-1.5" onClick={() => onAssignDriver(order)}>
              <Truck className="size-3" />
              {labels.assignDriver}
            </Button>
          )
        )}

        {onStageAction && (
          <Button size="xs" className="ms-auto gap-1.5" onClick={() => onStageAction(order)}>
            <StageIcon className="size-3" />
            {stageActionLabel}
          </Button>
        )}
      </div>
    </motion.article>
  )
}
