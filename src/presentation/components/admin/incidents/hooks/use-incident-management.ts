import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PaginationState } from '@tanstack/react-table'

import { incidentAdapter } from '@/application/adapters/incident.adapter'
import type { ManagedIncident, ManagedIncidentDetail, ManagedIncidentStatTrends, ManagedIncidentStats } from '@/domain/entities'
import { IncidentStage, IncidentType, OrderStatus } from '@/domain/enums'
import { incidentsApi } from '@/infrastructure/api/incidents.api'
import {
  buildIncidentStatTrends,
  emptyManagedIncidentStats,
  emptyManagedIncidentStatTrends,
} from '../incidents.data'

const SEARCH_DEBOUNCE_MS = 400

export type IncidentTypeFilterValue = IncidentType | 'all'
export type IncidentStageFilterValue = IncidentStage | 'all'
export type IncidentOpenFilterValue = 'all' | 'open' | 'closed'
export type IncidentOrderStatusFilterValue = OrderStatus | 'all'

interface UseIncidentManagementOptions {
  initialKeyword?: string
  initialOpenFilter?: IncidentOpenFilterValue
}

export const useIncidentManagement = ({
  initialKeyword = '',
  initialOpenFilter = 'all',
}: UseIncidentManagementOptions = {}) => {
  const [incidents, setIncidents] = useState<ManagedIncident[]>([])
  const [stats, setStats] = useState<ManagedIncidentStats>(emptyManagedIncidentStats)
  const [statTrends, setStatTrends] = useState<ManagedIncidentStatTrends>(emptyManagedIncidentStatTrends)
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [keyword, setKeyword] = useState(initialKeyword)
  const [debouncedKeyword, setDebouncedKeyword] = useState(initialKeyword.trim())
  const [typeFilter, setTypeFilter] = useState<IncidentTypeFilterValue>('all')
  const [stageFilter, setStageFilter] = useState<IncidentStageFilterValue>('all')
  const [openFilter, setOpenFilter] = useState<IncidentOpenFilterValue>(initialOpenFilter)
  const [orderStatusFilter, setOrderStatusFilter] = useState<IncidentOrderStatusFilterValue>('all')
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  })

  useEffect(() => {
    setKeyword(initialKeyword)
  }, [initialKeyword])

  useEffect(() => {
    setOpenFilter(initialOpenFilter)
  }, [initialOpenFilter])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    setPaginationState((current) =>
      current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
    )
  }, [debouncedKeyword, typeFilter, stageFilter, openFilter, orderStatusFilter])

  const listParams = useMemo(
    () => ({
      pageNumber: paginationState.pageIndex + 1,
      pageSize: paginationState.pageSize,
      keyword: debouncedKeyword || undefined,
      type: typeFilter === 'all' ? undefined : typeFilter,
      stage: stageFilter === 'all' ? undefined : stageFilter,
      isOpen:
        openFilter === 'all' ? undefined : openFilter === 'open',
      orderStatus: orderStatusFilter === 'all' ? undefined : orderStatusFilter,
      sortBy: 'createdAt',
      sortDirection: 'desc' as const,
    }),
    [
      debouncedKeyword,
      openFilter,
      orderStatusFilter,
      paginationState.pageIndex,
      paginationState.pageSize,
      stageFilter,
      typeFilter,
    ],
  )

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true)

    const [totalResult, openResult] = await Promise.all([
      incidentsApi.getAdminAll({ pageNumber: 1, pageSize: 1 }),
      incidentsApi.getAdminAll({ pageNumber: 1, pageSize: 1, isOpen: true }),
    ])

    const total = totalResult.pagination?.total ?? 0
    const open = openResult.pagination?.total ?? 0
    const nextStats: ManagedIncidentStats = {
      total,
      open,
      closed: Math.max(total - open, 0),
    }

    setStats(nextStats)
    setStatTrends(buildIncidentStatTrends(nextStats))
    setIsStatsLoading(false)
  }, [])

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true)

    const result = await incidentsApi.getAdminAll(listParams)

    if (result.hasValue && result.data) {
      setIncidents(result.data)
      setTotalRows(result.pagination?.total ?? result.data.length)
    } else {
      setIncidents([])
      setTotalRows(0)
    }

    setIsLoading(false)
  }, [listParams])

  useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  useEffect(() => {
    void fetchIncidents()
  }, [fetchIncidents])

  const hasActiveFilters =
    debouncedKeyword.length > 0 ||
    typeFilter !== 'all' ||
    stageFilter !== 'all' ||
    openFilter !== 'all' ||
    orderStatusFilter !== 'all'

  const clearFilters = useCallback(() => {
    setKeyword('')
    setTypeFilter('all')
    setStageFilter('all')
    setOpenFilter('all')
    setOrderStatusFilter('all')
  }, [])

  const refresh = useCallback(async () => {
    await Promise.all([fetchStats(), fetchIncidents()])
  }, [fetchIncidents, fetchStats])

  const fetchIncidentDetail = useCallback(async (slug: string): Promise<ManagedIncidentDetail | null> => {
    const result = await incidentsApi.getBySlug(slug)
    return result.hasValue && result.data ? result.data : null
  }, [])

  const createIncident = useCallback(
    async (
      orderSlug: string,
      values: {
        type: IncidentType
        stage?: IncidentStage
        title?: string
        description: string
      },
    ) => {
      const result = await incidentsApi.createForOrder(
        orderSlug,
        incidentAdapter.toCreateRequest(values),
      )

      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const updateIncident = useCallback(
    async (
      slug: string,
      values: {
        type: IncidentType
        stage: IncidentStage
        title?: string
        description: string
      },
    ) => {
      const result = await incidentsApi.update(slug, incidentAdapter.toUpdateRequest(values))

      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const deleteIncident = useCallback(
    async (slug: string) => {
      const result = await incidentsApi.delete(slug)

      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const bulkDeleteIncidents = useCallback(
    async (slugs: string[]) => {
      const results = await Promise.all(slugs.map((slug) => incidentsApi.delete(slug)))
      const failed = results.filter((result) => !result.hasValue).length

      await refresh()

      if (failed > 0) {
        return { success: false, error: `${failed}` }
      }

      return { success: true }
    },
    [refresh],
  )

  const addReply = useCallback(
    async (slug: string, message: string) => {
      const result = await incidentsApi.addReply(slug, message)

      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const updateReply = useCallback(
    async (slug: string, replyId: string, message: string) => {
      const result = await incidentsApi.updateReply(slug, replyId, message)

      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      return { success: true }
    },
    [],
  )

  const deleteReply = useCallback(
    async (slug: string, replyId: string) => {
      const result = await incidentsApi.deleteReply(slug, replyId)

      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  return {
    incidents,
    stats,
    statTrends,
    totalRows,
    isLoading,
    isStatsLoading,
    keyword,
    setKeyword,
    typeFilter,
    setTypeFilter,
    stageFilter,
    setStageFilter,
    openFilter,
    setOpenFilter,
    orderStatusFilter,
    setOrderStatusFilter,
    paginationState,
    setPaginationState,
    hasActiveFilters,
    clearFilters,
    refresh,
    fetchIncidentDetail,
    createIncident,
    updateIncident,
    deleteIncident,
    bulkDeleteIncidents,
    addReply,
    updateReply,
    deleteReply,
  }
}
