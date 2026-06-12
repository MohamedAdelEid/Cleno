import type { PaginationState, RowSelectionState } from '@tanstack/react-table'
import { ChevronDown, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import type { ManagedRole } from '@/domain/entities'
import { RoleStatus } from '@/domain/enums'
import { notify } from '@/infrastructure/libs/toast/toast'
import {
  DataTable,
  DataTableBulkActions,
  DataTablePagination,
  DataTablePanel,
  DataTableToolbar,
} from '@/presentation/components/dashboard/data-table'
import { ConfirmDialog } from '@/presentation/components/feedback/confirm-dialog'
import {
  PermissionsDialog,
  type PermissionsDialogLabels,
} from '@/presentation/components/admin/permissions'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { AssignUsersDialog } from './assign-users-dialog'
import { RoleStatusFilter } from './role-status-filter'
import { RoleUsersDialog } from './role-users-dialog'
import { createRolesColumns } from './roles-columns'
import { assignableUsersDummyData, rolesDummyData } from './roles.data'

export const RolesTableSection = () => {
  const { t } = useTranslation('roles')
  const { t: tCommon } = useTranslation('common')
  const { isRtl } = useDirection()

  const [roles, setRoles] = useState(rolesDummyData)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<RoleStatus | 'all'>('all')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })

  const [permissionsRole, setPermissionsRole] = useState<ManagedRole | null>(null)
  const [usersRole, setUsersRole] = useState<ManagedRole | null>(null)
  const [assignRole, setAssignRole] = useState<ManagedRole | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<'bulk' | ManagedRole | null>(null)

  const permissionLabels: PermissionsDialogLabels = useMemo(
    () => ({
      permissionUsersView: t('permissionUsersView'),
      permissionUsersCreate: t('permissionUsersCreate'),
      permissionRolesView: t('permissionRolesView'),
      permissionRolesCreate: t('permissionRolesCreate'),
      permissionBranchesView: t('permissionBranchesView'),
      permissionBranchesCreate: t('permissionBranchesCreate'),
      permissionOrdersView: t('permissionOrdersView'),
      permissionOrdersUpdate: t('permissionOrdersUpdate'),
      permissionLaundryView: t('permissionLaundryView'),
      permissionCustomersView: t('permissionCustomersView'),
      permissionSettingsView: t('permissionSettingsView'),
      groupUsers: t('groupUsers'),
      groupRoles: t('groupRoles'),
      groupBranches: t('groupBranches'),
      groupOrders: t('groupOrders'),
      groupLaundry: t('groupLaundry'),
      groupCustomers: t('groupCustomers'),
      groupSettings: t('groupSettings'),
      permissionSettingsFor: t('permissionSettingsFor'),
      groupEmpty: t('groupEmpty'),
      addPermission: t('addPermission'),
    }),
    [t],
  )

  const filteredRoles = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    return roles.filter((role) => {
      const matchesStatus = statusFilter === 'all' || role.status === statusFilter
      const matchesSearch =
        !normalized ||
        role.name.toLowerCase().includes(normalized) ||
        role.description.toLowerCase().includes(normalized)

      return matchesStatus && matchesSearch
    })
  }, [roles, search, statusFilter])

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedCount = selectedIds.length

  const clearSelection = useCallback(() => setRowSelection({}), [])

  const handleBulkStatusChange = (status: RoleStatus) => {
    setRoles((current) =>
      current.map((role) =>
        selectedIds.includes(role.id) ? { ...role, status } : role,
      ),
    )
    notify.success({
      title: t('toastStatusUpdated'),
      description: t('toastStatusUpdatedDesc', { count: selectedCount }),
    })
    clearSelection()
  }

  const handleBulkDelete = () => {
    setRoles((current) => current.filter((role) => !selectedIds.includes(role.id)))
    notify.success({
      title: t('toastDeleted'),
      description: t('toastDeletedDesc', { count: selectedCount }),
    })
    setDeleteTarget(null)
    clearSelection()
  }

  const handleSingleDelete = (role: ManagedRole) => {
    setRoles((current) => current.filter((item) => item.id !== role.id))
    notify.success({
      title: t('toastRoleDeleted'),
      description: t('toastRoleDeletedDesc', { name: role.name }),
    })
    setDeleteTarget(null)
  }

  const handleUnassign = (roleId: string, userId: string) => {
    setRoles((current) =>
      current.map((role) =>
        role.id === roleId
          ? { ...role, users: role.users.filter((user) => user.id !== userId) }
          : role,
      ),
    )
    setUsersRole((current) =>
      current
        ? {
            ...current,
            users: current.users.filter((user) => user.id !== userId),
          }
        : null,
    )
    notify.success({
      title: t('toastUnassigned'),
      description: t('toastUnassignedDesc'),
    })
  }

  const handleAssign = (roleId: string, userIds: string[]) => {
    const usersToAdd = assignableUsersDummyData.filter((user) => userIds.includes(user.id))

    setRoles((current) =>
      current.map((role) =>
        role.id === roleId
          ? {
              ...role,
              users: [
                ...role.users,
                ...usersToAdd.filter(
                  (user) => !role.users.some((existing) => existing.id === user.id),
                ),
              ],
            }
          : role,
      ),
    )

    notify.success({
      title: t('toastAssigned'),
      description: t('toastAssignedDesc', { count: userIds.length }),
    })
  }

  const columns = useMemo(
    () =>
      createRolesColumns(
        {
          roleName: t('colRoleName'),
          description: t('colDescription'),
          permissions: t('colPermissions'),
          users: t('colUsers'),
          status: t('colStatus'),
          createdAt: t('colCreatedAt'),
          permissionsCount: t('permissionsCount'),
          usersMore: t('usersMore'),
          statusActive: t('statusActive'),
          statusInactive: t('statusInactive'),
          assignUser: t('assignUser'),
          edit: t('edit'),
          delete: t('delete'),
        },
        {
          isRtl,
          onPermissionsClick: setPermissionsRole,
          onUsersClick: setUsersRole,
          onAssignUserClick: setAssignRole,
          onEditClick: (role) => console.info('Edit role:', role.id),
          onDeleteClick: (role) => setDeleteTarget(role),
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
        index={1}
        toolbar={
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
                        onClick={() => handleBulkStatusChange(RoleStatus.Active)}
                      >
                        {t('statusActive')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkStatusChange(RoleStatus.Inactive)}
                      >
                        {t('statusInactive')}
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

                <RoleStatusFilter
                  value={statusFilter}
                  onChange={setStatusFilter}
                  labels={{
                    filterStatus: t('filterStatus'),
                    filterAll: t('filterAll'),
                    statusActive: t('statusActive'),
                    statusInactive: t('statusInactive'),
                  }}
                />
              </>
            }
          />
        }
        footer={
          <DataTablePagination
            pageIndex={paginationState.pageIndex}
            pageSize={paginationState.pageSize}
            totalRows={filteredRoles.length}
            onPageChange={(pageIndex) =>
              setPaginationState((current) => ({ ...current, pageIndex }))
            }
            onPageSizeChange={(pageSize) =>
              setPaginationState({ pageIndex: 0, pageSize })
            }
            labels={paginationLabels}
          />
        }
      >
        <DataTable
          columns={columns}
          data={filteredRoles}
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

      <PermissionsDialog
        key={permissionsRole?.id ?? 'closed'}
        open={!!permissionsRole}
        onOpenChange={(open) => !open && setPermissionsRole(null)}
        title={permissionsRole?.name ?? ''}
        description={t('permissionsDialogDescription')}
        permissions={permissionsRole?.permissions ?? []}
        labels={permissionLabels}
        onAddPermission={() =>
          notify.info({
            title: t('addPermission'),
            description: t('addRoleComingSoon'),
          })
        }
      />

      <RoleUsersDialog
        open={!!usersRole}
        onOpenChange={(open) => !open && setUsersRole(null)}
        role={usersRole}
        labels={{
          title: t('usersDialogTitle'),
          description: t('usersDialogDescription'),
          unassign: t('unassign'),
          unassignTitle: t('unassignTitle'),
          unassignDescription: t('unassignDescription'),
          confirm: t('confirm'),
          cancel: t('cancel'),
        }}
        onUnassign={handleUnassign}
      />

      <AssignUsersDialog
        open={!!assignRole}
        onOpenChange={(open) => !open && setAssignRole(null)}
        roleName={assignRole?.name ?? ''}
        users={assignableUsersDummyData}
        assignedUserIds={assignRole?.users.map((user) => user.id) ?? []}
        labels={{
          title: t('assignDialogTitle'),
          description: t('assignDialogDescription'),
          searchPlaceholder: t('assignSearchPlaceholder'),
          assign: t('assign'),
          cancel: t('cancel'),
        }}
        onAssign={(userIds) => assignRole && handleAssign(assignRole.id, userIds)}
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
