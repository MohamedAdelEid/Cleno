import { UserPlus, UsersRound } from 'lucide-react'
import { useCallback, useRef } from 'react'

import {
  UsersOverviewSection,
  UsersTableSection,
  useUserManagement,
} from '@/presentation/components/admin/users'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'

export const UsersPage = () => {
  const { t } = useTranslation('users')
  const openCreateRef = useRef<(() => void) | null>(null)
  const handleRegisterOpenCreate = useCallback((openCreate: () => void) => {
    openCreateRef.current = openCreate
  }, [])

  const {
    users,
    stats,
    statTrends,
    paginatedUsers,
    totalRows,
    isLoading,
    isStatsLoading,
    roleOptions,
    isRolesLoading,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    paginationState,
    setPaginationState,
    hasActiveFilters,
    clearFilters,
    createUser,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    bulkUpdateStatus,
    fetchUserForEdit,
  } = useUserManagement()

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
        icon={UsersRound}
        action={
          <Button type="button" onClick={() => openCreateRef.current?.()}>
            <UserPlus />
            {t('createUser')}
          </Button>
        }
      />

      <UsersOverviewSection stats={stats} statTrends={statTrends} isLoading={isStatsLoading} />

      <UsersTableSection
        users={users}
        paginatedUsers={paginatedUsers}
        totalRows={totalRows}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        keyword={keyword}
        onKeywordChange={setKeyword}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        onClearFilters={clearFilters}
        paginationState={paginationState}
        onPaginationStateChange={setPaginationState}
        roleOptions={roleOptions}
        isRolesLoading={isRolesLoading}
        onCreateUser={createUser}
        onUpdateUser={updateUser}
        onDeleteUser={deleteUser}
        onBulkDeleteUsers={bulkDeleteUsers}
        onBulkUpdateStatus={bulkUpdateStatus}
        fetchUserForEdit={fetchUserForEdit}
        onRegisterOpenCreate={handleRegisterOpenCreate}
      />
    </div>
  )
}
