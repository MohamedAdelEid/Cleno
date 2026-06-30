import type { Dispatch, SetStateAction } from 'react'
import type { PaginationState, RowSelectionState } from '@tanstack/react-table'
import { CircleCheck, CircleOff, Plus, Shirt, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ManagedLaundryItem } from '@/domain/entities'
import { LaundryItemCategory } from '@/domain/enums'
import type { LaundryItemFormValues } from '@/domain/schemas'
import { notify } from '@/infrastructure/libs/toast/toast'
import { UsersFilterDropdown } from '@/presentation/components/admin/users/users-filter-dropdown'
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
import { LaundryItemFormDialog } from './laundry-item-form-dialog'
import { createLaundryItemsColumns, type LaundryItemsColumnLabels } from './laundry-items-columns'
import type {
  LaundryItemCategoryFilterValue,
  LaundryItemStatusFilterValue,
} from './hooks/use-laundry-item-management'

interface LaundryItemsTableSectionProps {
  items: ManagedLaundryItem[]
  paginatedItems: ManagedLaundryItem[]
  totalRows: number
  isLoading?: boolean
  hasActiveFilters: boolean
  keyword: string
  onKeywordChange: (value: string) => void
  statusFilter: LaundryItemStatusFilterValue
  onStatusFilterChange: (value: LaundryItemStatusFilterValue) => void
  categoryFilter: LaundryItemCategoryFilterValue
  onCategoryFilterChange: (value: LaundryItemCategoryFilterValue) => void
  onClearFilters: () => void
  paginationState: PaginationState
  onPaginationStateChange: Dispatch<SetStateAction<PaginationState>>
  onCreateLaundryItem: (values: LaundryItemFormValues) => Promise<{ success: boolean; error?: string }>
  onUpdateLaundryItem: (
    slug: string,
    values: LaundryItemFormValues,
  ) => Promise<{ success: boolean; error?: string }>
  onBulkToggleActive: (ids: string[]) => Promise<{ success: boolean; error?: string }>
  onBulkDeleteItems: (ids: string[]) => Promise<{ success: boolean; error?: string }>
  onRegisterOpenCreate?: (openCreate: () => void) => void
}

type PendingBulkAction = {
  type: 'activate' | 'deactivate'
  ids: string[]
} | null

type DeleteTarget = ManagedLaundryItem | 'bulk' | null

const TableSkeleton = () => (
  <div className="space-y-2 px-1 py-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 rounded-lg px-3 py-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
)

