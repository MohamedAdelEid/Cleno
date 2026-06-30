import type { Dispatch, SetStateAction } from 'react'
import type { PaginationState, RowSelectionState } from '@tanstack/react-table'
import { CircleCheck, CircleOff, Package, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { OperationalBag } from '@/domain/entities'
import type { ApiResult } from '@/domain/types'
import { OperationalBagStatus, OperationalBagSystemStatus } from '@/domain/enums'
import type { OperationalBagFormValues } from '@/domain/schemas'
import { notify } from '@/infrastructure/libs/toast/toast'
import { BagDetailsDialog } from '@/presentation/components/admin/operational-bags/dialogs/bag-details-dialog'
import { BagFormDialog } from '@/presentation/components/admin/operational-bags/dialogs/bag-form-dialog'
import type {
  BagOperationalFilterValue,
  BagSystemFilterValue,
} from '@/presentation/components/admin/operational-bags/hooks/use-operational-bags'
import { BagsFiltersSection } from '@/presentation/components/admin/operational-bags/list/bags-filters-section'
import {
  getBulkActivateBagIds,
  getBulkDeactivateBagIds,
} from '@/presentation/components/admin/operational-bags/shared/bag-bulk.utils'
import {
  DataTable,
  DataTableBulkActions,
  DataTablePagination,
  DataTablePanel,
} from '@/presentation/components/dashboard/data-table'
import { ConfirmDialog } from '@/presentation/components/feedback/confirm-dialog'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'
import { createBagsColumns, type BagsColumnLabels } from './bags-columns'

interface BagsTableSectionProps {
  bags: OperationalBag[]
  paginatedBags: OperationalBag[]
  totalRows: number
  isLoading?: boolean
  hasActiveFilters: boolean
  keyword: string
  onKeywordChange: (value: string) => void
  systemFilter: BagSystemFilterValue
  onSystemFilterChange: (value: BagSystemFilterValue) => void
  operationalFilter: BagOperationalFilterValue
  onOperationalFilterChange: (value: BagOperationalFilterValue) => void
  onClearFilters: () => void
  paginationState: PaginationState
  onPaginationStateChange: Dispatch<SetStateAction<PaginationState>>
  onCreateBag: (values: OperationalBagFormValues) => Promise<boolean>
  onUpdateBag: (id: string, values: OperationalBagFormValues) => Promise<boolean>
  onDeleteBag: (id: string) => Promise<boolean>
  onBulkDeleteBags: (ids: string[]) => Promise<boolean>
  onBulkUpdateSystemStatus: (
    ids: string[],
    status: OperationalBag['systemStatus'],
  ) => Promise<boolean>
  onGetBagDetails: (slug: string) => Promise<ApiResult<OperationalBag>>
  isBagIdTaken: (bagId: string, excludeId?: string) => boolean
  onRegisterOpenCreate?: (openCreate: () => void) => void
}

type PendingBulkAction = { type: 'activate' | 'deactivate'; ids: string[] } | null
type DeleteTarget = OperationalBag | 'bulk' | null

const TableSkeleton = () => (
  <div className="space-y-2 px-1 py-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 rounded-lg px-3 py-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32 flex-1" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    ))}
  </div>
)

