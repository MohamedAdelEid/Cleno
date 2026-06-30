import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PaginationState } from '@tanstack/react-table'

import { laundryItemAdapter } from '@/application/adapters/laundry-item.adapter'
import type {
  ManagedLaundryItem,
  ManagedLaundryItemStatTrends,
  ManagedLaundryItemStats,
} from '@/domain/entities'
import { LaundryItemCategory } from '@/domain/enums'
import type { LaundryItemFormValues } from '@/domain/schemas'
import { laundryItemsApi } from '@/infrastructure/api/laundry-items.api'
import {
  buildLaundryItemStatTrend,
  emptyManagedLaundryItemStats,
} from '../laundry-items.data'

const SEARCH_DEBOUNCE_MS = 400

export type LaundryItemStatusFilterValue = 'all' | 'active' | 'inactive'
export type LaundryItemCategoryFilterValue =
  | 'all'
  | (typeof LaundryItemCategory)[keyof typeof LaundryItemCategory]

interface UseLaundryItemManagementOptions {
  initialKeyword?: string
}

const emptyTrends: ManagedLaundryItemStatTrends = {
  totalItems: [],
  activeItems: [],
  inactiveItems: [],
}

const buildTrends = (stats: ManagedLaundryItemStats): ManagedLaundryItemStatTrends => ({
  totalItems: buildLaundryItemStatTrend(stats.totalItems),
  activeItems: buildLaundryItemStatTrend(stats.activeItems),
  inactiveItems: buildLaundryItemStatTrend(stats.inactiveItems, 'negative'),
})

export const useLaundryItemManagement = ({
  initialKeyword = '',
}: UseLaundryItemManagementOptions = {}) => {
  const [items, setItems] = useState<ManagedLaundryItem[]>([])
  const [stats, setStats] = useState<ManagedLaundryItemStats>(emptyManagedLaundryItemStats)
  const [statTrends, setStatTrends] = useState<ManagedLaundryItemStatTrends>(emptyTrends)
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [keyword, setKeyword] = useState(initialKeyword)
  const [debouncedKeyword, setDebouncedKeyword] = useState(initialKeyword.trim())
  const [statusFilter, setStatusFilter] = useState<LaundryItemStatusFilterValue>('all')
  const [categoryFilter, setCategoryFilter] = useState<LaundryItemCategoryFilterValue>('all')
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
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
  }, [debouncedKeyword, statusFilter, categoryFilter])

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true)

    const [totalResult, activeResult, inactiveResult] = await Promise.all([
      laundryItemsApi.getAdminAll({ pageNumber: 1, pageSize: 1 }),
      laundryItemsApi.getAdminAll({ pageNumber: 1, pageSize: 1, isActive: true }),
      laundryItemsApi.getAdminAll({ pageNumber: 1, pageSize: 1, isActive: false }),
    ])

    const nextStats: ManagedLaundryItemStats = {
      totalItems: totalResult.pagination?.total ?? 0,
      activeItems: activeResult.pagination?.total ?? 0,
      inactiveItems: inactiveResult.pagination?.total ?? 0,
    }

    setStats(nextStats)
    setStatTrends(buildTrends(nextStats))
    setIsStatsLoading(false)
  }, [])

  const fetchItems = useCallback(async () => {
    setIsLoading(true)

    const result = await laundryItemsApi.getAdminAll({
      pageNumber: paginationState.pageIndex + 1,
      pageSize: paginationState.pageSize,
      keyword: debouncedKeyword || undefined,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      isActive:
        statusFilter === 'all' ? undefined : statusFilter === 'active',
      sortBy: 'createdAt',
      sortDirection: 'desc',
    })

    if (result.hasValue && result.data) {
      setItems(result.data)
      setTotalRows(result.pagination?.total ?? result.data.length)
    } else {
      setItems([])
      setTotalRows(0)
    }

    setIsLoading(false)
  }, [
    categoryFilter,
    debouncedKeyword,
    paginationState.pageIndex,
    paginationState.pageSize,
    statusFilter,
  ])

  useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  const hasActiveFilters =
    debouncedKeyword.length > 0 || statusFilter !== 'all' || categoryFilter !== 'all'

  const clearFilters = useCallback(() => {
    setKeyword('')
    setDebouncedKeyword('')
    setStatusFilter('all')
    setCategoryFilter('all')
  }, [])

  const refresh = useCallback(async () => {
    await Promise.all([fetchStats(), fetchItems()])
  }, [fetchItems, fetchStats])

  const createLaundryItem = useCallback(
    async (values: LaundryItemFormValues): Promise<{ success: boolean; error?: string }> => {
      const result = await laundryItemsApi.create(laundryItemAdapter.toCreateRequest(values))
      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const updateLaundryItem = useCallback(
    async (
      slug: string,
      values: LaundryItemFormValues,
    ): Promise<{ success: boolean; error?: string }> => {
      const result = await laundryItemsApi.update(slug, laundryItemAdapter.toUpdateRequest(values))
      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const bulkToggleActive = useCallback(
    async (ids: string[]): Promise<{ success: boolean; error?: string }> => {
      if (!ids.length) return { success: false }

      const result = await laundryItemsApi.toggleActive(ids)
      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const bulkDeleteItems = useCallback(
    async (ids: string[]): Promise<{ success: boolean; error?: string }> => {
      if (!ids.length) return { success: false }

      const result = await laundryItemsApi.delete(ids)
      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const paginatedItems = useMemo(() => items, [items])

  return {
    items,
    stats,
    statTrends,
    paginatedItems,
    totalRows,
    isLoading,
    isStatsLoading,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    paginationState,
    setPaginationState,
    hasActiveFilters,
    clearFilters,
    createLaundryItem,
    updateLaundryItem,
    bulkToggleActive,
    bulkDeleteItems,
  }
}