export const LaundryItemsTableSection = ({
  items,
  paginatedItems,
  totalRows,
  isLoading = false,
  hasActiveFilters,
  keyword,
  onKeywordChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onClearFilters,
  paginationState,
  onPaginationStateChange,
  onCreateLaundryItem,
  onUpdateLaundryItem,
  onBulkToggleActive,
  onBulkDeleteItems,
  onRegisterOpenCreate,
}: LaundryItemsTableSectionProps) => {
  const { t } = useTranslation('laundryItems')
  const { t: tCommon } = useTranslation('common')
  const { isRtl } = useDirection()

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ManagedLaundryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)
  const [pendingBulkAction, setPendingBulkAction] = useState<PendingBulkAction>(null)
  const [isMutating, setIsMutating] = useState(false)

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds],
  )
  const selectedCount = selectedIds.length

  const bulkActivateIds = selectedItems.filter((item) => !item.isActive).map((item) => item.id)
  const bulkDeactivateIds = selectedItems.filter((item) => item.isActive).map((item) => item.id)

  const clearSelection = useCallback(() => setRowSelection({}), [])

  const openCreate = useCallback(() => {
    setFormMode('create')
    setEditingItem(null)
    setFormOpen(true)
  }, [])

  useEffect(() => {
    onRegisterOpenCreate?.(openCreate)
  }, [onRegisterOpenCreate, openCreate])

  const openEdit = useCallback((item: ManagedLaundryItem) => {
    setFormMode('edit')
    setEditingItem(item)
    setFormOpen(true)
  }, [])

  const handleToggleActive = useCallback(
    async (item: ManagedLaundryItem) => {
      setIsMutating(true)
      const result = await onBulkToggleActive([item.id])
      if (result.success) {
        notify.success({
          title: t('toastStatusUpdated'),
          description: t('toastStatusUpdatedDesc', { name: item.name }),
        })
      } else {
        notify.error({
          title: t('toastActionFailed'),
          description: result.error ?? t('toastActionFailed'),
        })
      }
      setIsMutating(false)
    },
    [onBulkToggleActive, t],
  )

  const columnLabels: LaundryItemsColumnLabels = useMemo(
    () => ({
      name: t('colName'),
      category: t('colCategory'),
      price: t('colPrice'),
      status: t('colStatus'),
      createdAt: t('colCreatedAt'),
      categoryWash: t('categoryWash'),
      categoryIron: t('categoryIron'),
      categoryWashAndIron: t('categoryWashAndIron'),
      statusActive: t('statusActive'),
      statusInactive: t('statusInactive'),
      activate: t('activate'),
      deactivate: t('deactivate'),
      edit: t('edit'),
      delete: t('delete'),
    }),
    [t],
  )

  const columns = useMemo(
    () =>
      createLaundryItemsColumns(columnLabels, {
        isRtl,
        onEditClick: openEdit,
        onToggleActiveClick: (item) => {
          void handleToggleActive(item)
        },
        onDeleteClick: setDeleteTarget,
      }),
    [columnLabels, handleToggleActive, isRtl, openEdit],
  )

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('filterAll') },
      { value: 'active', label: t('statusActive') },
      { value: 'inactive', label: t('statusInactive') },
    ],
    [t],
  )

  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: t('filterAll') },
      { value: String(LaundryItemCategory.Wash), label: t('categoryWash') },
      { value: String(LaundryItemCategory.Iron), label: t('categoryIron') },
      { value: String(LaundryItemCategory.WashAndIron), label: t('categoryWashAndIron') },
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

  const handleFormSubmit = async (values: LaundryItemFormValues) => {
    if (formMode === 'create') {
      const result = await onCreateLaundryItem(values)
      if (result.success) {
        notify.success({
          title: t('toastCreated'),
          description: t('toastCreatedDesc', { name: values.name }),
        })
      } else {
        notify.error({
          title: t('toastCreateFailed'),
          description: result.error ?? t('toastActionFailed'),
        })
      }
      return result
    }

    if (!editingItem) return { success: false }

    const result = await onUpdateLaundryItem(editingItem.slug, values)
    if (result.success) {
      notify.success({
        title: t('toastUpdated'),
        description: t('toastUpdatedDesc', { name: values.name }),
      })
    } else {
      notify.error({
        title: t('toastUpdateFailed'),
        description: result.error ?? t('toastActionFailed'),
      })
    }
    return result
  }

  const handleSingleDelete = async () => {
    if (!deleteTarget || deleteTarget === 'bulk') return

    setIsMutating(true)
    const result = await onBulkDeleteItems([deleteTarget.id])
    if (result.success) {
      notify.success({
        title: t('toastDeleted'),
        description: t('toastDeletedDesc', { name: deleteTarget.name }),
      })
    } else {
      notify.error({
        title: t('toastDeleteFailed'),
        description: result.error ?? t('toastActionFailed'),
      })
    }
    setDeleteTarget(null)
    clearSelection()
    setIsMutating(false)
  }

  const handleBulkDelete = async () => {
    if (!selectedItems.length) return

    setIsMutating(true)
    const result = await onBulkDeleteItems(selectedItems.map((item) => item.id))
    if (result.success) {
      notify.success({
        title: t('toastBulkDeleted'),
        description: t('toastBulkDeletedDesc', { count: selectedItems.length }),
      })
    } else {
      notify.error({
        title: t('toastDeleteFailed'),
        description: result.error ?? t('toastActionFailed'),
      })
    }
    setDeleteTarget(null)
    clearSelection()
    setIsMutating(false)
  }

  const handleBulkAction = async () => {
    if (!pendingBulkAction?.ids.length) return

    setIsMutating(true)
    const result = await onBulkToggleActive(pendingBulkAction.ids)

    if (result.success) {
      notify.success({
        title: t('toastBulkStatusUpdated'),
        description: t('toastBulkStatusUpdatedDesc', { count: pendingBulkAction.ids.length }),
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

  const isEmpty = !isLoading && items.length === 0 && !hasActiveFilters
  const isFilteredEmpty =
    !isLoading && paginatedItems.length === 0 && (hasActiveFilters || items.length > 0)

  const pendingCopy =
    pendingBulkAction?.type === 'activate'
      ? {
          title: t('activateBulkTitle'),
          description: t('activateBulkDesc', { count: pendingBulkAction.ids.length }),
          confirm: t('activate'),
        }
      : {
          title: t('deactivateBulkTitle'),
          description: t('deactivateBulkDesc', { count: pendingBulkAction?.ids.length ?? 0 }),
          confirm: t('deactivate'),
        }

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
          {t('activate')}
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
          {t('deactivate')}
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
                  <UsersFilterDropdown
                    label={t('filterCategory')}
                    value={categoryFilter === 'all' ? 'all' : String(categoryFilter)}
                    onChange={(value) =>
                      onCategoryFilterChange(
                        value === 'all' ? 'all' : (Number(value) as LaundryItemCategoryFilterValue),
                      )
                    }
                    options={categoryOptions}
                    className="min-w-40"
                  />
                  <UsersFilterDropdown
                    label={t('filterStatus')}
                    value={statusFilter}
                    onChange={(value) =>
                      onStatusFilterChange(value as LaundryItemStatusFilterValue)
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
              <Shirt className="size-5 text-muted-foreground" strokeWidth={1.75} />
            </span>
            <p className="mt-4 text-sm font-medium text-foreground">{t('emptyTitle')}</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t('emptyDesc')}</p>
            <Button type="button" size="sm" className="mt-5" onClick={openCreate}>
              <Plus className="size-4" />
              {t('createLaundryItem')}
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
            data={paginatedItems}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row.id}
            getRowClassName={(row) =>
              !row.isActive
                ? 'bg-slate-50/50 hover:bg-slate-50/80 dark:bg-slate-950/10 dark:hover:bg-slate-950/20'
                : undefined
            }
            emptyMessage={t('emptyFilterTitle')}
            animateRows
            className="py-1"
          />
        )}
      </DataTablePanel>

      <LaundryItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        item={editingItem}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget === 'bulk' ? t('deleteBulkTitle') : t('deleteTitle')}
        description={
          deleteTarget === 'bulk'
            ? t('deleteBulkDesc', { count: selectedCount })
            : t('deleteDesc', { name: (deleteTarget as ManagedLaundryItem)?.name ?? '' })
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
