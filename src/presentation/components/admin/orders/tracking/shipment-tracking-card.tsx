import { MoreVertical } from 'lucide-react'
import { useMemo } from 'react'

import { OrderStatus } from '@/domain/enums'
import { OrderStatusBadge } from '@/presentation/components/admin/overview/recent-orders/order-status-badge'
import { DashboardPanelCard } from '@/presentation/components/dashboard/widgets/panel-card'
import { Button } from '@/presentation/components/ui/button'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'
import { activeShipment } from './shipment-tracking.data'
import { OrderTimeline } from './order-timeline'
import { ShipmentMapPreview } from './shipment-map-preview'

interface ShipmentTrackingCardProps {
  index?: number
  className?: string
}

export const ShipmentTrackingCard = ({ index = 4, className }: ShipmentTrackingCardProps) => {
  const { t } = useTranslation('orders')
  const { isRtl } = useDirection()

  const statusLabels = useMemo<Record<OrderStatus, string>>(
    () => ({
      [OrderStatus.OrderCreated]: t('statusOrderCreated'),
      [OrderStatus.OnTheWayToLaundry]: t('statusPickedUp'),
      [OrderStatus.InLaundry]: t('statusInLaundry'),
      [OrderStatus.ReadyForDelivery]: t('statusReadyForDelivery'),
      [OrderStatus.Delivered]: t('statusDelivered'),
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
      <div className="space-y-4">
        <ShipmentMapPreview mapUrl={activeShipment.mapUrl} openMapLabel={t('trackingOpenMap')} />

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t('trackingOrderId')}</p>
            <p className="truncate text-sm font-semibold text-foreground">
              #{activeShipment.orderNumber}
            </p>
          </div>
          <OrderStatusBadge
            status={activeShipment.status}
            label={statusLabels[activeShipment.status]}
          />
        </div>

        <div className="border-t border-border/60 pt-4">
          <OrderTimeline
            steps={activeShipment.steps}
            statusLabels={statusLabels}
            estimatedLabel={(date) => t('trackingEstimated', { date })}
            isRtl={isRtl}
          />
        </div>
      </div>
    </DashboardPanelCard>
  )
}
