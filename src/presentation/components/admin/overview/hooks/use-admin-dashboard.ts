import { format } from 'date-fns'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ActiveDriver, DashboardAlert, RecentOrder } from '@/domain/entities'
import { OrderVolumePeriod } from '@/domain/enums'
import type { AdminDashboardKpis, OrderVolumeSummary } from '@/domain/types'
import { dashboardApi } from '@/infrastructure/api/dashboard.api'
import { useDirection } from '@/presentation/hooks/use-direction'
import type { ActivityItem, UpdatesFilter } from '../latest-updates/latest-updates.types'
import { toActivityTimelineItem } from '../latest-updates/activity-timeline.mapper'

const SEARCH_DEBOUNCE_MS = 350

const activityPeriodForFilter = (
  filter: UpdatesFilter,
  customDate: Date | undefined,
): { period?: 'today' | 'yesterday' | 'this-week'; date?: string } => {
  if (filter === 'custom' && customDate) {
    return { date: format(customDate, 'yyyy-MM-dd') }
  }

  if (filter === 'today') return { period: 'today' }
  if (filter === 'yesterday') return { period: 'yesterday' }
  if (filter === 'this-week') return { period: 'this-week' }

  return { period: 'this-week' }
}

export const useAdminDashboard = () => {
  const { isRtl } = useDirection()

  const [kpis, setKpis] = useState<AdminDashboardKpis | null>(null)
  const [orderVolume, setOrderVolume] = useState<OrderVolumeSummary | null>(null)
  const [orderVolumePeriod, setOrderVolumePeriod] = useState<OrderVolumePeriod>(
    OrderVolumePeriod.Last14Days,
  )
  const [activeDrivers, setActiveDrivers] = useState<ActiveDriver[]>([])
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([])
  const [activityTotalCount, setActivityTotalCount] = useState(0)

  const [activityFilter, setActivityFilter] = useState<UpdatesFilter>('this-week')
  const [activityCustomDate, setActivityCustomDate] = useState<Date | undefined>()
  const [activitySearch, setActivitySearch] = useState('')
  const [debouncedActivitySearch, setDebouncedActivitySearch] = useState('')

  const [isKpisLoading, setIsKpisLoading] = useState(true)
  const [isOrderVolumeLoading, setIsOrderVolumeLoading] = useState(true)
  const [isActiveDriversLoading, setIsActiveDriversLoading] = useState(true)
  const [isAlertsLoading, setIsAlertsLoading] = useState(true)
  const [isRecentOrdersLoading, setIsRecentOrdersLoading] = useState(true)
  const [isActivityLoading, setIsActivityLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedActivitySearch(activitySearch.trim()),
      SEARCH_DEBOUNCE_MS,
    )
    return () => window.clearTimeout(timer)
  }, [activitySearch])

  const fetchKpis = useCallback(async () => {
    setIsKpisLoading(true)
    const result = await dashboardApi.getKpis()
    setKpis(result.hasValue && result.data ? result.data : null)
    setIsKpisLoading(false)
  }, [])

  const fetchOrderVolume = useCallback(async () => {
    setIsOrderVolumeLoading(true)
    const result = await dashboardApi.getOrderVolume(orderVolumePeriod, isRtl)
    setOrderVolume(result.hasValue && result.data ? result.data : null)
    setIsOrderVolumeLoading(false)
  }, [orderVolumePeriod, isRtl])

  const fetchActiveDrivers = useCallback(async () => {
    setIsActiveDriversLoading(true)
    const result = await dashboardApi.getActiveDrivers()
    setActiveDrivers(result.hasValue && result.data ? result.data : [])
    setIsActiveDriversLoading(false)
  }, [])

  const fetchAlerts = useCallback(async () => {
    setIsAlertsLoading(true)
    const result = await dashboardApi.getAlerts({ limit: 10 })
    setAlerts(result.hasValue && result.data ? result.data : [])
    setIsAlertsLoading(false)
  }, [])

  const fetchRecentOrders = useCallback(async () => {
    setIsRecentOrdersLoading(true)
    const result = await dashboardApi.getRecentOrders({ limit: 10 })
    setRecentOrders(result.hasValue && result.data ? result.data : [])
    setIsRecentOrdersLoading(false)
  }, [])

  const fetchActivity = useCallback(async () => {
    setIsActivityLoading(true)

    const { period, date } = activityPeriodForFilter(activityFilter, activityCustomDate)
    const result = await dashboardApi.getActivity({
      period,
      date,
      search: debouncedActivitySearch || undefined,
      limit: 50,
    })

    if (result.hasValue && result.data) {
      setActivityTotalCount(result.data.totalCount)
      setActivityItems(result.data.items.map(toActivityTimelineItem))
    } else {
      setActivityTotalCount(0)
      setActivityItems([])
    }

    setIsActivityLoading(false)
  }, [activityFilter, activityCustomDate, debouncedActivitySearch])

  useEffect(() => {
    void Promise.all([fetchKpis(), fetchActiveDrivers(), fetchAlerts(), fetchRecentOrders()])
  }, [fetchKpis, fetchActiveDrivers, fetchAlerts, fetchRecentOrders])

  useEffect(() => {
    void fetchOrderVolume()
  }, [fetchOrderVolume])

  useEffect(() => {
    void fetchActivity()
  }, [fetchActivity])

  return useMemo(
    () => ({
      kpis,
      isKpisLoading,
      orderVolume,
      orderVolumePeriod,
      setOrderVolumePeriod,
      isOrderVolumeLoading,
      activeDrivers,
      isActiveDriversLoading,
      alerts,
      isAlertsLoading,
      recentOrders,
      isRecentOrdersLoading,
      activityItems,
      activityTotalCount,
      activityFilter,
      setActivityFilter,
      activityCustomDate,
      setActivityCustomDate,
      activitySearch,
      setActivitySearch,
      isActivityLoading,
      refetch: () => {
        void Promise.all([
          fetchKpis(),
          fetchOrderVolume(),
          fetchActiveDrivers(),
          fetchAlerts(),
          fetchRecentOrders(),
          fetchActivity(),
        ])
      },
    }),
    [
      kpis,
      isKpisLoading,
      orderVolume,
      orderVolumePeriod,
      isOrderVolumeLoading,
      activeDrivers,
      isActiveDriversLoading,
      alerts,
      isAlertsLoading,
      recentOrders,
      isRecentOrdersLoading,
      activityItems,
      activityTotalCount,
      activityFilter,
      activityCustomDate,
      activitySearch,
      isActivityLoading,
      fetchKpis,
      fetchOrderVolume,
      fetchActiveDrivers,
      fetchAlerts,
      fetchRecentOrders,
      fetchActivity,
    ],
  )
}
