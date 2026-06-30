import type { Dispatch, SetStateAction } from 'react'
import type { PaginationState, RowSelectionState } from '@tanstack/react-table'
import { CircleCheck, CircleOff, Trash2, Truck, UserPlus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ManagedDriver } from '@/domain/entities'
import { DriverAvailability } from '@/domain/enums'
import type { DriverFormValues } from '@/domain/schemas'
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
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { DriverFormDialog } from './driver-form-dialog'
import { createDriversColumns, type DriversColumnLabels } from './drivers-columns'
import { DriversFilterDropdown } from './drivers-filter-dropdown'
import type { DriverStatusFilterValue } from './hooks/use-driver-management'

interface DriversTableSectionProps {
  drivers: ManagedDriver[]
  paginatedDrivers: ManagedDriver[]
  totalRows: number
  isLoading?: boolean
  hasActiveFilters: boolean
  keyword: string
  onKeywordChange: (value: string) => void
  statusFilter: DriverStatusFilterValue
  onStatusFilterChange: (value: DriverStatusFilterValue) => void
  onClearFilters: () => void
  paginationState: PaginationState
  onPaginationStateChange: Dispatch<SetStateAction<PaginationState>>
  onCreateDriver: (values: DriverFormValues) => Promise<{ success: boolean; error?: string }>
  onUpdateDriver: (
    slug: string,
    values: DriverFormValues,
  ) => Promise<{ success: boolean; error?: string }>
  onToggleDriverStatus: (slug: string) => Promise<{ success: boolean; error?: string }>
  onDeleteDriver: (slug: string) => Promise<{ success: boolean; error?: string }>
  onBulkToggleStatus: (slugs: string[]) => Promise<{ success: boolean; error?: string }>
  onBulkDeleteDrivers: (slugs: string[]) => Promise<{ success: boolean; error?: string }>
  onRegisterOpenCreate?: (openCreate: () => void) => void
}

type PendingBulkAction = {
  type: 'available' | 'unavailable'
  slugs: string[]
} | null

type DeleteTarget = ManagedDriver | 'bulk' | null

const TableSkeleton = () => (
  <div className="space-y-2 px-1 py-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 rounded-lg px-3 py-3">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="hidden h-4 w-28 sm:block" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="hidden h-4 w-24 md:block" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    ))}
  </div>
)

const getPendingDialogCopy = (
  action: PendingBulkAction,
  t: (key: string, params?: Record<string, string | number>) => string,
) => {
  const count = action?.slugs.length ?? 0

  switch (action?.type) {
    case 'available':
      return {
        title: t('availableBulkTitle'),
        description: t('availableBulkDesc', { count }),
        confirm: t('makeAvailable'),
      }
    case 'unavailable':
      return {
        title: t('unavailableBulkTitle'),
        description: t('unavailableBulkDesc', { count }),
        confirm: t('makeUnavailable'),
      }
    default:
      return { title: '', description: '', confirm: '' }
  }
}

