import type { Dispatch, SetStateAction } from 'react'
import type { PaginationState, RowSelectionState } from '@tanstack/react-table'
import { Star, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { ManagedRole } from '@/domain/entities'
import { RoleStatus } from '@/domain/enums'
import { rolesApi } from '@/infrastructure/api/roles.api'
import { notify } from '@/infrastructure/libs/toast/toast'
import {
  DataTable,
  DataTableBulkActions,
  DataTablePagination,
  DataTablePanel,
  DataTableToolbar,
} from '@/presentation/components/dashboard/data-table'
import { ConfirmDialog } from '@/presentation/components/feedback/confirm-dialog'
import { PermissionsDialog } from '@/presentation/components/admin/permissions'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { buildRoleEditPath } from '@/presentation/routes/role.routes'
import { AssignUsersDialog } from './assign-users-dialog'
import { FeaturedRolesSection } from './featured-roles-section'
import { useRolesTableLabels } from './hooks/use-roles-table-labels'
import { RoleStatusFilter } from './role-status-filter'
import { RoleUsersDialog } from './role-users-dialog'
import { SetFeaturedDialog } from './set-featured-dialog'
import { createRolesColumns } from './roles-columns'
import { getFeaturedBulkState } from './shared/roles-featured.utils'

const TableSkeleton = () => (
  <div className="space-y-2 px-1 py-2">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 rounded-lg px-3 py-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="hidden h-4 w-40 sm:block" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="hidden h-4 w-24 md:block" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
)

interface RolesTableSectionProps {
  roles: ManagedRole[]
  featuredRoles: ManagedRole[]
  totalRows: number
  isLoading?: boolean
  onRefetch: () => Promise<void>
  search: string
  onSearchChange: (value: string) => void
  statusFilter: RoleStatus | 'all'
  onStatusFilterChange: (value: RoleStatus | 'all') => void
  paginationState: PaginationState
  onPaginationStateChange: Dispatch<SetStateAction<PaginationState>>
}

export const RolesTableSection = ({
  roles,
  featuredRoles,
  totalRows,
  isLoading = false,
  onRefetch,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paginationState,
  onPaginationStateChange,
}: RolesTableSectionProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation('roles')
  const labels = useRolesTableLabels()
  const { isRtl } = useDirection()

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [permissionsRole, setPermissionsRole] = useState<ManagedRole | null>(null)
  const [usersRole, setUsersRole] = useState<ManagedRole | null>(null)
  const [usersRoleMembers, setUsersRoleMembers] = useState<ManagedRole['users']>([])
  const [isUsersLoading, setIsUsersLoading] = useState(false)
  const [assignRole, setAssignRole] = useState<ManagedRole | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<'bulk' | ManagedRole | null>(null)
  const [featuredDialogOpen, setFeaturedDialogOpen] = useState(false)

  const handleEditRole = useCallback(
    (role: ManagedRole) => {
      navigate(buildRoleEditPath(role.id))
    },
    [navigate],
  )

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedCount = selectedIds.length

  const featuredRoleIds = useMemo(
    () => featuredRoles.map((role) => role.id),
    [featuredRoles],
  )

  const featuredBulk = useMemo(
    () => getFeaturedBulkState(selectedIds, featuredRoleIds),
    [selectedIds, featuredRoleIds],
  )

  const clearSelection = useCallback(() => setRowSelection({}), [])

  const fetchRoleUsers = useCallback(async (role: ManagedRole) => {
    setIsUsersLoading(true)
    const result = await rolesApi.getRoleUsers(role.id)

    if (result.hasValue && result.data) {
      setUsersRoleMembers(result.data)
      setUsersRole({ ...role, users: result.data, usersCount: result.data.length })
    } else {
      setUsersRoleMembers(role.users)
      setUsersRole(role)
    }

    setIsUsersLoading(false)
  }, [])

  const handleUsersClick = useCallback(
    (role: ManagedRole) => {
      setUsersRole(role)
      setUsersRoleMembers(role.users)
      void fetchRoleUsers(role)
    },
    [fetchRoleUsers],
  )

  const handleFeaturedBulkAction = async () => {
    if (featuredBulk.disabled || !featuredBulk.action) return

    const result = await rolesApi.setFeatured(featuredBulk.nextFeaturedIds)

    if (result.hasValue) {
      notify.success({
        title:
          featuredBulk.action === 'remove'
            ? t('toastFeaturedRemoved')
            : t('toastFeaturedUpdated'),
        description:
          featuredBulk.action === 'remove'
            ? t('toastFeaturedRemovedDesc')
            : t('toastFeaturedUpdatedDesc'),
      })
      clearSelection()
      await onRefetch()
    } else {
      notify.error({
        title: t('toastFeaturedError'),
        description: result.error?.message ?? t('toastFeaturedError'),
      })
    }
  }

  const handleUnassign = async (roleId: string, userId: string) => {
    const result = await rolesApi.unassignUsers(roleId, [userId])

    if (result.hasValue) {
      notify.success({
        title: t('toastUnassigned'),
        description: t('toastUnassignedDesc'),
      })
      await onRefetch()
      if (usersRole?.id === roleId) {
        void fetchRoleUsers(usersRole)
      }
    } else {
      notify.error({
        title: t('toastUnassignError'),
        description: result.error?.message ?? t('toastUnassignError'),
      })
    }
  }

  const handleAssign = async (roleId: string, userIds: string[]) => {
    const result = await rolesApi.assignUsers(roleId, userIds)

    if (result.hasValue) {
      notify.success({
        title: t('toastAssigned'),
        description: t('toastAssignedDesc', { count: userIds.length }),
      })
      await onRefetch()
    } else {
      notify.error({
        title: t('toastAssignError'),
        description: result.error?.message ?? t('toastAssignError'),
      })
    }
  }

  const columns = useMemo(
    () =>
      createRolesColumns(labels.columns, {
        isRtl,
        onPermissionsClick: (role) => {
          if (role.permissionsCount > 0) {
            setPermissionsRole(role)
          } else {
            notify.info({
              title: labels.featured.viewPermissions,
              description: t('permissionsListUnavailable'),
            })
          }
        },
        onUsersClick: handleUsersClick,
        onAssignUserClick: setAssignRole,
        onEditClick: handleEditRole,
        onDeleteClick: (role) => setDeleteTarget(role),
      }),
    [isRtl, labels.columns, labels.featured.viewPermissions, t, handleEditRole, handleUsersClick],
  )

  const featuredBulkLabel =
    featuredBulk.action === 'remove' ? t('removeFromFeatured') : t('setAsFeatured')

  return (
    <div className="space-y-6">
      <FeaturedRolesSection
        featuredRoles={featuredRoles}
        isLoading={isLoading}
        labels={labels.featured}
        onManageFeatured={() => setFeaturedDialogOpen(true)}
        onPermissionsClick={(role) => {
          if (role.permissionsCount > 0) {
            setPermissionsRole(role)
          } else {
            handleEditRole(role)
          }
        }}
        onUsersClick={handleUsersClick}
        onManageClick={handleEditRole}
      />

      <DataTablePanel
        index={1}
        toolbar={
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-medium text-foreground">{t('tableTitle')}</h2>
              <p className="text-xs text-muted-foreground">{t('tableDescription')}</p>
            </div>

            <DataTableToolbar
              search={search}
              onSearchChange={onSearchChange}
              searchPlaceholder={t('searchPlaceholder')}
              endContent={
                <>
                  <DataTableBulkActions
                    visible={selectedCount > 0}
                    selectedCount={selectedCount}
                    selectedLabel={t('selected')}
                  >
                    <Button
                      variant="outline"
                      size="xs"
                      disabled={featuredBulk.disabled}
                      onClick={() => void handleFeaturedBulkAction()}
                    >
                      <Star className="size-3.5" />
                      {featuredBulkLabel}
                    </Button>

                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => setDeleteTarget('bulk')}
                    >
                      <Trash2 />
                      {t('deleteSelected')}
                    </Button>
                  </DataTableBulkActions>

                  <RoleStatusFilter
                    value={statusFilter}
                    onChange={onStatusFilterChange}
                    labels={labels.statusFilter}
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
            totalRows={totalRows}
            onPageChange={(pageIndex) =>
              onPaginationStateChange((current) => ({ ...current, pageIndex }))
            }
            onPageSizeChange={(pageSize) =>
              onPaginationStateChange({ pageIndex: 0, pageSize })
            }
            labels={labels.pagination}
          />
        }
      >
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={roles}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row.id}
            emptyMessage={t('empty')}
            animateRows
            className="py-1"
          />
        )}
      </DataTablePanel>

      <PermissionsDialog
        key={permissionsRole?.id ?? 'closed'}
        open={!!permissionsRole}
        onOpenChange={(open) => !open && setPermissionsRole(null)}
        title={permissionsRole?.name ?? ''}
        description={t('permissionsDialogDescription')}
        permissions={permissionsRole?.permissions ?? []}
        labels={labels.permissions}
        onAddPermission={() => permissionsRole && handleEditRole(permissionsRole)}
      />

      <RoleUsersDialog
        open={!!usersRole}
        onOpenChange={(open) => {
          if (!open) {
            setUsersRole(null)
            setUsersRoleMembers([])
          }
        }}
        role={usersRole ? { ...usersRole, users: usersRoleMembers } : null}
        isLoading={isUsersLoading}
        labels={labels.usersDialog}
        onUnassign={handleUnassign}
      />

      <AssignUsersDialog
        open={!!assignRole}
        onOpenChange={(open) => !open && setAssignRole(null)}
        roleId={assignRole?.id ?? null}
        roleName={assignRole?.name ?? ''}
        labels={labels.assignDialog}
        onAssign={async (userIds) => {
          if (assignRole) {
            await handleAssign(assignRole.id, userIds)
          }
        }}
      />

      <SetFeaturedDialog
        open={featuredDialogOpen}
        onOpenChange={setFeaturedDialogOpen}
        initialRoleIds={featuredRoleIds}
        labels={labels.setFeatured}
        onSaved={() => void onRefetch()}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget === 'bulk' ? t('deleteBulkTitle') : t('deleteTitle')}
        description={
          deleteTarget === 'bulk'
            ? t('deleteBulkDescription', { count: selectedCount })
            : t('deleteDescription', { name: (deleteTarget as ManagedRole)?.name ?? '' })
        }
        confirmLabel={labels.usersDialog.confirm}
        cancelLabel={labels.usersDialog.cancel}
        destructive
        onConfirm={() => {
          notify.info({
            title: labels.columns.delete,
            description: t('deleteNotAvailable'),
          })
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
