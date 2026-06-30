import type { PaginationState } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Package } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import type { CompanyDetailsBranch, CompanyOrder } from '@/domain/entities/company-details.entity'
import { OrderStatus } from '@/domain/enums'
import {
  DataTablePagination,
  DataTablePanel,
  DataTableToolbar,
} from '@/presentation/components/dashboard/data-table'
import { OrderStatusFilter } from '@/presentation/components/admin/orders/list/order-status-filter'
import { useTranslation } from '@/presentation/hooks/use-translation'

import { BranchFilter } from '../shared/branch-filter'
import { OrderStatusBadge } from './shared-badges'

interface OrdersTabProps {
  orders: CompanyOrder[]
  branches: CompanyDetailsBranch[]
  branchFilter: string
  search: string
  isLoading?: boolean
  onBranchFilterChange: (slug: string) => void
  onSearchChange: (value: string) => void
  onOrderClick: (orderId: string) => void
}

const formatDateTime = (iso: string) => {
  try { return format(new Date(iso), 'MMM d, yyyy · h:mm a') } catch { return iso }
}

export const OrdersTab = ({
  orders,
  branches,
  branchFilter,
  search,
  isLoading = false,
  onBranchFilterChange,
  onSearchChange,
  onOrderClick,
}: OrdersTabProps) => {
  const { t } = useTranslation('companies')
  const { t: tCommon } = useTranslation('common')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesBranch = branchFilter === 'all' || order.branchSlug === branchFilter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesSearch =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.branchName.toLowerCase().includes(q)

      return matchesBranch && matchesStatus && matchesSearch
    })
  }, [orders, branchFilter, statusFilter, search])

  useEffect(() => {
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }))
  }, [branchFilter, statusFilter, search])

  const paginatedOrders = useMemo(() => {
    const start = paginationState.pageIndex * paginationState.pageSize
    return filteredOrders.slice(start, start + paginationState.pageSize)
  }, [filteredOrders, paginationState])

  const paginationLabels = useMemo(
    () => ({
      showing: tCommon('paginationShowing'),
      rowsPerPage: tCommon('paginationRowsPerPage'),
      previous: tCommon('paginationPrevious'),
      next: tCommon('paginationNext'),
    }),
    [tCommon],
  )

  return (
    <DataTablePanel
      toolbar={
        <DataTableToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder={t('detailsSearchPlaceholder')}
          endContent={
            <>
              <BranchFilter
                branches={branches}
                value={branchFilter}
                onChange={onBranchFilterChange}
              />
              <OrderStatusFilter
                value={statusFilter}
                onChange={setStatusFilter}
                labels={{
                  filterOrderStatus: t('detailsFilterOrderStatus'),
                  filterAll: t('detailsFilterAll'),
                  statusOrderCreated: t('orderStatusCreated'),
                  statusPickedUp: t('orderStatusOnTheWay'),
                  statusInLaundry: t('orderStatusInLaundry'),
                  statusReadyForDelivery: t('orderStatusReady'),
                  statusDelivered: t('orderStatusDelivered'),
                  statusCancelled: t('orderStatusCancelled'),
                }}
              />
            </>
          }
        />
      }
      footer={
        filteredOrders.length > 0 ? (
          <DataTablePagination
            pageIndex={paginationState.pageIndex}
            pageSize={paginationState.pageSize}
            totalRows={filteredOrders.length}
            onPageChange={(pageIndex) => setPaginationState((prev) => ({ ...prev, pageIndex }))}
            onPageSizeChange={(pageSize) => setPaginationState({ pageIndex: 0, pageSize })}
            labels={paginationLabels}
          />
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Package className="size-10 animate-pulse text-muted-foreground/40" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-muted-foreground">{t('detailsLoadingOrders')}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Package className="size-10 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-muted-foreground">{t('detailsNoOrders')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-5 py-3 text-start text-xs font-medium text-muted-foreground">{t('detailsOrderId')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t('detailsBranchName')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t('detailsOrderStatus')}</th>
                <th className="px-4 py-3 text-end text-xs font-medium text-muted-foreground">{t('detailsItemsCount')}</th>
                <th className="px-4 py-3 text-end text-xs font-medium text-muted-foreground">{t('detailsBagsCount')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t('detailsPickupDate')}</th>
                <th className="px-5 py-3 text-start text-xs font-medium text-muted-foreground">{t('detailsDeliveryDate')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/30 last:border-0 transition-colors hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <button type="button" onClick={() => onOrderClick(order.id)} className="text-sm font-medium text-primary hover:underline">
                      {order.orderNumber}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{order.branchName}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-end text-muted-foreground">{order.itemsCount}</td>
                  <td className="px-4 py-3 text-end text-muted-foreground">{order.bagsCount}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(order.pickupDate)}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{formatDateTime(order.deliveryDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DataTablePanel>
  )
}
