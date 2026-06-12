import { ClipboardList } from 'lucide-react'
import { useMemo } from 'react'

import { ROUTES } from '@/presentation/routes/routes.constants'
import { DataTable } from '@/presentation/components/dashboard/data-table'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'
import { DashboardPanelCard, PanelCardActionLink } from '@/presentation/components/dashboard/widgets/panel-card'
import { createRecentOrdersColumns } from './recent-orders-columns'
import { recentOrdersDummyData } from './recent-orders.data'

interface RecentOrdersCardProps {
  index?: number
  className?: string
}

export const RecentOrdersCard = ({ index = 10, className }: RecentOrdersCardProps) => {
  const { t } = useTranslation('dashboard')
  const { isRtl } = useDirection()

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
        },
        {
          isRtl,
          onOrderClick: (order) => console.info('View order:', order.id),
          onCustomerClick: (order) => console.info('View customer:', order.customerId),
          onBranchClick: (order) => console.info('View branch:', order.branchId),
          onBagsClick: (order) => console.info('View bags:', order.bags),
          onAssignDriverClick: (order) => console.info('Assign driver:', order.id),
          onDriverClick: (order) => console.info('View driver:', order.driver?.id),
        },
      ),
    [isRtl, t],
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
      <DataTable
        columns={columns}
        data={recentOrdersDummyData}
        emptyMessage={t('recentOrdersEmpty')}
        className={cn('py-1')}
      />
    </DashboardPanelCard>
  )
}
