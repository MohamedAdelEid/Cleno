import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { laundryAdapter } from '@/application/adapters/laundry.adapter'
import type { OrderBagsDataDto } from '@/application/dtos/laundry/laundry-ops.dto'
import type {
  ItemBagAssignment,
  LaundryBag,
  LaundryOrder,
  LaundryStats,
} from '@/domain/entities/laundry-order.entity'
import { LaundryWorkflowStage } from '@/domain/enums'
import type { OrderDriver } from '@/domain/entities'
import { companiesDropdownApi, laundryApi } from '@/infrastructure/api/laundry.api'
import { driversApi, ordersApi } from '@/infrastructure/api/orders.api'
import { notify } from '@/infrastructure/libs/toast/toast'
import type { SearchableSelectOption } from '@/presentation/components/ui/searchable-select'
import { useTranslation } from '@/presentation/hooks/use-translation'

import type { LaundrySortMode, LaundryViewMode } from '../filters/laundry-filters-section'
import { useKeyboardShortcuts } from './use-keyboard-shortcuts'

const SEARCH_DEBOUNCE_MS = 400

const BOARD_TABS = ['Incoming', 'InLaundry', 'ReadyForDelivery'] as const

export type StageActionTarget =
  | { type: 'single'; order: LaundryOrder }
  | { type: 'bulk'; orderIds: string[]; stage: LaundryWorkflowStage }
  | null

export interface OverdueAlertState {
  count: number
  orders: { slug: string; orderNumber: string }[]
}

interface UseLaundryDashboardOptions {
  refreshKey?: number
}