export const DriversTableSection = ({
  drivers,
  paginatedDrivers,
  totalRows,
  isLoading = false,
  hasActiveFilters,
  keyword,
  onKeywordChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
  paginationState,
  onPaginationStateChange,
  onCreateDriver,
  onUpdateDriver,
  onToggleDriverStatus,
  onDeleteDriver,
  onBulkToggleStatus,
  onBulkDeleteDrivers,
  onRegisterOpenCreate,
}: DriversTableSectionProps) => {
  const { t } = useTranslation('drivers')
  const { t: tCommon } = useTranslation('common')
  const { isRtl } = useDirection()

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formOpen, setFormOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<ManagedDriver | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)
  const [pendingBulkAction, setPendingBulkAction] = useState<PendingBulkAction>(null)
  const [isMutating, setIsMutating] = useState(false)

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedDrivers = useMemo(
    () => drivers.filter((driver) => selectedIds.includes(driver.id)),
    [drivers, selectedIds],
  )
  const selectedCount = selectedIds.length

  const bulkAvailableSlugs = selectedDrivers
    .filter((driver) => driver.status !== DriverAvailability.Available)
    .map((driver) => driver.slug)
  const bulkUnavailableSlugs = selectedDrivers
    .filter((driver) => driver.status === DriverAvailability.Available)
    .map((driver) => driver.slug)

  const clearSelection = useCallback(() => setRowSelection({}), [])

  const openCreate = useCallback(() => {
    setFormMode('create')
    setEditingDriver(null)
    setFormOpen(true)
  }, [])

  useEffect(() => {
    onRegisterOpenCreate?.(openCreate)
  }, [onRegisterOpenCreate, openCreate])

  const openEdit = useCallback((driver: ManagedDriver) => {
    setFormMode('edit')
    setEditingDriver(driver)
    setFormOpen(true)
  }, [])

  const handleToggleStatus = useCallback(
    async (driver: ManagedDriver) => {
      setIsMutating(true)
      const result = await onToggleDriverStatus(driver.slug)
      if (result.success) {
        notify.success({
          title: t('toastStatusUpdated'),
          description: t('toastStatusUpdatedDesc', { name: driver.fullName }),
        })
      } else {
        notify.error({
          title: t('toastActionFailed'),
          description: result.error ?? t('toastActionFailed'),
        })
      }
      setIsMutating(false)
    },
    [onToggleDriverStatus, t],
  )

  const columnLabels: DriversColumnLabels = useMemo(
    () => ({
      driver: t('colDriver'),
      phone: t('colPhone'),
      orders: t('colOrders'),
      status: t('colStatus'),
      createdAt: t('colCreatedAt'),
      statusAvailable: t('statusAvailable'),
      statusUnavailable: t('statusUnavailable'),
      copyPhone: t('copyPhone'),
      copiedPhone: t('copiedPhone'),
      makeAvailable: t('makeAvailable'),
      makeUnavailable: t('makeUnavailable'),
      edit: t('edit'),
      delete: t('delete'),
    }),
    [t],
  )

  const columns = useMemo(
    () =>
      createDriversColumns(columnLabels, {
        isRtl,
        onEditClick: openEdit,
        onToggleStatusClick: (driver) => {
          void handleToggleStatus(driver)
        },
        onDeleteClick: setDeleteTarget,
      }),
    [columnLabels, handleToggleStatus, isRtl, openEdit],
  )

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('filterAll') },
      { value: String(DriverAvailability.Available), label: t('statusAvailable') },
      { value: String(DriverAvailability.Unavailable), label: t('statusUnavailable') },
    ],
    [t],
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

  const handleFormSubmit = async (values: DriverFormValues) => {
    if (formMode === 'create') {
      const result = await onCreateDriver(values)
      if (result.success) {
        notify.success({
          title: t('toastCreated'),
          description: t('toastCreatedDesc', { name: values.fullName }),
        })
      }
      return result
    }

    if (!editingDriver) return { success: false }

    const result = await onUpdateDriver(editingDriver.slug, values)
    if (result.success) {
      notify.success({
        title: t('toastUpdated'),
        description: t('toastUpdatedDesc', { name: values.fullName }),
      })
    }
    return result
  }

  const handleSingleDelete = async () => {
    if (!deleteTarget || deleteTarget === 'bulk') return

    setIsMutating(true)
    const result = await onDeleteDriver(deleteTarget.slug)
    if (result.success) {
      notify.success({
        title: t('toastDeleted'),
        description: t('toastDeletedDesc', { name: deleteTarget.fullName }),
      })
    } else {
      notify.error({
        title: t('toastDeleteFailed'),
        description: result.error ?? t('toastDeleteActiveOrders'),
      })
    }
    setDeleteTarget(null)
    clearSelection()
    setIsMutating(false)
  }

  const handleBulkDelete = async () => {
    if (!selectedDrivers.length) return

    setIsMutating(true)
    const result = await onBulkDeleteDrivers(selectedDrivers.map((driver) => driver.slug))
    if (result.success) {
      notify.success({
        title: t('toastBulkDeleted'),
        description: t('toastBulkDeletedDesc', { count: selectedDrivers.length }),
      })
    } else {
      notify.error({
        title: t('toastDeleteFailed'),
        description: result.error ?? t('toastDeleteActiveOrders'),
      })
    }
    setDeleteTarget(null)
    clearSelection()
    setIsMutating(false)
  }

  const handleBulkAction = async () => {
    if (!pendingBulkAction?.slugs.length) return

    setIsMutating(true)
    const result = await onBulkToggleStatus(pendingBulkAction.slugs)

    if (result.success) {
      notify.success({
        title: t('toastBulkStatusUpdated'),
        description: t('toastBulkStatusUpdatedDesc', { count: pendingBulkAction.slugs.length }),
      })
    } else {
      notify.error({
        title: t('toastActionFailed'),
        description: result.error ?? t('toastActionFailed'),
      })
    }

    setPendingBulkAction(null)
    clearSelection()
    setIsMutating(false)
  }

  const isEmpty = !isLoading && drivers.length === 0 && !hasActiveFilters
  const isFilteredEmpty = !isLoading && paginatedDrivers.length === 0 && (hasActiveFilters || drivers.length > 0)
  const pendingCopy = getPendingDialogCopy(pendingBulkAction, t)

  const bulkActions = (
    <DataTableBulkActions
      visible={selectedCount > 0}
      selectedCount={selectedCount}
      selectedLabel={t('selected')}
    >
      {bulkAvailableSlugs.length > 0 ? (
        <Button
          variant="outline"
          size="xs"
          disabled={isMutating}
          onClick={() => setPendingBulkAction({ type: 'available', slugs: bulkAvailableSlugs })}
        >
          <CircleCheck />
          {t('makeAvailable')}
        </Button>
      ) : null}

      {bulkUnavailableSlugs.length > 0 ? (
        <Button
          variant="outline"
          size="xs"
          disabled={isMutating}
          onClick={() => setPendingBulkAction({ type: 'unavailable', slugs: bulkUnavailableSlugs })}
        >
          <CircleOff />
          {t('makeUnavailable')}
        </Button>
      ) : null}

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
  )

  return (
    <>
      <DataTablePanel
        index={1}
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
                  {bulkActions}
                  <DriversFilterDropdown
                    label={t('filterStatus')}
                    value={statusFilter === 'all' ? 'all' : String(statusFilter)}
                    onChange={(value) =>
                      onStatusFilterChange(
                        value === 'all' ? 'all' : (Number(value) as DriverStatusFilterValue),
                      )
                    }
                    options={statusOptions}
                    className="min-w-40"
                  />
                </>
              }
            />
          </div>
        }
        footer={
          !isLoading && totalRows > 0 ? (
            <DataTablePagination
              pageIndex={paginationState.pageIndex}
              pageSize={paginationState.pageSize}
              totalRows={totalRows}
              onPageChange={(pageIndex) =>
                onPaginationStateChange((current) => ({ ...current, pageIndex }))
              }
              onPageSizeChange={(pageSize) => onPaginationStateChange({ pageIndex: 0, pageSize })}
              labels={paginationLabels}
            />
          ) : undefined
        }
      >
        {isLoading ? (
          <TableSkeleton />
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full border border-dashed border-border bg-muted/30">
              <Truck className="size-5 text-muted-foreground" strokeWidth={1.75} />
            </span>
            <p className="mt-4 text-sm font-medium text-foreground">{t('emptyTitle')}</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t('emptyDesc')}</p>
            <Button type="button" size="sm" className="mt-5" onClick={openCreate}>
              <UserPlus className="size-4" />
              {t('createDriver')}
            </Button>
          </div>
        ) : isFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="text-sm font-medium text-foreground">{t('emptyFilterTitle')}</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t('emptyFilterDesc')}</p>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={onClearFilters}
              >
                {t('clearFilters')}
              </Button>
            ) : null}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={paginatedDrivers}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row.id}
            getRowClassName={(row) =>
              row.status === DriverAvailability.Unavailable
                ? 'bg-slate-50/50 hover:bg-slate-50/80 dark:bg-slate-950/10 dark:hover:bg-slate-950/20'
                : undefined
            }
            emptyMessage={t('emptyFilterTitle')}
            animateRows
            className="py-1"
          />
        )}
      </DataTablePanel>

      <DriverFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        driver={editingDriver}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget === 'bulk' ? t('deleteBulkTitle') : t('deleteTitle')}
        description={
          deleteTarget === 'bulk'
            ? t('deleteBulkDesc', { count: selectedCount })
            : t('deleteDesc', { name: (deleteTarget as ManagedDriver)?.fullName ?? '' })
        }
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        destructive
        loading={isMutating}
        onConfirm={deleteTarget === 'bulk' ? handleBulkDelete : handleSingleDelete}
      />

      <ConfirmDialog
        open={!!pendingBulkAction}
        onOpenChange={(open) => !open && setPendingBulkAction(null)}
        title={pendingCopy.title}
        description={pendingCopy.description}
        confirmLabel={pendingCopy.confirm}
        cancelLabel={t('cancel')}
        loading={isMutating}
        onConfirm={handleBulkAction}
      />
    </>
  )
}
