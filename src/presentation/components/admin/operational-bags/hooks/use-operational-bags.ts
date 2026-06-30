import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PaginationState } from '@tanstack/react-table'

import { bagAdapter } from '@/application/adapters/bag.adapter'
import type {
  OperationalBag,
  OperationalBagStatTrends,
  OperationalBagStats,
} from '@/domain/entities'
import {
  OperationalBagSystemStatus,
  type OperationalBagStatus as OperationalBagStatusType,
  type OperationalBagSystemStatus as OperationalBagSystemStatusType,
} from '@/domain/enums'
import type { OperationalBagFormValues } from '@/domain/schemas'
import { bagsApi } from '@/infrastructure/api/bags.api'

const SEARCH_DEBOUNCE_MS = 400

export type BagSystemFilterValue = OperationalBagSystemStatusType | 'all'
export type BagOperationalFilterValue = OperationalBagStatusType | 'all'

const emptyStats: OperationalBagStats = {
  totalBags: 0,
  activeBags: 0,
  inactiveBags: 0,
  assignedBags: 0,
  processingBags: 0,
  missingBags: 0,
  readyBags: 0,
}

const emptyTrends: OperationalBagStatTrends = {
  totalBags: [],
  activeBags: [],
  inactiveBags: [],
  assignedBags: [],
  processingBags: [],
  missingBags: [],
  readyBags: [],
}

export const useOperationalBags = () => {
  const [bags, setBags] = useState<OperationalBag[]>([])
  const [stats, setStats] = useState<OperationalBagStats>(emptyStats)
  const [statTrends, setStatTrends] = useState<OperationalBagStatTrends>(emptyTrends)
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [systemFilter, setSystemFilter] = useState<BagSystemFilterValue>('all')
  const [operationalFilter, setOperationalFilter] = useState<BagOperationalFilterValue>('all')
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
  }, [debouncedKeyword, systemFilter, operationalFilter])

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true)
    const result = await bagsApi.getStats()

    if (result.hasValue && result.data) {
      setStats(result.data.stats)
      setStatTrends(result.data.trends)
    }

    setIsStatsLoading(false)
  }, [])

  const fetchBags = useCallback(async () => {
    setIsLoading(true)

    const result = await bagsApi.getAdminAll({
      pageNumber: paginationState.pageIndex + 1,
      pageSize: paginationState.pageSize,
      keyword: debouncedKeyword || undefined,
      isActive:
        systemFilter === 'all' ? undefined : systemFilter === OperationalBagSystemStatus.Active,
      operationalStatus:
        operationalFilter === 'all' ? undefined : bagAdapter.statusToApi(operationalFilter),
      sortBy: 'updatedAt',
      sortDirection: 'desc',
    })

    if (result.hasValue && result.data) {
      setBags(result.data)
      setTotalRows(result.pagination?.total ?? result.data.length)
    } else {
      setBags([])
      setTotalRows(0)
    }

    setIsLoading(false)
  }, [
    debouncedKeyword,
    operationalFilter,
    paginationState.pageIndex,
    paginationState.pageSize,
    systemFilter,
  ])

  useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  useEffect(() => {
    void fetchBags()
  }, [fetchBags])

  const hasActiveFilters =
    debouncedKeyword.length > 0 || systemFilter !== 'all' || operationalFilter !== 'all'

  const clearFilters = useCallback(() => {
    setKeyword('')
    setDebouncedKeyword('')
    setSystemFilter('all')
    setOperationalFilter('all')
  }, [])

  const refresh = useCallback(async () => {
    await Promise.all([fetchStats(), fetchBags()])
  }, [fetchBags, fetchStats])

  const isBagIdTaken = useCallback(
    (bagId: string, excludeId?: string) =>
      bags.some((bag) => bag.bagId.toUpperCase() === bagId.toUpperCase() && bag.id !== excludeId),
    [bags],
  )

  const createBag = useCallback(
    async (values: OperationalBagFormValues): Promise<boolean> => {
      const result = await bagsApi.create(bagAdapter.toCreateRequest(values))
      if (!result.hasValue) return false

      await refresh()
      return true
    },
    [refresh],
  )

  const updateBag = useCallback(
    async (id: string, values: OperationalBagFormValues): Promise<boolean> => {
      const bag = bags.find((item) => item.id === id)
      if (!bag) return false

      const result = await bagsApi.update(bag.slug, bagAdapter.toUpdateRequest(values))
      if (!result.hasValue) return false

      await refresh()
      return true
    },
    [bags, refresh],
  )

  const deleteBag = useCallback(
    async (id: string): Promise<boolean> => {
      const bag = bags.find((item) => item.id === id)
      if (!bag) return false

      const result = await bagsApi.delete(bag.slug)
      if (!result.hasValue) return false

      await refresh()
      return true
    },
    [bags, refresh],
  )

  const bulkDeleteBags = useCallback(
    async (ids: string[]): Promise<boolean> => {
      const selectedBags = bags.filter((bag) => ids.includes(bag.id))
      if (!selectedBags.length) return false

      const results = await Promise.all(selectedBags.map((bag) => bagsApi.delete(bag.slug)))
      const success = results.every((result) => result.hasValue)

      if (success) {
        await refresh()
      }

      return success
    },
    [bags, refresh],
  )

  const bulkUpdateSystemStatus = useCallback(
    async (ids: string[], systemStatus: OperationalBagSystemStatusType): Promise<boolean> => {
      const selectedBags = bags.filter((bag) => ids.includes(bag.id))
      if (!selectedBags.length) return false

      const results = await Promise.all(
        selectedBags.map((bag) =>
          bagsApi.update(
            bag.slug,
            bagAdapter.toUpdateRequest({
              bagId: bag.bagId,
              notes: bag.notes,
              weight: bag.weight,
              systemStatus,
              operationalStatus: bag.operationalStatus,
            }),
          ),
        ),
      )
      const success = results.every((result) => result.hasValue)

      if (success) {
        await refresh()
      }

      return success
    },
    [bags, refresh],
  )

  const getBagDetails = useCallback(async (slug: string) => bagsApi.getBySlug(slug), [])

  const paginatedBags = useMemo(() => bags, [bags])

  return {
    bags,
    stats,
    statTrends,
    filteredBags: bags,
    paginatedBags,
    totalRows,
    isLoading,
    isStatsLoading,
    keyword,
    setKeyword,
    systemFilter,
    setSystemFilter,
    operationalFilter,
    setOperationalFilter,
    paginationState,
    setPaginationState,
    hasActiveFilters,
    clearFilters,
    createBag,
    updateBag,
    deleteBag,
    bulkDeleteBags,
    bulkUpdateSystemStatus,
    getBagDetails,
    isBagIdTaken,
  }
}