export const BagsTableSection = ({
  bags,
  paginatedBags,
  totalRows,
  isLoading = false,
  hasActiveFilters,
  keyword,
  onKeywordChange,
  systemFilter,
  onSystemFilterChange,
  operationalFilter,
  onOperationalFilterChange,
  onClearFilters,
  paginationState,
  onPaginationStateChange,
  onCreateBag,
  onUpdateBag,
  onDeleteBag,
  onBulkDeleteBags,
  onBulkUpdateSystemStatus,
  onGetBagDetails,
  isBagIdTaken,
  onRegisterOpenCreate,
}: BagsTableSectionProps) => {
  const { t } = useTranslation('operationalBags')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formOpen, setFormOpen] = useState(false)
  const [editingBag, setEditingBag] = useState<OperationalBag | null>(null)
  const [detailsBag, setDetailsBag] = useState<OperationalBag | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)
  const [pendingBulkAction, setPendingBulkAction] = useState<PendingBulkAction>(null)
  const [isMutating, setIsMutating] = useState(false)

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedCount = selectedIds.length

  const bulkActivateIds = useMemo(
    () => getBulkActivateBagIds(paginatedBags, selectedIds),
    [paginatedBags, selectedIds],
  )
  const bulkDeactivateIds = useMemo(
    () => getBulkDeactivateBagIds(paginatedBags, selectedIds),
    [paginatedBags, selectedIds],
  )

  const clearSelection = useCallback(() => setRowSelection({}), [])

  const openCreate = useCallback(() => {
    setFormMode('create')
    setEditingBag(null)
    setFormOpen(true)
  }, [])

  useEffect(() => {
    onRegisterOpenCreate?.(openCreate)
  }, [onRegisterOpenCreate, openCreate])

  const openEdit = useCallback((bag: OperationalBag) => {
    setFormMode('edit')
    setEditingBag(bag)
    setFormOpen(true)
  }, [])

  const columnLabels: BagsColumnLabels = useMemo(
    () => ({
      bagId: t('colBagId'),
      currentOrder: t('colCurrentOrder'),
      customer: t('colCustomer'),
      systemStatus: t('colSystemStatus'),
      operationalStatus: t('colOperationalStatus'),
      lastUpdated: t('colLastUpdated'),
      systemActive: t('systemActive'),
      systemInactive: t('systemInactive'),
      opReady: t('opReady'),
      opProcessing: t('opProcessing'),
      opOnTheWay: t('opOnTheWay'),
      opAssigned: t('opAssigned'),
      opInTransit: t('opInTransit'),
      opMissing: t('opMissing'),
      view: t('view'),
      edit: t('edit'),
      delete: t('delete'),
      noOrder: t('noOrder'),
      noCustomer: t('noCustomer'),
    }),
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

  const handleViewBag = useCallback(
    async (bag: OperationalBag) => {
      const result = await onGetBagDetails(bag.slug)

      if (result.hasValue && result.data) {
        setDetailsBag(result.data)
      } else {
        notify.error({
          title: t('detailsTitle'),
          description: result.error?.message ?? t('toastActionFailed'),
        })
      }
    },
    [onGetBagDetails, t],
  )

  const navigateToOrder = useCallback(
    (bag: OperationalBag) => {
      if (!bag.currentOrderNumber) return
      navigate(ROUTES.ORDERS.withSearch(bag.currentOrderNumber))
    },
    [navigate],
  )

  const navigateToCompany = useCallback(
    (bag: OperationalBag) => {
      if (!bag.company?.name) return
      navigate(ROUTES.COMPANIES.withSearch(bag.company.name))
    },
    [navigate],
  )

  const columns = useMemo(
    () =>
      createBagsColumns(columnLabels, {
        onViewClick: (bag) => {
          void handleViewBag(bag)
        },
        onEditClick: openEdit,
        onDeleteClick: setDeleteTarget,
        onOrderClick: navigateToOrder,
        onCompanyClick: navigateToCompany,
      }),
    [columnLabels, handleViewBag, navigateToCompany, navigateToOrder, openEdit],
  )

  const handleFormSubmit = async (values: OperationalBagFormValues) => {
    if (formMode === 'create') {
      const success = await onCreateBag(values)
      if (success) {
        notify.success({
          title: t('toastCreated'),
          description: t('toastCreatedDesc', { bagId: values.bagId }),
        })
      } else {
        notify.error({ title: t('toastCreateFailed'), description: t('toastActionFailed') })
      }
      return success
    }

    if (!editingBag) return false

    const success = await onUpdateBag(editingBag.id, values)
    if (success) {
      notify.success({
        title: t('toastUpdated'),
        description: t('toastUpdatedDesc', { bagId: values.bagId }),
      })
    } else {
      notify.error({ title: t('toastUpdateFailed'), description: t('toastActionFailed') })
    }
    return success
  }

  const handleSingleDelete = async () => {
    if (!deleteTarget || deleteTarget === 'bulk') return

    setIsMutating(true)
    const success = await onDeleteBag(deleteTarget.id)
    if (success) {
      notify.success({
        title: t('toastDeleted'),
        description: t('toastDeletedDesc', { bagId: deleteTarget.bagId }),
      })
    } else {
      notify.error({ title: t('toastDeleteFailed'), description: t('toastActionFailed') })
    }
    setDeleteTarget(null)
    clearSelection()
    setIsMutating(false)
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return

    setIsMutating(true)
    const success = await onBulkDeleteBags(selectedIds)
    if (success) {
      notify.success({
        title: t('toastBulkDeleted'),
        description: t('toastBulkDeletedDesc', { count: selectedIds.length }),
      })
    } else {
      notify.error({ title: t('toastDeleteFailed'), description: t('toastActionFailed') })
    }
    setDeleteTarget(null)
    clearSelection()
    setIsMutating(false)
  }

  const handleBulkStatusChange = async () => {
    if (!pendingBulkAction?.ids.length) return

    setIsMutating(true)
    const success = await onBulkUpdateSystemStatus(
      pendingBulkAction.ids,
      pendingBulkAction.type === 'activate'
        ? OperationalBagSystemStatus.Active
        : OperationalBagSystemStatus.Inactive,
    )
    if (success) {
      notify.success({
        title: t('toastBulkStatusUpdated'),
        description: t('toastBulkStatusUpdatedDesc', { count: pendingBulkAction.ids.length }),
      })
    } else {
      notify.error({ title: t('toastUpdateFailed'), description: t('toastActionFailed') })
    }
    setPendingBulkAction(null)
    clearSelection()
    setIsMutating(false)
  }

  const isEmpty = !isLoading && bags.length === 0
  const isFilteredEmpty = !isLoading && bags.length > 0 && paginatedBags.length === 0

  const bulkActions = (
    <DataTableBulkActions
      visible={selectedCount > 0}
      selectedCount={selectedCount}
      selectedLabel={t('selected')}
    >
      {bulkActivateIds.length > 0 ? (
        <Button
          variant="outline"
          size="xs"
          disabled={isMutating}
          onClick={() => setPendingBulkAction({ type: 'activate', ids: bulkActivateIds })}
        >
          <CircleCheck />
          {t('makeActive')}
        </Button>
      ) : null}

      {bulkDeactivateIds.length > 0 ? (
        <Button
          variant="outline"
          size="xs"
          disabled={isMutating}
          onClick={() => setPendingBulkAction({ type: 'deactivate', ids: bulkDeactivateIds })}
        >
          <CircleOff />
          {t('makeInactive')}
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
            <BagsFiltersSection
              search={keyword}
              onSearchChange={onKeywordChange}
              systemFilter={systemFilter}
              onSystemFilterChange={onSystemFilterChange}
              operationalFilter={operationalFilter}
              onOperationalFilterChange={onOperationalFilterChange}
              bulkActions={bulkActions}
              labels={{
                searchPlaceholder: t('searchPlaceholder'),
                filterSystemStatus: t('filterSystemStatus'),
                filterOperationalStatus: t('filterOperationalStatus'),
                filterAll: t('filterAll'),
                systemActive: t('systemActive'),
                systemInactive: t('systemInactive'),
                opReady: t('opReady'),
                opProcessing: t('opProcessing'),
                opOnTheWay: t('opOnTheWay'),
                opAssigned: t('opAssigned'),
                opInTransit: t('opInTransit'),
                opMissing: t('opMissing'),
              }}
            />
          </div>
        }
        footer={
          !isLoading && paginatedBags.length > 0 ? (
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
              <Package className="size-5 text-muted-foreground" strokeWidth={1.75} />
            </span>
            <p className="mt-4 text-sm font-medium text-foreground">{t('emptyTitle')}</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t('emptyDesc')}</p>
            <Button type="button" size="sm" className="mt-5" onClick={openCreate}>
              <Plus className="size-4" />
              {t('createBag')}
            </Button>
          </div>
        ) : isFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="text-sm font-medium text-foreground">{t('emptyFilterTitle')}</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t('emptyFilterDesc')}</p>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={onClearFilters}
              >
                {t('clearFilters')}
              </Button>
            )}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={paginatedBags}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row.id}
            getRowClassName={(row) =>
              row.operationalStatus === OperationalBagStatus.Missing
                ? 'bg-red-50/40 hover:bg-red-50/60 dark:bg-red-950/15 dark:hover:bg-red-950/25'
                : undefined
            }
            emptyMessage={t('emptyFilterTitle')}
            animateRows
            className="py-1"
          />
        )}
      </DataTablePanel>

      <BagFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        bag={editingBag}
        onSubmit={handleFormSubmit}
        isBagIdTaken={isBagIdTaken}
      />

      <BagDetailsDialog
        open={!!detailsBag}
        onOpenChange={(open) => !open && setDetailsBag(null)}
        bag={detailsBag}
        onEdit={openEdit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget === 'bulk' ? t('deleteBulkTitle') : t('deleteTitle')}
        description={
          deleteTarget === 'bulk'
            ? t('deleteBulkDesc', { count: selectedCount })
            : t('deleteDesc', { bagId: (deleteTarget as OperationalBag)?.bagId ?? '' })
        }
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        destructive
        loading={isMutating}
        onConfirm={deleteTarget === 'bulk' ? handleBulkDelete : handleSingleDelete}
      />

      <ConfirmDialog
        open={pendingBulkAction?.type === 'activate'}
        onOpenChange={(open) => !open && setPendingBulkAction(null)}
        title={t('activateBulkTitle')}
        description={t('activateBulkDesc', { count: pendingBulkAction?.ids.length ?? 0 })}
        confirmLabel={t('makeActive')}
        cancelLabel={t('cancel')}
        loading={isMutating}
        onConfirm={handleBulkStatusChange}
      />

      <ConfirmDialog
        open={pendingBulkAction?.type === 'deactivate'}
        onOpenChange={(open) => !open && setPendingBulkAction(null)}
        title={t('deactivateBulkTitle')}
        description={t('deactivateBulkDesc', { count: pendingBulkAction?.ids.length ?? 0 })}
        confirmLabel={t('makeInactive')}
        cancelLabel={t('cancel')}
        loading={isMutating}
        onConfirm={handleBulkStatusChange}
      />
    </>
  )
}
