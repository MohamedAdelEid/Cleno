import { useCallback, useEffect, useMemo, useState } from 'react'

import { timeSlotAdapter } from '@/application/adapters/time-slot.adapter'
import type {
  ManagedTimeSlot,
  ManagedTimeSlotStatTrends,
  ManagedTimeSlotStats,
} from '@/domain/entities'
import type { TimeSlotFormValues } from '@/domain/schemas'
import { timeSlotsApi } from '@/infrastructure/api/time-slots.api'
import {
  buildTimeSlotStatTrend,
  emptyManagedTimeSlotStats,
  filterTimeSlotsByStatus,
} from '../time-slots.data'

export type TimeSlotStatusFilterValue = 'all' | 'active' | 'inactive'

const emptyTrends: ManagedTimeSlotStatTrends = {
  totalSlots: [],
  activeSlots: [],
  inactiveSlots: [],
}

const buildTrends = (stats: ManagedTimeSlotStats): ManagedTimeSlotStatTrends => ({
  totalSlots: buildTimeSlotStatTrend(stats.totalSlots),
  activeSlots: buildTimeSlotStatTrend(stats.activeSlots),
  inactiveSlots: buildTimeSlotStatTrend(stats.inactiveSlots, 'negative'),
})

export const useTimeSlotManagement = () => {
  const [slots, setSlots] = useState<ManagedTimeSlot[]>([])
  const [stats, setStats] = useState<ManagedTimeSlotStats>(emptyManagedTimeSlotStats)
  const [statTrends, setStatTrends] = useState<ManagedTimeSlotStatTrends>(emptyTrends)
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<TimeSlotStatusFilterValue>('all')

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true)

    const [totalResult, activeResult] = await Promise.all([
      timeSlotsApi.getAll(),
      timeSlotsApi.getAll({ activeOnly: true }),
    ])

    const total = totalResult.data?.length ?? 0
    const active = activeResult.data?.length ?? 0
    const nextStats: ManagedTimeSlotStats = {
      totalSlots: total,
      activeSlots: active,
      inactiveSlots: Math.max(0, total - active),
    }

    setStats(nextStats)
    setStatTrends(buildTrends(nextStats))
    setIsStatsLoading(false)
  }, [])

  const fetchSlots = useCallback(async () => {
    setIsLoading(true)

    const result = await timeSlotsApi.getAll()

    if (result.hasValue && result.data) {
      setSlots(result.data)
    } else {
      setSlots([])
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  useEffect(() => {
    void fetchSlots()
  }, [fetchSlots])

  const refresh = useCallback(async () => {
    await Promise.all([fetchStats(), fetchSlots()])
  }, [fetchSlots, fetchStats])

  const filteredSlots = useMemo(
    () => filterTimeSlotsByStatus(slots, statusFilter),
    [slots, statusFilter],
  )

  const hasActiveFilters = statusFilter !== 'all'

  const clearFilters = useCallback(() => {
    setStatusFilter('all')
  }, [])

  const createTimeSlot = useCallback(
    async (values: TimeSlotFormValues): Promise<{ success: boolean; error?: string }> => {
      const result = await timeSlotsApi.create(timeSlotAdapter.toCreateRequest(values))
      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const updateTimeSlot = useCallback(
    async (
      slug: string,
      values: TimeSlotFormValues,
    ): Promise<{ success: boolean; error?: string }> => {
      const result = await timeSlotsApi.update(slug, timeSlotAdapter.toUpdateRequest(values))
      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const toggleTimeSlotActive = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      const result = await timeSlotsApi.toggleActive([id])
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

      const result = await timeSlotsApi.toggleActive(ids)
      if (!result.hasValue) {
        return { success: false, error: result.error?.message }
      }

      await refresh()
      return { success: true }
    },
    [refresh],
  )

  const getTimeSlotForEdit = useCallback(async (slug: string) => {
    const result = await timeSlotsApi.getForEdit(slug)
    if (!result.hasValue || !result.data) return null
    return timeSlotAdapter.forEditToFormValues(result.data)
  }, [])

  return {
    slots,
    filteredSlots,
    stats,
    statTrends,
    isLoading,
    isStatsLoading,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    clearFilters,
    createTimeSlot,
    updateTimeSlot,
    toggleTimeSlotActive,
    bulkToggleActive,
    getTimeSlotForEdit,
  }
}
