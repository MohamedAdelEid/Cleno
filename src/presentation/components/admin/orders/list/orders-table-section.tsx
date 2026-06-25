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
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { AssignDriverDialog } from './assign-driver-dialog'
import { OrderStatusFilter } from './order-status-filter'
import { createOrdersColumns } from './orders-columns'

interface OrdersTableSectionProps {
  orders: ManagedOrder[]
  totalRows: number
  isLoading?: boolean
  isMutating?: boolean
  keyword: string
  onKeywordChange: (value: string) => void
  statusFilter: OrderStatus | 'all'
  onStatusFilterChange: (value: OrderStatus | 'all') => void
  paginationState: PaginationState
  onPaginationStateChange: Dispatch<SetStateAction<PaginationState>>
  activeOrderSlug: string | null
  onOrderSelect: (order: ManagedOrder) => void
  assignableDrivers: OrderDriver[]
  isDriversLoading?: boolean
  onAssignDialogOpen: () => void
  onAssignDriver: (
    slug: string,
    driver: OrderDriver | null,
  ) => Promise<{ success: boolean; message?: string }>
  onCancelOrder: (slug: string) => Promise<{ success: boolean; message?: string }>
  onBulkUpdateStatus: (
    slugs: string[],
    status: OrderStatus,
  ) => Promise<{ success: boolean; message?: string }>
  onBulkCancel: (slugs: string[]) => Promise<{ success: boolean; message?: string }>
}

const TableSkeleton = () => (
  <div className="space-y-2 px-1 py-2">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 rounded-lg px-3 py-3">
        <Skeleton className="size-4 shrink-0 rounded" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32 flex-1" />
        <Skeleton className="hidden h-4 w-20 sm:block" />
        <Skeleton className="hidden h-4 w-20 md:block" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    ))}
  </div>
)

