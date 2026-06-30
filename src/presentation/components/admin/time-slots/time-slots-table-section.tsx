import type { RowSelectionState } from '@tanstack/react-table'
import { CircleCheck, CircleOff, Clock, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ManagedTimeSlot } from '@/domain/entities'
import type { TimeSlotFormValues } from '@/domain/schemas'
import { notify } from '@/infrastructure/libs/toast/toast'
import {
  DataTable,
  DataTableBulkActions,
  DataTablePanel,
  DataTableToolbar,
} from '@/presentation/components/dashboard/data-table'
import { ConfirmDialog } from '@/presentation/components/feedback/confirm-dialog'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { UsersFilterDropdown } from '@/presentation/components/admin/users/users-filter-dropdown'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { TimeSlotFormDialog } from './time-slot-form-dialog'
import { createTimeSlotsColumns, type TimeSlotsColumnLabels } from './time-slots-columns'
import type { TimeSlotStatusFilterValue } from './hooks/use-time-slot-management'

interface TimeSlotsTableSectionProps {
  slots: ManagedTimeSlot[]
  filteredSlots: ManagedTimeSlot[]
  isLoading?: boolean
  hasActiveFilters: boolean
  statusFilter: TimeSlotStatusFilterValue
  onStatusFilterChange: (value: TimeSlotStatusFilterValue) => void
  onClearFilters: () => void
  onCreateTimeSlot: (values: TimeSlotFormValues) => Promise<{ success: boolean; error?: string }>
  onUpdateTimeSlot: (
    slug: string,
    values: TimeSlotFormValues,
  ) => Promise<{ success: boolean; error?: string }>
  onToggleTimeSlotActive: (id: string) => Promise<{ success: boolean; error?: string }>
  onBulkToggleActive: (ids: string[]) => Promise<{ success: boolean; error?: string }>
  onGetTimeSlotForEdit: (slug: string) => Promise<TimeSlotFormValues | null>
  onRegisterOpenCreate?: (openCreate: () => void) => void
}

type PendingBulkAction = {
  type: 'activate' | 'deactivate'
  ids: string[]
} | null

const TableSkeleton = () => (
  <div className="space-y-2 px-1 py-2">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 rounded-lg px-3 py-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    ))}
  </div>
)

