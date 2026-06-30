import type { Dispatch, SetStateAction } from 'react'
import type { PaginationState, RowSelectionState } from '@tanstack/react-table'
import { CircleCheck, CircleOff, Trash2, UserPlus, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ManagedUser, ManagedUserRole } from '@/domain/entities'
import { ManagedUserStatus, type ManagedUserStatus as ManagedUserStatusType } from '@/domain/enums'
import type { UserFormValues } from '@/domain/schemas'
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
import { UserFormDialog } from './user-form-dialog'
import { UserPhotoPreviewDialog } from './user-photo-preview-dialog'
import { createUsersColumns, type UsersColumnLabels } from './users-columns'
import { UsersFilterDropdown, type UsersFilterOption } from './users-filter-dropdown'
import type { UserRoleFilterValue, UserStatusFilterValue } from './hooks/use-user-management'

interface UsersTableSectionProps {
  users: ManagedUser[]
  paginatedUsers: ManagedUser[]
  totalRows: number
  isLoading?: boolean
  hasActiveFilters: boolean
  keyword: string
  onKeywordChange: (value: string) => void
  statusFilter: UserStatusFilterValue
  onStatusFilterChange: (value: UserStatusFilterValue) => void
  roleFilter: UserRoleFilterValue
  onRoleFilterChange: (value: UserRoleFilterValue) => void
  onClearFilters: () => void
  paginationState: PaginationState
  onPaginationStateChange: Dispatch<SetStateAction<PaginationState>>
  roleOptions: ManagedUserRole[]
  isRolesLoading?: boolean
  onCreateUser: (values: UserFormValues) => Promise<boolean>
  onUpdateUser: (id: string, values: UserFormValues) => Promise<boolean>
  onDeleteUser: (id: string) => Promise<boolean>
  onBulkDeleteUsers: (ids: string[]) => Promise<boolean>
  onBulkUpdateStatus: (ids: string[], status: ManagedUserStatusType) => Promise<boolean>
  onRegisterOpenCreate?: (openCreate: () => void) => void
  fetchUserForEdit: (id: string) => Promise<ManagedUser | null>
}

type PendingBulkAction = {
  type: 'activate' | 'deactivate'
  ids: string[]
} | null
type DeleteTarget = ManagedUser | 'bulk' | null

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
  const count = action?.ids.length ?? 0

  switch (action?.type) {
    case 'activate':
      return {
        title: t('activateBulkTitle'),
        description: t('activateBulkDesc', { count }),
        confirm: t('makeActive'),
      }
    case 'deactivate':
      return {
        title: t('deactivateBulkTitle'),
        description: t('deactivateBulkDesc', { count }),
        confirm: t('makeInactive'),
      }
    default:
      return { title: '', description: '', confirm: '' }
  }
}