export const OrdersTableSection = ({
  orders,
  totalRows,
  isLoading = false,
  isMutating = false,
  keyword,
  onKeywordChange,
  statusFilter,
  onStatusFilterChange,
  paginationState,
  onPaginationStateChange,
  activeOrderSlug,
  onOrderSelect,
  assignableDrivers,
  isDriversLoading = false,
  onAssignDialogOpen,
  onAssignDriver,
  onCancelOrder,
  onBulkUpdateStatus,
  onBulkCancel,
}: OrdersTableSectionProps) => {
  const { t } = useTranslation('orders')
  const { t: tCommon } = useTranslation('common')
  const { isRtl } = useDirection()

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [deleteTarget, setDeleteTarget] = useState<'bulk' | ManagedOrder | null>(null)
  const [assignTarget, setAssignTarget] = useState<ManagedOrder | null>(null)

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedOrders = useMemo(
    () => orders.filter((order) => selectedIds.includes(order.id)),
    [orders, selectedIds],
  )
  const selectedCount = selectedOrders.length
  const selectedSlugs = useMemo(() => selectedOrders.map((order) => order.slug), [selectedOrders])

  const clearSelection = useCallback(() => setRowSelection({}), [])

  const handleBulkStatusChange = async (status: OrderStatus) => {
    const result = await onBulkUpdateStatus(selectedSlugs, status)
    if (!result.success) {
      notify.error({ title: t('changeStatus'), description: result.message })
      return
    }
    notify.success({
      title: t('toastStatusUpdated'),
      description: t('toastStatusUpdatedDesc', { count: selectedCount }),
    })
    clearSelection()
  }

  const handleBulkDelete = async () => {
    const result = await onBulkCancel(selectedSlugs)
    if (!result.success) {
      notify.error({ title: t('delete'), description: result.message })
      return
    }
    notify.success({
      title: t('toastDeleted'),
      description: t('toastDeletedDesc', { count: selectedCount }),
    })
    setDeleteTarget(null)
    clearSelection()
  }

  const handleSingleDelete = async (order: ManagedOrder) => {
    const result = await onCancelOrder(order.slug)
    if (!result.success) {
      notify.error({ title: t('delete'), description: result.message })
      return
    }
    notify.success({
      title: t('toastOrderDeleted'),
      description: t('toastOrderDeletedDesc', { id: order.orderNumber }),
    })
    setDeleteTarget(null)
  }

  const handleAssignDriver = async (order: ManagedOrder, driver: OrderDriver | null) => {
    const result = await onAssignDriver(order.slug, driver)
    if (!result.success) {
      notify.error({
        title: driver ? t('assignDriver') : t('removeDriverAssignment'),
        description: result.message,
      })
      return
    }
    notify.success({
      title: driver ? t('toastDriverAssigned') : t('toastDriverRemoved'),
      description: driver
        ? t('toastDriverAssignedDesc', { name: driver.fullName })
        : t('toastDriverRemovedDesc'),
    })
  }

  const openAssignDialog = useCallback(
    (order: ManagedOrder) => {
      onAssignDialogOpen()
      setAssignTarget(order)
    },
    [onAssignDialogOpen],
  )

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
          statusCancelled: t('statusCancelled'),
        },
        {
          isRtl,
          onOrderClick: onOrderSelect,
          onCompanyClick: () =>
            notify.info({ title: t('viewCompany'), description: t('viewCompanyComingSoon') }),
          onBranchClick: () =>
            notify.info({ title: t('viewBranch'), description: t('viewBranchComingSoon') }),
          onAssignDriverClick: openAssignDialog,
          onChangeDriverClick: openAssignDialog,
          onDriverClick: (order) =>
            notify.info({
              title: t('viewDriver'),
              description: order.driver?.fullName ?? '',
            }),
          onViewClick: onOrderSelect,
          onEditClick: () =>
            notify.info({ title: t('edit'), description: t('editOrderComingSoon') }),
          onDeleteClick: (order) => setDeleteTarget(order),
        },
      ),
    [isRtl, onOrderSelect, openAssignDialog, t],
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
              search={keyword}
              onSearchChange={onKeywordChange}
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
                        <Button variant="outline" size="xs" disabled={isMutating}>
                          {t('changeStatus')}
                          <ChevronDown className="size-3.5 opacity-60" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => void handleBulkStatusChange(OrderStatus.OrderCreated)}
                        >
                          {t('statusOrderCreated')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            void handleBulkStatusChange(OrderStatus.PickedUp)
                          }
                        >
                          {t('statusPickedUp')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => void handleBulkStatusChange(OrderStatus.InLaundry)}
                        >
                          {t('statusInLaundry')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            void handleBulkStatusChange(OrderStatus.ReadyForDelivery)
                          }
                        >
                          {t('statusReadyForDelivery')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => void handleBulkStatusChange(OrderStatus.Delivered)}
                        >
                          {t('statusDelivered')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="destructive"
                      size="xs"
                      disabled={isMutating}
                      onClick={() => setDeleteTarget('bulk')}
                    >
                      <Trash2 />
                      {t('deleteSelected')}
                    </Button>
                  </DataTableBulkActions>

                  <OrderStatusFilter
                    value={statusFilter}
                    onChange={onStatusFilterChange}
                    labels={{
                      filterOrderStatus: t('filterOrderStatus'),
                      filterAll: t('filterAll'),
                      statusOrderCreated: t('statusOrderCreated'),
                      statusPickedUp: t('statusPickedUp'),
                      statusInLaundry: t('statusInLaundry'),
                      statusReadyForDelivery: t('statusReadyForDelivery'),
                      statusDelivered: t('statusDelivered'),
                      statusCancelled: t('statusCancelled'),
                    }}
                  />
                </>
              }
            />
          </div>
        }
        footer={
          !isLoading ? (
            <DataTablePagination
              pageIndex={paginationState.pageIndex}
              pageSize={paginationState.pageSize}
              totalRows={totalRows}
              onPageChange={(pageIndex) =>
                onPaginationStateChange((current) => ({ ...current, pageIndex }))
              }
              onPageSizeChange={(pageSize) =>
                onPaginationStateChange({ pageIndex: 0, pageSize })
              }
              labels={paginationLabels}
            />
          ) : undefined
        }
      >
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={orders}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row.id}
            getRowClassName={(row) =>
              row.slug === activeOrderSlug
                ? 'bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/15'
                : undefined
            }
            onRowClick={onOrderSelect}
            emptyMessage={t('empty')}
            animateRows
            className="py-1"
          />
        )}
      </DataTablePanel>

      <AssignDriverDialog
        key={assignTarget?.id ?? 'closed'}
        open={!!assignTarget}
        onOpenChange={(open) => !open && setAssignTarget(null)}
        orderNumber={assignTarget?.orderNumber ?? ''}
        currentDriverId={assignTarget?.driver?.id ?? null}
        drivers={assignableDrivers}
        isLoading={isDriversLoading}
        labels={{
          title: t('assignDriverTitle'),
          description: t('assignDriverDescription'),
          searchPlaceholder: t('assignDriverSearch'),
          removeAssignment: t('removeDriverAssignment'),
          assign: t('assignDriver'),
          cancel: t('cancel'),
        }}
        onAssign={(driver) => assignTarget && void handleAssignDriver(assignTarget, driver)}
        onRemove={() => assignTarget && void handleAssignDriver(assignTarget, null)}
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
        loading={isMutating}
        onConfirm={() => {
          if (deleteTarget === 'bulk') {
            void handleBulkDelete()
            return
          }
          if (deleteTarget) {
            void handleSingleDelete(deleteTarget)
          }
        }}
      />
    </>
  )
}
