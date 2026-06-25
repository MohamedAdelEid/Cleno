import { MoreVertical, Package } from 'lucide-react'
import { useMemo } from 'react'

import { OrderStatus } from '@/domain/enums'
import type { ActiveShipment } from '@/domain/types'
import { OrderStatusBadge } from '@/presentation/components/admin/overview/recent-orders/order-status-badge'
import { DashboardPanelCard } from '@/presentation/components/dashboard/widgets/panel-card'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'
import { OrderTimeline } from './order-timeline'
import { ShipmentMapPreview } from './shipment-map-preview'

interface ShipmentTrackingCardProps {
  index?: number
  className?: string
  shipment: ActiveShipment | null
  isLoading?: boolean
  isEmpty?: boolean
}

const TrackingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-44 w-full rounded-xl" />
    <div className="flex items-center justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
    <div className="space-y-4 border-t border-border/60 pt-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="size-6 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const ShipmentTrackingCard = ({
  index = 4,
  className,
  shipment,
  isLoading = false,
  isEmpty = false,
}: ShipmentTrackingCardProps) => {
  const { t } = useTranslation('orders')
  const { isRtl } = useDirection()

  const statusLabels = useMemo<Record<OrderStatus, string>>(
    () => ({
      [OrderStatus.OrderCreated]: t('statusOrderCreated'),
      [OrderStatus.PickedUp]: t('statusPickedUp'),
      [OrderStatus.InLaundry]: t('statusInLaundry'),
      [OrderStatus.ReadyForDelivery]: t('statusReadyForDelivery'),
      [OrderStatus.Delivered]: t('statusDelivered'),
      [OrderStatus.Cancelled]: t('statusCancelled'),
    }),
    [t],
  )

  return (
    <DashboardPanelCard
      title={t('trackingTitle')}
      index={index}
      className={cn('flex h-full flex-col', className)}
      innerClassName="flex flex-1 flex-col p-4 sm:p-5"
      action={
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={t('trackingOptions')}
          className="text-muted-foreground"
        >
          <MoreVertical className="size-4" strokeWidth={2} />
        </Button>
      }
    >
      {isLoading ? (
        <TrackingSkeleton />
      ) : isEmpty || !shipment ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full border border-dashed border-border bg-muted/30">
            <Package className="size-5 text-muted-foreground" strokeWidth={1.75} />
          </span>
          <p className="mt-4 text-sm font-medium text-foreground">{t('trackingEmptyTitle')}</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">{t('trackingEmptyDesc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <ShipmentMapPreview mapUrl={shipment.mapUrl} openMapLabel={t('trackingOpenMap')} />

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('trackingOrderId')}</p>
              <p className="truncate text-sm font-semibold text-foreground">
                #{shipment.orderNumber}
              </p>
            </div>
            <OrderStatusBadge
              status={shipment.status}
              label={statusLabels[shipment.status]}
            />
          </div>

          <div className="border-t border-border/60 pt-4">
            <OrderTimeline
              steps={shipment.steps}
              statusLabels={statusLabels}
              estimatedLabel={(date) => t('trackingEstimated', { date })}
              isRtl={isRtl}
            />
          </div>
        </div>
      )}
    </DashboardPanelCard>
  )
}