export const UsersTableSection = ({
  users,
  paginatedUsers,
  totalRows,
  isLoading = false,
  hasActiveFilters,
  keyword,
  onKeywordChange,
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
  onClearFilters,
  paginationState,
  onPaginationStateChange,
  roleOptions,
  isRolesLoading = false,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onBulkDeleteUsers,
  onBulkUpdateStatus,
  onRegisterOpenCreate,
  fetchUserForEdit,
}: UsersTableSectionProps) => {
  const { t } = useTranslation('users')
  const { t: tCommon } = useTranslation('common')
  const { isRtl } = useDirection()

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)
  const [pendingBulkAction, setPendingBulkAction] = useState<PendingBulkAction>(null)
  const [isMutating, setIsMutating] = useState(false)
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [photoPreviewUser, setPhotoPreviewUser] = useState<ManagedUser | null>(null)

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedUsers = useMemo(
    () => users.filter((user) => selectedIds.includes(user.id)),
    [selectedIds, users],
  )
  const selectedCount = selectedIds.length

  const bulkActivateIds = selectedUsers
    .filter((user) => user.status !== ManagedUserStatus.Active)
    .map((user) => user.id)
  const bulkDeactivateIds = selectedUsers
    .filter((user) => user.status === ManagedUserStatus.Active)
    .map((user) => user.id)

  const clearSelection = useCallback(() => setRowSelection({}), [])

  const openCreate = useCallback(() => {
    setFormMode('create')
    setEditingUser(null)
    setFormOpen(true)
  }, [])

  useEffect(() => {
    onRegisterOpenCreate?.(openCreate)
  }, [onRegisterOpenCreate, openCreate])

  const openEdit = useCallback(
    async (user: ManagedUser) => {
      setIsEditLoading(true)
      const forEdit = await fetchUserForEdit(user.id)
      setFormMode('edit')
      setEditingUser(forEdit ?? user)
      setFormOpen(true)
      setIsEditLoading(false)
    },
    [fetchUserForEdit],
  )
  const handleToggleStatus = useCallback(
    async (user: ManagedUser) => {
      const nextStatus =
        user.status === ManagedUserStatus.Active
          ? ManagedUserStatus.Inactive
          : ManagedUserStatus.Active

      setIsMutating(true)
      const success = await onBulkUpdateStatus([user.id], nextStatus)
      if (success) {
        notify.success({
          title: t('toastBulkStatusUpdated'),
          description: t('toastBulkStatusUpdatedDesc', { count: 1 }),
        })
      } else {
        notify.error({ title: t('toastActionFailed'), description: t('toastActionFailed') })
      }
      setIsMutating(false)
    },
    [onBulkUpdateStatus, t],
  )

  const columnLabels: UsersColumnLabels = useMemo(
    () => ({
      user: t('colUser'),
      phone: t('colPhone'),
      role: t('colRole'),
      status: t('colStatus'),
      activity: t('colActivity'),
      createdAt: t('colCreatedAt'),
      noLastLogin: t('noLastLogin'),
      noPhone: t('noPhone'),
      statusActive: t('statusActive'),
      statusInactive: t('statusInactive'),
      statusSuspended: t('statusSuspended'),
      copyPhone: t('copyPhone'),
      copiedPhone: t('copiedPhone'),
      makeActive: t('makeActive'),
      makeInactive: t('makeInactive'),
      edit: t('edit'),
      delete: t('delete'),
      viewPhoto: t('viewPhoto'),
    }),
    [t],
  )

  const columns = useMemo(
    () =>
      createUsersColumns(columnLabels, {
        isRtl,
        onEditClick: openEdit,
        onToggleStatusClick: (user) => {
          void handleToggleStatus(user)
        },
        onDeleteClick: setDeleteTarget,
        onPhotoClick: setPhotoPreviewUser,
      }),
    [columnLabels, handleToggleStatus, isRtl, openEdit],
  )

  const statusOptions: UsersFilterOption[] = useMemo(
    () => [
      { value: 'all', label: t('filterAll') },
      { value: ManagedUserStatus.Active, label: t('statusActive') },
      { value: ManagedUserStatus.Inactive, label: t('statusInactive') },
      { value: ManagedUserStatus.Suspended, label: t('statusSuspended') },
    ],
    [t],
  )

  const roleFilterOptions: UsersFilterOption[] = useMemo(
    () => [
      { value: 'all', label: t('filterAll') },
      ...roleOptions.map((role) => ({ value: role.id, label: role.name })),
    ],
    [roleOptions, t],
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

  const handleFormSubmit = async (values: UserFormValues) => {
    if (formMode === 'create') {
      const success = await onCreateUser(values)
      if (success) {
        notify.success({
          title: t('toastCreated'),
          description: t('toastCreatedDesc', { name: values.fullName }),
        })
      } else {
        notify.error({ title: t('toastActionFailed'), description: t('toastActionFailed') })
      }
      return success
    }

    if (!editingUser) return false

    const success = await onUpdateUser(editingUser.id, values)
    if (success) {
      notify.success({
        title: t('toastUpdated'),
        description: t('toastUpdatedDesc', { name: values.fullName }),
      })
    } else {
      notify.error({ title: t('toastActionFailed'), description: t('toastActionFailed') })
    }

    return success
  }

  const handleSingleDelete = async () => {
    if (!deleteTarget || deleteTarget === 'bulk') return

    setIsMutating(true)
    const success = await onDeleteUser(deleteTarget.id)
    if (success) {
      notify.success({
        title: t('toastDeleted'),
        description: t('toastDeletedDesc', { name: deleteTarget.fullName }),
      })
    } else {
      notify.error({ title: t('toastActionFailed'), description: t('toastActionFailed') })
    }
    setDeleteTarget(null)
    clearSelection()
    setIsMutating(false)
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return

    setIsMutating(true)
    const success = await onBulkDeleteUsers(selectedIds)
    if (success) {
      notify.success({
        title: t('toastBulkDeleted'),
        description: t('toastBulkDeletedDesc', { count: selectedIds.length }),
      })
    } else {
      notify.error({ title: t('toastActionFailed'), description: t('toastActionFailed') })
    }
    setDeleteTarget(null)
    clearSelection()
    setIsMutating(false)
  }

  const handleBulkAction = async () => {
    if (!pendingBulkAction?.ids.length) return

    setIsMutating(true)
    const success =
      pendingBulkAction.type === 'activate'
        ? await onBulkUpdateStatus(pendingBulkAction.ids, ManagedUserStatus.Active)
        : await onBulkUpdateStatus(pendingBulkAction.ids, ManagedUserStatus.Inactive)

    if (success) {
      notify.success({
        title: t('toastBulkStatusUpdated'),
        description: t('toastBulkStatusUpdatedDesc', { count: pendingBulkAction.ids.length }),
      })
    } else {
      notify.error({ title: t('toastActionFailed'), description: t('toastActionFailed') })
    }

    setPendingBulkAction(null)
    clearSelection()
    setIsMutating(false)
  }

  const isEmpty = !isLoading && totalRows === 0 && !hasActiveFilters
  const isFilteredEmpty = !isLoading && totalRows === 0 && hasActiveFilters
  const pendingCopy = getPendingDialogCopy(pendingBulkAction, t)

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
                    label={t('filterStatus')}
                    value={statusFilter}
                    onChange={(value) => onStatusFilterChange(value as UserStatusFilterValue)}
                    options={statusOptions}
                    className="min-w-40"
                  />
                  <UsersFilterDropdown
                    label={t('filterRole')}
                    value={roleFilter}
                    onChange={(value) => onRoleFilterChange(value)}
                    options={roleFilterOptions}
                    className="min-w-44 max-w-64"
                    contentClassName="w-56"
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
              <UsersRound className="size-5 text-muted-foreground" strokeWidth={1.75} />
            </span>
            <p className="mt-4 text-sm font-medium text-foreground">{t('emptyTitle')}</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t('emptyDesc')}</p>
            <Button type="button" size="sm" className="mt-5" onClick={openCreate}>
              <UserPlus className="size-4" />
              {t('createUser')}
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
            data={paginatedUsers}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row.id}
            getRowClassName={(row) =>
              row.status === ManagedUserStatus.Suspended
                ? 'bg-rose-50/40 hover:bg-rose-50/60 dark:bg-rose-950/15 dark:hover:bg-rose-950/25'
                : undefined
            }
            emptyMessage={t('emptyFilterTitle')}
            animateRows
            className="py-1"
          />
        )}
      </DataTablePanel>

      <UserPhotoPreviewDialog
        open={!!photoPreviewUser}
        onOpenChange={(open) => !open && setPhotoPreviewUser(null)}
        fullName={photoPreviewUser?.fullName ?? ''}
        email={photoPreviewUser?.email}
        photoUrl={photoPreviewUser?.avatarUrl}
      />

      <UserFormDialog
        key={`${formMode}-${editingUser?.id ?? 'create'}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        user={editingUser}
        roleOptions={roleOptions}
        isRolesLoading={isRolesLoading || isEditLoading}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget === 'bulk' ? t('deleteBulkTitle') : t('deleteTitle')}
        description={
          deleteTarget === 'bulk'
            ? t('deleteBulkDesc', { count: selectedCount })
            : t('deleteDesc', { name: (deleteTarget as ManagedUser)?.fullName ?? '' })
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
