import type { Dispatch, SetStateAction } from 'react'
import type { PaginationState, RowSelectionState } from '@tanstack/react-table'
import { ChevronDown, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import type { ManagedOrder, OrderDriver } from '@/domain/entities'
import { OrderStatus } from '@/domain/enums'
import { notify } from '@/infrastructure/libs/toast/toast'
import {
  DataTable,
  DataTableBulkActions,
  DataTablePagination,
  DataTablePanel,
  DataTableToolbar,
} from '@/presentation/components/dashboard/data-table'
import { ConfirmDialog } from '@/presentation/components/feedback/confirm-dialog'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { assignableDriversDummyData } from '../orders-table.data'
import { AssignDriverDialog } from './assign-driver-dialog'
import { OrderStatusFilter } from './order-status-filter'
import { createOrdersColumns } from './orders-columns'

interface OrdersTableSectionProps {
  orders: ManagedOrder[]
  setOrders: Dispatch<SetStateAction<ManagedOrder[]>>
}

export const OrdersTableSection = ({ orders, setOrders }: OrdersTableSectionProps) => {
  const { t } = useTranslation('orders')
  const { t: tCommon } = useTranslation('common')
  const { isRtl } = useDirection()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })
  const [deleteTarget, setDeleteTarget] = useState<'bulk' | ManagedOrder | null>(null)
  const [assignTarget, setAssignTarget] = useState<ManagedOrder | null>(null)

  const filteredOrders = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesSearch =
        !normalized ||
        order.orderNumber.toLowerCase().includes(normalized) ||
        order.company.name.toLowerCase().includes(normalized) ||
        order.company.email.toLowerCase().includes(normalized) ||
        order.company.type.toLowerCase().includes(normalized) ||
        order.branchName.toLowerCase().includes(normalized) ||
        order.driver?.fullName.toLowerCase().includes(normalized) ||
        order.driver?.email.toLowerCase().includes(normalized) ||
        order.bags.some((bag) => bag.toLowerCase().includes(normalized))

      return matchesStatus && matchesSearch
    })
  }, [orders, search, statusFilter])

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedCount = selectedIds.length

  const clearSelection = useCallback(() => setRowSelection({}), [])

  const handleBulkStatusChange = (status: OrderStatus) => {
    setOrders((current) =>
      current.map((order) =>
        selectedIds.includes(order.id) ? { ...order, status } : order,
      ),
    )
    notify.success({
      title: t('toastStatusUpdated'),
      description: t('toastStatusUpdatedDesc', { count: selectedCount }),
    })
    clearSelection()
  }

  const handleBulkDelete = () => {
    setOrders((current) => current.filter((order) => !selectedIds.includes(order.id)))
    notify.success({
      title: t('toastDeleted'),
      description: t('toastDeletedDesc', { count: selectedCount }),
    })
    setDeleteTarget(null)
    clearSelection()
  }

  const handleSingleDelete = (order: ManagedOrder) => {
    setOrders((current) => current.filter((item) => item.id !== order.id))
    notify.success({
      title: t('toastOrderDeleted'),
      description: t('toastOrderDeletedDesc', { id: order.orderNumber }),
    })
    setDeleteTarget(null)
  }

  const handleAssignDriver = (orderId: string, driver: OrderDriver | null) => {
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, driver } : order)),
    )
    notify.success({
      title: driver ? t('toastDriverAssigned') : t('toastDriverRemoved'),
      description: driver
        ? t('toastDriverAssignedDesc', { name: driver.fullName })
        : t('toastDriverRemovedDesc'),
    })
  }

  const columns = useMemo(
    () =>
      createOrdersColumns(
        {
          orderId: t('colOrderId'),
          customer: t('colCustomer'),
          pickup: t('colPickup'),
          expectedDelivery: t('colExpectedDelivery'),
          bags: t('colBags'),
          driver: t('colDriver'),
          status: t('colStatus'),
          assignDriver: t('assignDriver'),
          changeDriver: t('changeDriver'),
          view: t('view'),
          edit: t('edit'),
          delete: t('delete'),
          statusOrderCreated: t('statusOrderCreated'),
          statusPickedUp: t('statusPickedUp'),
          statusInLaundry: t('statusInLaundry'),
          statusReadyForDelivery: t('statusReadyForDelivery'),
          statusDelivered: t('statusDelivered'),
        },
        {
          isRtl,
          onOrderClick: () =>
            notify.info({ title: t('view'), description: t('viewOrderComingSoon') }),
          onCompanyClick: () =>
            notify.info({ title: t('viewCompany'), description: t('viewCompanyComingSoon') }),
          onBranchClick: () =>
            notify.info({ title: t('viewBranch'), description: t('viewBranchComingSoon') }),
          onAssignDriverClick: setAssignTarget,
          onChangeDriverClick: setAssignTarget,
          onDriverClick: (order) =>
            notify.info({
              title: t('viewDriver'),
              description: order.driver?.fullName ?? '',
            }),
          onViewClick: () =>
            notify.info({ title: t('view'), description: t('viewOrderComingSoon') }),
          onEditClick: () =>
            notify.info({ title: t('edit'), description: t('editOrderComingSoon') }),
          onDeleteClick: (order) => setDeleteTarget(order),
        },
      ),
    [isRtl, t],
  )

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
    <>
      <DataTablePanel
        index={5}
        tableClassName="overflow-x-auto"
        toolbar={
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-medium text-foreground">{t('tableTitle')}</h2>
              <p className="text-xs text-muted-foreground">{t('tableDescription')}</p>
            </div>

            <DataTableToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder={t('searchPlaceholder')}
              endContent={
                <>
                  <DataTableBulkActions
                    visible={selectedCount > 0}
                    selectedCount={selectedCount}
                    selectedLabel={t('selected')}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="xs">
                          {t('changeStatus')}
                          <ChevronDown className="size-3.5 opacity-60" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleBulkStatusChange(OrderStatus.OrderCreated)}
                        >
                          {t('statusOrderCreated')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleBulkStatusChange(OrderStatus.OnTheWayToLaundry)
                          }
                        >
                          {t('statusPickedUp')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBulkStatusChange(OrderStatus.InLaundry)}
                        >
                          {t('statusInLaundry')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleBulkStatusChange(OrderStatus.ReadyForDelivery)
                          }
                        >
                          {t('statusReadyForDelivery')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBulkStatusChange(OrderStatus.Delivered)}
                        >
                          {t('statusDelivered')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => setDeleteTarget('bulk')}
                    >
                      <Trash2 />
                      {t('deleteSelected')}
                    </Button>
                  </DataTableBulkActions>

                  <OrderStatusFilter
                    value={statusFilter}
                    onChange={setStatusFilter}
                    labels={{
                      filterOrderStatus: t('filterOrderStatus'),
                      filterAll: t('filterAll'),
                      statusOrderCreated: t('statusOrderCreated'),
                      statusPickedUp: t('statusPickedUp'),
                      statusInLaundry: t('statusInLaundry'),
                      statusReadyForDelivery: t('statusReadyForDelivery'),
                      statusDelivered: t('statusDelivered'),
                    }}
                  />
                </>
              }
            />
          </div>
        }
        footer={
          <DataTablePagination
            pageIndex={paginationState.pageIndex}
            pageSize={paginationState.pageSize}
            totalRows={filteredOrders.length}
            onPageChange={(pageIndex) =>
              setPaginationState((current) => ({ ...current, pageIndex }))
            }
            onPageSizeChange={(pageSize) => setPaginationState({ pageIndex: 0, pageSize })}
            labels={paginationLabels}
          />
        }
      >
        <DataTable
          columns={columns}
          data={filteredOrders}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={(row) => row.id}
          emptyMessage={t('empty')}
          animateRows
          enablePagination
          pagination={paginationState}
          onPaginationChange={setPaginationState}
          className="py-1"
        />
      </DataTablePanel>

      <AssignDriverDialog
        key={assignTarget?.id ?? 'closed'}
        open={!!assignTarget}
        onOpenChange={(open) => !open && setAssignTarget(null)}
        orderNumber={assignTarget?.orderNumber ?? ''}
        currentDriverId={assignTarget?.driver?.id ?? null}
        drivers={assignableDriversDummyData}
        labels={{
          title: t('assignDriverTitle'),
          description: t('assignDriverDescription'),
          searchPlaceholder: t('assignDriverSearch'),
          removeAssignment: t('removeDriverAssignment'),
          assign: t('assignDriver'),
          cancel: t('cancel'),
        }}
        onAssign={(driver) => assignTarget && handleAssignDriver(assignTarget.id, driver)}
        onRemove={() => assignTarget && handleAssignDriver(assignTarget.id, null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget === 'bulk' ? t('deleteBulkTitle') : t('deleteTitle')}
        description={
          deleteTarget === 'bulk'
            ? t('deleteBulkDescription', { count: selectedCount })
            : t('deleteDescription', { id: (deleteTarget as ManagedOrder)?.orderNumber ?? '' })
        }
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        destructive
        onConfirm={() => {
          if (deleteTarget === 'bulk') {
            handleBulkDelete()
            return
          }
          if (deleteTarget) {
            handleSingleDelete(deleteTarget)
          }
        }}
      />
    </>
  )
}
