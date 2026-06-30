import { ClipboardList } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import type { RecentOrder } from '@/domain/entities'
import { ROUTES } from '@/presentation/routes/routes.constants'
import { DataTable } from '@/presentation/components/dashboard/data-table'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'
import { DashboardPanelCard, PanelCardActionLink } from '@/presentation/components/dashboard/widgets/panel-card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { createRecentOrdersColumns } from './recent-orders-columns'

interface RecentOrdersCardProps {
  index?: number
  className?: string
  orders: RecentOrder[]
  isLoading?: boolean
}

export const RecentOrdersCard = ({
  index = 10,
  className,
  orders,
  isLoading = false,
}: RecentOrdersCardProps) => {
  const { t } = useTranslation('dashboard')
  const { isRtl } = useDirection()
  const navigate = useNavigate()

  const columns = useMemo(
    () =>
      createRecentOrdersColumns(
        {
          orderId: t('recentOrdersColOrderId'),
          customer: t('recentOrdersColCustomer'),
          branch: t('recentOrdersColBranch'),
          pickup: t('recentOrdersColPickup'),
          expectedDelivery: t('recentOrdersColExpectedDelivery'),
          bags: t('recentOrdersColBags'),
          driver: t('recentOrdersColDriver'),
          status: t('recentOrdersColStatus'),
          unassigned: t('recentOrdersUnassigned'),
          viewOrder: t('recentOrdersViewOrder'),
          viewCustomer: t('recentOrdersViewCustomer'),
          copyOrderId: t('recentOrdersCopyOrderId'),
          assignDriver: t('recentOrdersAssignDriver'),
          statusOrderCreated: t('orderStatusCreated'),
          statusOnTheWayToLaundry: t('orderStatusOnTheWay'),
          statusInLaundry: t('orderStatusInLaundry'),
          statusReadyForDelivery: t('orderStatusReady'),
          statusDelivered: t('orderStatusDelivered'),
          statusCancelled: t('orderStatusCancelled'),
        },
        {
          isRtl,
          onOrderClick: (order) => navigate(ROUTES.ORDERS.withSearch(order.orderNumber)),
          onCustomerClick: (order) => {
            if (order.customerId) {
              navigate(ROUTES.COMPANIES.details(order.customerId))
            }
          },
          onBranchClick: () => navigate(ROUTES.BRANCHES.INDEX),
          onBagsClick: () => navigate(ROUTES.OPERATIONAL_BAGS.INDEX),
          onAssignDriverClick: (order) => navigate(ROUTES.ORDERS.withSearch(order.orderNumber)),
          onDriverClick: (order) => {
            if (order.driver?.fullName) {
              navigate(ROUTES.DRIVERS.withSearch(order.driver.fullName))
            }
          },
        },
      ),
    [isRtl, navigate, t],
  )

  return (
    <DashboardPanelCard
      title={t('recentOrders')}
      icon={ClipboardList}
      index={index}
      className={className}
      innerClassName="overflow-hidden"
      action={
        <PanelCardActionLink
          to={ROUTES.ORDERS.INDEX}
          label={t('recentOrdersViewAll')}
        />
      }
    >
      {isLoading ? (
        <div className="space-y-3 px-4 py-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          emptyMessage={t('recentOrdersEmpty')}
          className={cn('py-1')}
        />
      )}
    </DashboardPanelCard>
  )
}
