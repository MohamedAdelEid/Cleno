import type { PaginationState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ManagedOrder, OrderDriver } from '@/domain/entities'
import { isTerminalOrderStatus, OrderAnalysisInterval, OrderStatus } from '@/domain/enums'
import type { ActiveShipment, OrderAnalysisSummary, OrdersOverviewStats } from '@/domain/types'
import { driversApi, ordersApi } from '@/infrastructure/api/orders.api'

const SEARCH_DEBOUNCE_MS = 400

interface UseOrdersOptions {
  initialPageSize?: number
}

const pickDefaultActiveSlug = (orders: ManagedOrder[]): string | null => {
  const inProgress = orders.find((order) => !isTerminalOrderStatus(order.status))
  return inProgress?.slug ?? orders[0]?.slug ?? null
}

export const useOrders = ({ initialPageSize = 5 }: UseOrdersOptions = {}) => {
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [analysisInterval, setAnalysisInterval] = useState<OrderAnalysisInterval>(
    OrderAnalysisInterval.Monthly,
  )
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const [overviewStats, setOverviewStats] = useState<OrdersOverviewStats | null>(null)
  const [analysisSummary, setAnalysisSummary] = useState<OrderAnalysisSummary | null>(null)
  const [orders, setOrders] = useState<ManagedOrder[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [activeShipment, setActiveShipment] = useState<ActiveShipment | null>(null)
  const [activeOrderSlug, setActiveOrderSlug] = useState<string | null>(null)
  const [assignableDrivers, setAssignableDrivers] = useState<OrderDriver[]>([])

  const [isDashboardLoading, setIsDashboardLoading] = useState(true)
  const [isOrdersLoading, setIsOrdersLoading] = useState(true)
  const [isTrackingLoading, setIsTrackingLoading] = useState(false)
  const [isDriversLoading, setIsDriversLoading] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    setPaginationState((current) =>
      current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
    )
  }, [debouncedKeyword, statusFilter])

  const fetchDashboard = useCallback(async () => {
    setIsDashboardLoading(true)

    try {
      const result = await ordersApi.getDashboard(analysisInterval)

      if (result.hasValue && result.data) {
        setOverviewStats(result.data.overview)
        setAnalysisSummary(result.data.analysis)
        setError(null)
      } else {
        setOverviewStats(null)
        setAnalysisSummary(null)
        setError(result.error?.message ?? null)
      }
    } catch {
      setOverviewStats(null)
      setAnalysisSummary(null)
      setError('Unable to load orders dashboard.')
    } finally {
      setIsDashboardLoading(false)
    }
  }, [analysisInterval])

  const fetchOrders = useCallback(async () => {
    setIsOrdersLoading(true)

    try {
      const result = await ordersApi.getAdminAll({
        keyword: debouncedKeyword || undefined,
        pageNumber: paginationState.pageIndex + 1,
        pageSize: paginationState.pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      })

      if (result.hasValue && result.data) {
        setOrders(result.data)
        setTotalRows(result.pagination?.total ?? result.data.length)
        setError(null)

        setActiveOrderSlug((current) => {
          if (current && result.data!.some((order) => order.slug === current)) {
            return current
          }
          return pickDefaultActiveSlug(result.data!)
        })
      } else {
        setOrders([])
        setTotalRows(0)
        setError(result.error?.message ?? null)
      }
    } catch {
      setOrders([])
      setTotalRows(0)
      setError('Unable to load orders.')
    } finally {
      setIsOrdersLoading(false)
      setLastUpdated(new Date())
    }
  }, [debouncedKeyword, paginationState.pageIndex, paginationState.pageSize, statusFilter])

  const fetchTracking = useCallback(async (slug: string) => {
    setIsTrackingLoading(true)

    try {
      const result = await ordersApi.getTracking(slug)

      if (result.hasValue && result.data) {
        setActiveShipment(result.data)
      } else {
        setActiveShipment(null)
      }
    } catch {
      setActiveShipment(null)
    } finally {
      setIsTrackingLoading(false)
    }
  }, [])

  const fetchDrivers = useCallback(async () => {
    setIsDriversLoading(true)

    try {
      const result = await driversApi.getDropdown(false)
      setAssignableDrivers(result.hasValue && result.data ? result.data : [])
    } catch {
      setAssignableDrivers([])
    } finally {
      setIsDriversLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchDashboard()
  }, [fetchDashboard])

  useEffect(() => {
    void fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    if (!activeOrderSlug) {
      setActiveShipment(null)
      return
    }

    void fetchTracking(activeOrderSlug)
  }, [activeOrderSlug, fetchTracking])

  const selectActiveOrder = useCallback((order: ManagedOrder) => {
    setActiveOrderSlug(order.slug)
  }, [])

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchDashboard(), fetchOrders()])
  }, [fetchDashboard, fetchOrders])

  const updateOrderStatus = useCallback(
    async (slug: string, status: OrderStatus) => {
      setIsMutating(true)
      const result = await ordersApi.updateStatus(slug, status)
      setIsMutating(false)

      if (!result.hasValue) {
        return { success: false, message: result.error?.message ?? 'Unable to update status.' }
      }

      await Promise.all([fetchOrders(), fetchDashboard()])
      if (activeOrderSlug === slug) {
        await fetchTracking(slug)
      }

      return { success: true }
    },
    [activeOrderSlug, fetchDashboard, fetchOrders, fetchTracking],
  )

  const assignDriver = useCallback(
    async (slug: string, driver: OrderDriver | null) => {
      setIsMutating(true)
      const result = await ordersApi.assignDriver(slug, driver?.id ?? null)
      setIsMutating(false)

      if (!result.hasValue) {
        return { success: false, message: result.error?.message ?? 'Unable to assign driver.' }
      }

      await fetchOrders()
      if (activeOrderSlug === slug) {
        await fetchTracking(slug)
      }

      return { success: true }
    },
    [activeOrderSlug, fetchOrders, fetchTracking],
  )

  const cancelOrder = useCallback(
    async (slug: string) => updateOrderStatus(slug, OrderStatus.Cancelled),
    [updateOrderStatus],
  )

  const bulkUpdateStatus = useCallback(
    async (slugs: string[], status: OrderStatus) => {
      setIsMutating(true)
      const results = await Promise.all(
        slugs.map((slug) => ordersApi.updateStatus(slug, status)),
      )
      setIsMutating(false)

      const failed = results.find((result) => !result.hasValue)
      if (failed) {
        return { success: false, message: failed.error?.message ?? 'Unable to update orders.' }
      }

      await Promise.all([fetchOrders(), fetchDashboard()])
      return { success: true }
    },
    [fetchDashboard, fetchOrders],
  )

  const bulkCancelOrders = useCallback(
    async (slugs: string[]) => bulkUpdateStatus(slugs, OrderStatus.Cancelled),
    [bulkUpdateStatus],
  )

  const isPageLoading = useMemo(
    () => isDashboardLoading && isOrdersLoading && !overviewStats && orders.length === 0,
    [isDashboardLoading, isOrdersLoading, overviewStats, orders.length],
  )

  return {
    overviewStats,
    analysisSummary,
    orders,
    totalRows,
    activeShipment,
    activeOrderSlug,
    assignableDrivers,
    isDashboardLoading,
    isOrdersLoading,
    isTrackingLoading,
    isDriversLoading,
    isMutating,
    isPageLoading,
    error,
    lastUpdated,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    analysisInterval,
    setAnalysisInterval,
    paginationState,
    setPaginationState,
    selectActiveOrder,
    refreshAll,
    fetchDrivers,
    updateOrderStatus,
    assignDriver,
    cancelOrder,
    bulkUpdateStatus,
    bulkCancelOrders,
  }
}