export const TimeSlotsTableSection = ({
  slots,
  filteredSlots,
  isLoading = false,
  hasActiveFilters,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
  onCreateTimeSlot,
  onUpdateTimeSlot,
  onToggleTimeSlotActive,
  onBulkToggleActive,
  onGetTimeSlotForEdit,
  onRegisterOpenCreate,
}: TimeSlotsTableSectionProps) => {
  const { t } = useTranslation('timeSlots')
  const { isRtl } = useDirection()

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formOpen, setFormOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<ManagedTimeSlot | null>(null)
  const [editFormValues, setEditFormValues] = useState<TimeSlotFormValues | null>(null)
  const [isLoadingEdit, setIsLoadingEdit] = useState(false)
  const [pendingBulkAction, setPendingBulkAction] = useState<PendingBulkAction>(null)
  const [isMutating, setIsMutating] = useState(false)

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedSlots = useMemo(
    () => slots.filter((slot) => selectedIds.includes(slot.id)),
    [slots, selectedIds],
  )
  const selectedCount = selectedIds.length

  const bulkActivateIds = selectedSlots.filter((slot) => !slot.isActive).map((slot) => slot.id)
  const bulkDeactivateIds = selectedSlots.filter((slot) => slot.isActive).map((slot) => slot.id)

  const clearSelection = useCallback(() => setRowSelection({}), [])

  const openCreate = useCallback(() => {
    setFormMode('create')
    setEditingSlot(null)
    setEditFormValues(null)
    setFormOpen(true)
  }, [])

  useEffect(() => {
    onRegisterOpenCreate?.(openCreate)
  }, [onRegisterOpenCreate, openCreate])

  const openEdit = useCallback(
    async (slot: ManagedTimeSlot) => {
      setFormMode('edit')
      setEditingSlot(slot)
      setEditFormValues(null)
      setFormOpen(true)
      setIsLoadingEdit(true)

      const values = await onGetTimeSlotForEdit(slot.slug)
      setEditFormValues(values)
      setIsLoadingEdit(false)
    },
    [onGetTimeSlotForEdit],
  )

  const handleToggleActive = useCallback(
    async (slot: ManagedTimeSlot) => {
      setIsMutating(true)
      const result = await onToggleTimeSlotActive(slot.id)
      if (result.success) {
        notify.success({
          title: t('toastStatusUpdated'),
          description: t('toastStatusUpdatedDesc', { label: slot.label }),
        })
      } else {
        notify.error({
          title: t('toastActionFailed'),
          description: result.error ?? t('toastActionFailed'),
        })
      }
      setIsMutating(false)
    },
    [onToggleTimeSlotActive, t],
  )

  const columnLabels: TimeSlotsColumnLabels = useMemo(
    () => ({
      label: t('colLabel'),
      startTime: t('colStartTime'),
      endTime: t('colEndTime'),
      displayOrder: t('colDisplayOrder'),
      status: t('colStatus'),
      statusActive: t('statusActive'),
      statusInactive: t('statusInactive'),
      activate: t('activate'),
      deactivate: t('deactivate'),
      edit: t('edit'),
    }),
    [t],
  )

  const columns = useMemo(
    () =>
      createTimeSlotsColumns(columnLabels, {
        isRtl,
        onEditClick: (slot) => {
          void openEdit(slot)
        },
        onToggleActiveClick: (slot) => {
          void handleToggleActive(slot)
        },
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

  const handleFormSubmit = async (values: TimeSlotFormValues) => {
    if (formMode === 'create') {
      const result = await onCreateTimeSlot(values)
      if (result.success) {
        notify.success({ title: t('toastCreated'), description: t('toastCreatedDesc') })
      } else {
        notify.error({
          title: t('toastCreateFailed'),
          description: result.error ?? t('toastActionFailed'),
        })
      }
      return result
    }

    if (!editingSlot) return { success: false }

    const result = await onUpdateTimeSlot(editingSlot.slug, values)
    if (result.success) {
      notify.success({
        title: t('toastUpdated'),
        description: t('toastUpdatedDesc', { label: editingSlot.label }),
      })
    } else {
      notify.error({
        title: t('toastUpdateFailed'),
        description: result.error ?? t('toastActionFailed'),
      })
    }
    return result
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

  const isEmpty = !isLoading && slots.length === 0
  const isFilteredEmpty = !isLoading && filteredSlots.length === 0 && (hasActiveFilters || slots.length > 0)

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
              endContent={
                <>
                  {bulkActions}
                  <UsersFilterDropdown
                    label={t('filterStatus')}
                    value={statusFilter}
                    onChange={(value) => onStatusFilterChange(value as TimeSlotStatusFilterValue)}
                    options={statusOptions}
                    className="min-w-40"
                  />
                </>
              }
            />
          </div>
        }
      >
        {isLoading ? (
          <TableSkeleton />
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full border border-dashed border-border bg-muted/30">
              <Clock className="size-5 text-muted-foreground" strokeWidth={1.75} />
            </span>
            <p className="mt-4 text-sm font-medium text-foreground">{t('emptyTitle')}</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t('emptyDesc')}</p>
            <Button type="button" size="sm" className="mt-5" onClick={openCreate}>
              <Plus className="size-4" />
              {t('createTimeSlot')}
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
            data={filteredSlots}
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

      <TimeSlotFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        slot={editingSlot}
        initialValues={editFormValues}
        isLoadingInitial={formMode === 'edit' && isLoadingEdit}
        onSubmit={handleFormSubmit}
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
