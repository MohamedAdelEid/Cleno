import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PaginationState } from '@tanstack/react-table'

import { driverAdapter } from '@/application/adapters/driver.adapter'
import type {
  ManagedDriver,
  ManagedDriverStatTrends,
  ManagedDriverStats,
} from '@/domain/entities'
import { DriverAvailability } from '@/domain/enums'
import type { DriverFormValues } from '@/domain/schemas'
import { driversApi } from '@/infrastructure/api/drivers.api'
import {
  buildDriverStatTrend,
  emptyManagedDriverStats,
} from '@/presentation/components/admin/drivers/drivers.data'

const SEARCH_DEBOUNCE_MS = 400

export type DriverStatusFilterValue = (typeof DriverAvailability)[keyof typeof DriverAvailability] | 'all'

interface UseDriverManagementOptions {
  initialKeyword?: string
}

const emptyTrends: ManagedDriverStatTrends = {
  totalDrivers: [],
  availableDrivers: [],
  unavailableDrivers: [],
}

const buildTrends = (stats: ManagedDriverStats): ManagedDriverStatTrends => ({
  totalDrivers: buildDriverStatTrend(stats.totalDrivers),
  availableDrivers: buildDriverStatTrend(stats.availableDrivers),
  unavailableDrivers: buildDriverStatTrend(stats.unavailableDrivers, 'negative'),
})

export const useDriverManagement = ({ initialKeyword = '' }: UseDriverManagementOptions = {}) => {
  const [drivers, setDrivers] = useState<ManagedDriver[]>([])
  const [stats, setStats] = useState<ManagedDriverStats>(emptyManagedDriverStats)
  const [statTrends, setStatTrends] = useState<ManagedDriverStatTrends>(emptyTrends)
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [keyword, setKeyword] = useState(initialKeyword)
  const [debouncedKeyword, setDebouncedKeyword] = useState(initialKeyword.trim())
  const [statusFilter, setStatusFilter] = useState<DriverStatusFilterValue>('all')
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  })

  useEffect(() => {
    setKeyword(initialKeyword)
  }, [initialKeyword])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    setPaginationState((current) =>
      current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
    )
  }, [debouncedKeyword, statusFilter])

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true)

    const [totalResult, availableResult, unavailableResult] = await Promise.all([
      driversApi.getAdminAll({ pageNumber: 1, pageSize: 1 }),
      driversApi.getAdminAll({ pageNumber: 1, pageSize: 1, status: DriverAvailability.Available }),
      driversApi.getAdminAll({
        pageNumber: 1,
        pageSize: 1,
        status: DriverAvailability.Unavailable,
      }),
    ])

    const nextStats: ManagedDriverStats = {
      totalDrivers: totalResult.pagination?.total ?? 0,
      availableDrivers: availableResult.pagination?.total ?? 0,
      unavailableDrivers: unavailableResult.pagination?.total ?? 0,
    }

    setStats(nextStats)
    setStatTrends(buildTrends(nextStats))
    setIsStatsLoading(false)
  }, [])

  const fetchDrivers = useCallback(async () => {
    setIsLoading(true)

    const result = await driversApi.getAdminAll({
      pageNumber: paginationState.pageIndex + 1,
      pageSize: paginationState.pageSize,
      keyword: debouncedKeyword || undefined,
      status: statusFilter === 'all' ? undefined : driverAdapter.statusToApi(statusFilter),
      sortBy: 'createdAt',
      sortDirection: 'desc',
    })

    if (result.hasValue && result.data) {
      setDrivers(result.data)
      setTotalRows(result.pagination?.total ?? result.data.length)
    } else {
      setDrivers([])
      setTotalRows(0)
    }

    setIsLoading(false)
  }, [
    debouncedKeyword,
    paginationState.pageIndex,
    paginationState.pageSize,
    statusFilter,
  ])

  useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  useEffect(() => {
    void fetchDrivers()
  }, [fetchDrivers])

  const hasActiveFilters = debouncedKeyword.length > 0 || statusFilter !== 'all'

  const clearFilters = useCallback(() => {
    setKeyword('')
    setDebouncedKeyword('')
    setStatusFilter('all')
  }, [])

  const refresh = useCallback(async () => {
    await Promise.all([fetchStats(), fetchDrivers()])
  }, [fetchDrivers, fetchStats])

  const createDriver = useCallback(
    async (values: DriverFormValues): Promise<{ success: boolean; error?: string }> => {
      const result = await driversApi.create(driverAdapter.toCreateRequest(values))
      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const updateDriver = useCallback(
    async (slug: string, values: DriverFormValues): Promise<{ success: boolean; error?: string }> => {
      const result = await driversApi.update(slug, driverAdapter.toUpdateRequest(values))
      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const toggleDriverStatus = useCallback(
    async (slug: string): Promise<{ success: boolean; error?: string }> => {
      const result = await driversApi.toggleStatus(slug)
      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const deleteDriver = useCallback(
    async (slug: string): Promise<{ success: boolean; error?: string }> => {
      const result = await driversApi.delete(slug)
      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const bulkToggleStatus = useCallback(
    async (slugs: string[]): Promise<{ success: boolean; error?: string }> => {
      if (!slugs.length) return { success: false }

      const results = await Promise.all(slugs.map((slug) => driversApi.toggleStatus(slug)))
      const failed = results.find((result) => !result.hasValue)

      if (failed) {
        return { success: false, error: failed.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const bulkDeleteDrivers = useCallback(
    async (slugs: string[]): Promise<{ success: boolean; error?: string }> => {
      if (!slugs.length) return { success: false }

      const results = await Promise.all(slugs.map((slug) => driversApi.delete(slug)))
      const failed = results.find((result) => !result.hasValue)

      if (failed) {
        return { success: false, error: failed.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const getDriverBySlug = useCallback(async (slug: string) => driversApi.getBySlug(slug), [])

  const paginatedDrivers = useMemo(() => drivers, [drivers])

  return {
    drivers,
    stats,
    statTrends,
    paginatedDrivers,
    totalRows,
    isLoading,
    isStatsLoading,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    paginationState,
    setPaginationState,
    hasActiveFilters,
    clearFilters,
    createDriver,
    updateDriver,
    toggleDriverStatus,
    deleteDriver,
    bulkToggleStatus,
    bulkDeleteDrivers,
    getDriverBySlug,
  }
}