export const useLaundryDashboard = ({ refreshKey = 0 }: UseLaundryDashboardOptions = {}) => {
  const { t } = useTranslation('laundry')

  const [stats, setStats] = useState<LaundryStats | null>(null)
  const [overdueAlert, setOverdueAlert] = useState<OverdueAlertState | null>(null)
  const [orders, setOrders] = useState<LaundryOrder[]>([])
  const [customerOptions, setCustomerOptions] = useState<SearchableSelectOption[]>([])
  const [drivers, setDrivers] = useState<OrderDriver[]>([])

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [sortMode, setSortMode] = useState<LaundrySortMode>('newest')
  const [viewMode, setViewMode] = useState<LaundryViewMode>('list')
  const [activeStage, setActiveStage] = useState<LaundryWorkflowStage>(
    LaundryWorkflowStage.IncomingToLaundry,
  )
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [scanVerifyOrder, setScanVerifyOrder] = useState<LaundryOrder | null>(null)
  const [verifiedBags, setVerifiedBags] = useState<Set<string>>(new Set())
  const [stageActionTarget, setStageActionTarget] = useState<StageActionTarget>(null)
  const [assignDriverOrder, setAssignDriverOrder] = useState<LaundryOrder | null>(null)
  const [itemAssignOrder, setItemAssignOrder] = useState<LaundryOrder | null>(null)
  const [bagModalOrder, setBagModalOrder] = useState<LaundryOrder | null>(null)
  const [bagModalData, setBagModalData] = useState<OrderBagsDataDto | null>(null)

  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [isOrdersLoading, setIsOrdersLoading] = useState(true)
  const [isBagModalLoading, setIsBagModalLoading] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true)

    try {
      const [statsResult, alertResult] = await Promise.all([
        laundryApi.getBoardStats(),
        laundryApi.getOverdueAlert(),
      ])

      setStats(statsResult.hasValue && statsResult.data ? statsResult.data : null)
      setOverdueAlert(alertResult.hasValue && alertResult.data ? alertResult.data : null)

      if (!statsResult.hasValue && statsResult.error?.message) {
        setError(statsResult.error.message)
      }
    } catch {
      setStats(null)
      setOverdueAlert(null)
      setError('Unable to load laundry stats.')
    } finally {
      setIsStatsLoading(false)
    }
  }, [])

  const fetchCustomerOptions = useCallback(async () => {
    try {
      const result = await companiesDropdownApi.getDropdown()
      if (result.hasValue && result.data) {
        setCustomerOptions(laundryAdapter.toCompanyOptions(result.data))
      }
    } catch {
      setCustomerOptions([])
    }
  }, [])

  const fetchDrivers = useCallback(async () => {
    try {
      const result = await driversApi.getDropdown()
      if (result.hasValue && result.data) {
        setDrivers(result.data)
      }
    } catch {
      setDrivers([])
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    setIsOrdersLoading(true)

    try {
      const sortBy = sortMode === 'newest' ? 'newest' : 'oldest'
      const sharedParams = {
        search: debouncedSearch || undefined,
        companyId: customerFilter || undefined,
        sortBy: sortBy as 'newest' | 'oldest',
      }

      const results = await Promise.all(
        BOARD_TABS.map((tab) =>
          laundryApi.getBoardOrders({
            tab,
            ...sharedParams,
          }),
        ),
      )

      const merged = results.flatMap((result) => (result.hasValue && result.data ? result.data : []))

      setOrders(merged)
      setError(null)
    } catch {
      setOrders([])
      setError('Unable to load laundry orders.')
    } finally {
      setIsOrdersLoading(false)
    }
  }, [customerFilter, debouncedSearch, sortMode])

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchStats(), fetchCustomerOptions(), fetchDrivers(), fetchOrders()])
  }, [fetchCustomerOptions, fetchDrivers, fetchOrders, fetchStats])

  useEffect(() => {
    void fetchStats()
    void fetchCustomerOptions()
    void fetchDrivers()
  }, [fetchCustomerOptions, fetchDrivers, fetchStats, refreshKey])

  useEffect(() => {
    void fetchOrders()
  }, [fetchOrders, refreshKey])

  useEffect(() => {
    if (!itemAssignOrder) {
      setBagModalOrder(null)
      setBagModalData(null)
      return
    }

    let cancelled = false

    const loadBags = async () => {
      setIsBagModalLoading(true)

      try {
        const result = await laundryApi.getBags(itemAssignOrder.slug)

        if (cancelled) return

        if (result.hasValue && result.data) {
          setBagModalData(result.data)
          setBagModalOrder(laundryAdapter.toBagModalOrder(itemAssignOrder, result.data))
        } else {
          setBagModalData(null)
          setBagModalOrder(itemAssignOrder)
        }
      } catch {
        if (!cancelled) {
          setBagModalData(null)
          setBagModalOrder(itemAssignOrder)
        }
      } finally {
        if (!cancelled) setIsBagModalLoading(false)
      }
    }

    void loadBags()

    return () => {
      cancelled = true
    }
  }, [itemAssignOrder])

  const filteredOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.pickupTime).getTime()
      const dateB = new Date(b.pickupTime).getTime()

      if (Number.isNaN(dateA) || Number.isNaN(dateB)) return 0
      return sortMode === 'newest' ? dateB - dateA : dateA - dateB
    })
  }, [orders, sortMode])

  const processingBagPool = useMemo(() => {
    const bags = new Map<string, { id: string; bagId: string }>()

    bagModalData?.assignments.forEach((assignment) => {
      bags.set(assignment.bagNumber, { id: assignment.bagId, bagId: assignment.bagNumber })
    })

    bagModalOrder?.processingBags.forEach((bag) => {
      bags.set(bag.bagId, { id: bag.id, bagId: bag.bagId })
    })

    return Array.from(bags.values())
  }, [bagModalData, bagModalOrder])

  const findOrderBySlug = useCallback(
    (slug: string) => orders.find((order) => order.slug === slug),
    [orders],
  )

  const handleSelectChange = useCallback((orderId: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (selected) next.add(orderId)
      else next.delete(orderId)
      return next
    })
  }, [])

  const handleSelectAll = useCallback((orderIds: string[]) => {
    setSelectedIds(new Set(orderIds))
  }, [])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  const handleStageAction = useCallback((order: LaundryOrder) => {
    setStageActionTarget({ type: 'single', order })
  }, [])

  const handleBulkSelectedAction = useCallback(() => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    const selectedOrders = orders.filter((o) => ids.includes(o.id))
    const stages = new Set(selectedOrders.map((o) => o.stage))

    if (stages.size !== 1) {
      notify.error({ title: t('toastMixedStages') })
      return
    }

    const firstOrder = selectedOrders[0]
    if (!firstOrder) return

    setStageActionTarget({ type: 'bulk', orderIds: ids, stage: firstOrder.stage })
  }, [selectedIds, orders, t])

  const confirmStageAction = useCallback(async () => {
    if (!stageActionTarget) return

    setIsMutating(true)

    try {
      if (stageActionTarget.type === 'single') {
        const { order } = stageActionTarget
        const nextStatus = laundryAdapter.stageToBulkStatus(order.stage)
        const result = await ordersApi.updateStatus(order.slug, nextStatus)

        if (!result.hasValue) {
          notify.error({ title: result.error?.message ?? t('toastBulkFailed') })
          return
        }

        const toastKey =
          order.stage === LaundryWorkflowStage.IncomingToLaundry
            ? 'toastOrderReceived'
            : order.stage === LaundryWorkflowStage.InLaundry
              ? 'toastOrderReady'
              : 'toastOrderDispatched'

        const toastDescKey =
          order.stage === LaundryWorkflowStage.IncomingToLaundry
            ? 'toastOrderReceivedDesc'
            : order.stage === LaundryWorkflowStage.InLaundry
              ? 'toastOrderReadyDesc'
              : 'toastOrderDispatchedDesc'

        notify.success({
          title: t(toastKey),
          description: t(toastDescKey).replace('{{orderNumber}}', order.orderNumber),
        })
      } else {
        const { orderIds, stage } = stageActionTarget
        const result = await laundryApi.bulkStatus({
          ids: orderIds,
          status: laundryAdapter.stageToBulkStatus(stage),
        })

        if (!result.hasValue || !result.data) {
          notify.error({ title: result.error?.message ?? t('toastBulkFailed') })
          return
        }

        const failedCount = result.data.failed.length
        if (failedCount > 0) {
          notify.error({
            title: t('toastBulkPartial'),
            description: t('toastBulkPartialDesc').replace('{{count}}', String(failedCount)),
          })
        } else {
          notify.success({
            title: t('toastBulkSuccess'),
            description: t('toastBulkSuccessDesc').replace(
              '{{count}}',
              String(result.data.succeeded.length),
            ),
          })
        }

        clearSelection()
      }

      setStageActionTarget(null)
      await refreshAll()
    } finally {
      setIsMutating(false)
    }
  }, [stageActionTarget, t, clearSelection, refreshAll])

  const handleScanVerify = useCallback((order: LaundryOrder) => {
    setScanVerifyOrder(order)
    setVerifiedBags(new Set(order.pickupBags.filter((b) => b.verified).map((b) => b.id)))
  }, [])

  const handleVerifyBag = useCallback((bagId: string) => {
    setVerifiedBags((prev) => new Set([...prev, bagId]))
  }, [])

  const handleScanVerifyConfirm = useCallback(() => {
    if (!scanVerifyOrder) return

    setOrders((prev) =>
      prev.map((o) =>
        o.id === scanVerifyOrder.id
          ? { ...o, pickupBags: o.pickupBags.map((b) => ({ ...b, verified: true })) }
          : o,
      ),
    )
    setScanVerifyOrder(null)
    setVerifiedBags(new Set())
  }, [scanVerifyOrder])

  const handleAssignDriver = useCallback(
    async (orderId: string, driverId: string) => {
      const order = orders.find((o) => o.id === orderId)
      const driver = drivers.find((d) => d.id === driverId)
      if (!order || !driver) return

      setIsMutating(true)

      try {
        const result = await ordersApi.assignDriver(order.slug, driverId)

        if (!result.hasValue) {
          notify.error({ title: result.error?.message ?? t('toastDriverFailed') })
          return
        }

        notify.success({
          title: t('toastDriverAssigned'),
          description: t('toastDriverAssignedDesc')
            .replace('{{driver}}', driver.fullName)
            .replace('{{orderNumber}}', order.orderNumber),
        })

        setAssignDriverOrder(null)
        await refreshAll()
      } finally {
        setIsMutating(false)
      }
    },
    [drivers, orders, refreshAll, t],
  )

  const handleAutoAssign = useCallback(
    (orderId: string) => {
      const driver = drivers[0]
      if (!driver) return
      void handleAssignDriver(orderId, driver.id)
    },
    [drivers, handleAssignDriver],
  )

  const handleSaveBagAssignments = useCallback(
    async (orderId: string, bagAssignments: ItemBagAssignment[], processingBags: LaundryBag[]) => {
      const order = itemAssignOrder
      if (!order || order.id !== orderId) return

      setIsMutating(true)

      try {
        const original = bagModalData?.assignments ?? []
        const persistedIds = new Set(
          bagAssignments.map((assignment) => assignment.id).filter((id) => !id.startsWith('local-')),
        )

        for (const assignment of original) {
          if (!persistedIds.has(assignment.id)) {
            const result = await laundryApi.deleteBagAssignment(order.slug, assignment.id)
            if (!result.hasValue) {
              notify.error({ title: result.error?.message ?? t('toastBagsFailed') })
              return
            }
          }
        }

        for (const assignment of bagAssignments) {
          const bag = processingBags.find((item) => item.id === assignment.bagId)
          const bagNumber =
            bag?.bagId ?? original.find((item) => item.id === assignment.id)?.bagNumber

          if (!bagNumber) continue

          if (assignment.id.startsWith('local-')) {
            const result = await laundryApi.createBagAssignment(order.slug, {
              bagNumber,
              laundryItemId: assignment.itemId,
              quantity: assignment.quantity,
              stage: 2,
            })

            if (!result.hasValue) {
              notify.error({ title: result.error?.message ?? t('toastBagsFailed') })
              return
            }
            continue
          }

          const originalAssignment = original.find((item) => item.id === assignment.id)
          if (originalAssignment && originalAssignment.quantity !== assignment.quantity) {
            const result = await laundryApi.updateBagAssignment(order.slug, assignment.id, {
              quantity: assignment.quantity,
            })

            if (!result.hasValue) {
              notify.error({ title: result.error?.message ?? t('toastBagsFailed') })
              return
            }
          }
        }

        notify.success({ title: t('toastBagsAssigned') })
        setItemAssignOrder(null)
        await refreshAll()
      } finally {
        setIsMutating(false)
      }
    },
    [bagModalData, itemAssignOrder, refreshAll, t],
  )

  const handleAddNote = useCallback(
    async (orderId: string, content: string) => {
      const order = orders.find((o) => o.id === orderId)
      if (!order) return

      setIsMutating(true)

      try {
        const result = await laundryApi.addNote(order.slug, content)

        if (!result.hasValue) {
          notify.error({ title: result.error?.message ?? t('toastNoteFailed') })
          return
        }

        notify.success({ title: t('toastNoteAdded') })
        await refreshAll()
      } finally {
        setIsMutating(false)
      }
    },
    [orders, refreshAll, t],
  )

  const moveOrder = useCallback(
    async (orderId: string, toStage: LaundryWorkflowStage) => {
      const order = orders.find((o) => o.id === orderId)
      if (!order || order.stage === toStage) return

      const nextStatus = laundryAdapter.targetStageToStatus(toStage)
      if (nextStatus == null) return

      setIsMutating(true)

      try {
        const result = await ordersApi.updateStatus(order.slug, nextStatus)

        if (!result.hasValue) {
          notify.error({ title: result.error?.message ?? t('toastStatusFailed') })
          return
        }

        await refreshAll()
      } finally {
        setIsMutating(false)
      }
    },
    [orders, refreshAll, t],
  )

  const handleReceiveFirst = useCallback(
    (order: LaundryOrder) => {
      setStageActionTarget({ type: 'single', order })
    },
    [],
  )

  const handleDispatchFirst = useCallback(
    (order: LaundryOrder) => {
      setStageActionTarget({ type: 'single', order })
    },
    [],
  )

  const handleFocusSearch = useCallback(() => {
    searchRef.current?.focus()
    searchRef.current?.select()
  }, [])

  const handleToggleView = useCallback(() => {
    setViewMode((prev) => (prev === 'list' ? 'board' : 'list'))
    clearSelection()
  }, [clearSelection])

  const handleEscape = useCallback(() => {
    if (stageActionTarget) {
      setStageActionTarget(null)
      return
    }
    if (scanVerifyOrder) {
      setScanVerifyOrder(null)
      return
    }
    if (assignDriverOrder) {
      setAssignDriverOrder(null)
      return
    }
    if (itemAssignOrder) {
      setItemAssignOrder(null)
    }
  }, [stageActionTarget, scanVerifyOrder, assignDriverOrder, itemAssignOrder])

  useKeyboardShortcuts({
    orders: filteredOrders,
    onReceiveFirst: handleReceiveFirst,
    onDispatchFirst: handleDispatchFirst,
    onFocusSearch: handleFocusSearch,
    onToggleView: handleToggleView,
    onEscape: handleEscape,
  })

  return {
    stats,
    overdueAlert,
    orders: filteredOrders,
    allOrders: orders,
    search,
    setSearch,
    customerFilter,
    setCustomerFilter,
    customerOptions,
    sortMode,
    setSortMode,
    viewMode,
    setViewMode,
    activeStage,
    setActiveStage,
    drivers,
    processingBagPool,
    bagModalOrder,
    isStatsLoading,
    isOrdersLoading,
    isBagModalLoading,
    isMutating,
    error,
    refreshAll,
    findOrderBySlug,

    selectedIds,
    handleSelectChange,
    handleSelectAll,
    clearSelection,

    scanVerifyOrder,
    setScanVerifyOrder,
    verifiedBags,
    handleVerifyBag,
    handleScanVerify,
    handleScanVerifyConfirm,

    stageActionTarget,
    setStageActionTarget,
    handleStageAction,
    handleBulkSelectedAction,
    confirmStageAction,

    assignDriverOrder,
    setAssignDriverOrder,
    handleAssignDriver,
    handleAutoAssign,

    itemAssignOrder,
    setItemAssignOrder,
    handleSaveBagAssignments,

    handleAddNote,
    moveOrder,
    searchRef,
  }
}
