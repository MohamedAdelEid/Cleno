import type { PaginationState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { managedUserAdapter } from '@/application/adapters/managed-user.adapter'
import type {
  ManagedUser,
  ManagedUserRole,
  ManagedUserStatTrends,
  ManagedUserStats,
} from '@/domain/entities'
import { type ManagedUserStatus as ManagedUserStatusType } from '@/domain/enums'
import type { UserFormValues } from '@/domain/schemas'
import { usersApi } from '@/infrastructure/api/users.api'
import { emptyManagedUserStats } from '@/presentation/components/admin/users/users.data'

const SEARCH_DEBOUNCE_MS = 350

export type UserStatusFilterValue = ManagedUserStatusType | 'all'
export type UserRoleFilterValue = string | 'all'

const emptyTrends: ManagedUserStatTrends = {
  totalUsers: [],
  activeUsers: [],
  inactiveUsers: [],
  suspendedUsers: [],
}

export const useUserManagement = () => {
  const now = useMemo(() => new Date(), [])
  const trendYear = now.getFullYear()
  const trendMonth = now.getMonth() + 1

  const [users, setUsers] = useState<ManagedUser[]>([])
  const [stats, setStats] = useState<ManagedUserStats>(emptyManagedUserStats)
  const [statTrends, setStatTrends] = useState<ManagedUserStatTrends>(emptyTrends)
  const [totalRows, setTotalRows] = useState(0)
  const [roleOptions, setRoleOptions] = useState<ManagedUserRole[]>([])
  const [isRolesLoading, setIsRolesLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatusFilterValue>('all')
  const [roleFilter, setRoleFilter] = useState<UserRoleFilterValue>('all')
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    setPaginationState((current) =>
      current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
    )
  }, [debouncedKeyword, statusFilter, roleFilter])

  const fetchAssignableRoles = useCallback(async () => {
    setIsRolesLoading(true)
    const result = await usersApi.getAssignableRoles()

    if (result.hasValue && result.data) {
      setRoleOptions(result.data)
    } else {
      setRoleOptions([])
    }

    setIsRolesLoading(false)
  }, [])

  useEffect(() => {
    void fetchAssignableRoles()
  }, [fetchAssignableRoles])

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setIsStatsLoading(true)

    const result = await usersApi.getAdminAll(
      managedUserAdapter.toAllParams({
        pageNumber: paginationState.pageIndex + 1,
        pageSize: paginationState.pageSize,
        keyword: debouncedKeyword || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        roleId: roleFilter === 'all' ? undefined : roleFilter,
        sortBy: 'createdAt',
        sortDirection: 'desc',
        trendYear,
        trendMonth,
      }),
    )

    if (result.hasValue && result.data) {
      setUsers(result.data.items)
      setStats(result.data.stats)
      setStatTrends(result.data.trends)
      setTotalRows(result.pagination?.total ?? result.data.stats.totalUsers ?? result.data.items.length)
    } else {
      setUsers([])
      setStats(emptyManagedUserStats)
      setStatTrends(emptyTrends)
      setTotalRows(0)
    }

    setIsLoading(false)
    setIsStatsLoading(false)
  }, [
    debouncedKeyword,
    paginationState.pageIndex,
    paginationState.pageSize,
    roleFilter,
    statusFilter,
    trendMonth,
    trendYear,
  ])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  const hasActiveFilters =
    debouncedKeyword.length > 0 || statusFilter !== 'all' || roleFilter !== 'all'

  const clearFilters = useCallback(() => {
    setKeyword('')
    setDebouncedKeyword('')
    setStatusFilter('all')
    setRoleFilter('all')
  }, [])

  const refresh = useCallback(async () => {
    await fetchUsers()
  }, [fetchUsers])

  const fetchUserForEdit = useCallback(
    async (id: string): Promise<ManagedUser | null> => {
      const result = await usersApi.getForEdit(id, roleOptions)
      return result.hasValue && result.data ? result.data : null
    },
    [roleOptions],
  )

  const createUser = useCallback(
    async (values: UserFormValues): Promise<boolean> => {
      const result = await usersApi.create(managedUserAdapter.toCreateRequest(values))
      if (!result.hasValue) return false

      await refresh()
      return true
    },
    [refresh],
  )

  const updateUser = useCallback(
    async (id: string, values: UserFormValues): Promise<boolean> => {
      const result = await usersApi.update(id, managedUserAdapter.toUpdateRequest(values))
      if (!result.hasValue) return false

      await refresh()
      return true
    },
    [refresh],
  )

  const deleteUser = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await usersApi.delete(id)
      if (!result.hasValue) return false

      await refresh()
      return true
    },
    [refresh],
  )

  const bulkDeleteUsers = useCallback(
    async (ids: string[]): Promise<boolean> => {
      const result = await usersApi.bulkDelete(managedUserAdapter.toBulkDeleteRequest(ids))
      if (!result.hasValue) return false

      await refresh()
      return true
    },
    [refresh],
  )

  const bulkUpdateStatus = useCallback(
    async (ids: string[], status: ManagedUserStatusType): Promise<boolean> => {
      const result = await usersApi.bulkUpdateStatus(
        managedUserAdapter.toBulkStatusRequest(ids, status),
      )
      if (!result.hasValue) return false

      await refresh()
      return true
    },
    [refresh],
  )

  return {
    users,
    paginatedUsers: users,
    totalRows,
    stats,
    statTrends,
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
    refresh,
  }
}
