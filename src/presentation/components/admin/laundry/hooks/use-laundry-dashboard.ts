import { useCallback, useMemo, useRef, useState } from 'react'

import type { ItemBagAssignment, LaundryBag, LaundryOrder } from '@/domain/entities/laundry-order.entity'
import { BagStatus, LaundryWorkflowStage } from '@/domain/enums'
import type { SearchableSelectOption } from '@/presentation/components/ui/searchable-select'
import { notify } from '@/infrastructure/libs/toast/toast'
import { useTranslation } from '@/presentation/hooks/use-translation'

import type { LaundryViewMode, LaundrySortMode } from '../filters/laundry-filters-section'
import {
  availableDrivers,
  availableProcessingBags,
  laundryOrders,
  laundryStats,
} from '../laundry.data'
import { useKeyboardShortcuts } from './use-keyboard-shortcuts'

export type StageActionTarget =
  | { type: 'single'; order: LaundryOrder }
  | { type: 'bulk'; orderIds: string[]; stage: LaundryWorkflowStage }
  | null

export const useLaundryDashboard = () => {
  const { t } = useTranslation('laundry')

  const [orders, setOrders] = useState<LaundryOrder[]>(laundryOrders)
  const [search, setSearch] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [sortMode, setSortMode] = useState<LaundrySortMode>('newest')
  const [viewMode, setViewMode] = useState<LaundryViewMode>('list')
  const [activeStage, setActiveStage] = useState<LaundryWorkflowStage>(LaundryWorkflowStage.IncomingToLaundry)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [scanVerifyOrder, setScanVerifyOrder] = useState<LaundryOrder | null>(null)
  const [verifiedBags, setVerifiedBags] = useState<Set<string>>(new Set())
  const [stageActionTarget, setStageActionTarget] = useState<StageActionTarget>(null)
  const [assignDriverOrder, setAssignDriverOrder] = useState<LaundryOrder | null>(null)
  const [itemAssignOrder, setItemAssignOrder] = useState<LaundryOrder | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)

  const customerOptions: SearchableSelectOption[] = useMemo(() => {
    const uniqueCustomers = new Map<string, string>()
    orders.forEach((order) => {
      uniqueCustomers.set(order.customer.id, order.customer.name)
    })
    return Array.from(uniqueCustomers.entries()).map(([value, label]) => ({ value, label }))
  }, [orders])

  const filteredOrders = useMemo(() => {
    let result = orders

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.branchName.toLowerCase().includes(q) ||
          o.pickupBags.some((b) => b.bagId.toLowerCase().includes(q)) ||
          o.processingBags.some((b) => b.bagId.toLowerCase().includes(q)),
      )
    }

    if (customerFilter) {
      result = result.filter((o) => o.customer.id === customerFilter)
    }

    result = [...result].sort((a, b) => {
      const dateA = new Date(a.pickupTime).getTime()
      const dateB = new Date(b.pickupTime).getTime()
      return sortMode === 'newest' ? dateB - dateA : dateA - dateB
    })

    return result
  }, [orders, search, customerFilter, sortMode])

  const advanceOrder = useCallback((orderId: string, fromStage: LaundryWorkflowStage) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o

        if (fromStage === LaundryWorkflowStage.IncomingToLaundry) {
          return {
            ...o,
            stage: LaundryWorkflowStage.InLaundry,
            inLaundrySince: new Date().toISOString(),
            processingBags: [],
            bagAssignments: [],
          }
        }

        if (fromStage === LaundryWorkflowStage.InLaundry) {
          return {
            ...o,
            stage: LaundryWorkflowStage.ReadyForDelivery,
            processingBags: o.processingBags.map((b) => ({ ...b, status: BagStatus.Ready })),
          }
        }

        return o
      }),
    )
  }, [])

  const moveOrder = useCallback((orderId: string, toStage: LaundryWorkflowStage) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o
        if (toStage === LaundryWorkflowStage.InLaundry) {
          return {
            ...o,
            stage: toStage,
            inLaundrySince: o.inLaundrySince ?? new Date().toISOString(),
            processingBags: [],
            bagAssignments: [],
          }
        }
        return { ...o, stage: toStage }
      }),
    )
  }, [])

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

    const stage = firstOrder.stage
    setStageActionTarget({ type: 'bulk', orderIds: ids, stage })
  }, [selectedIds, orders, t])

  const confirmStageAction = useCallback(() => {
    if (!stageActionTarget) return

    if (stageActionTarget.type === 'single') {
      const { order } = stageActionTarget
      advanceOrder(order.id, order.stage)

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
      orderIds.forEach((id) => advanceOrder(id, stage))
      notify.success({
        title: t('toastBulkSuccess'),
        description: t('toastBulkSuccessDesc').replace('{{count}}', String(orderIds.length)),
      })
      clearSelection()
    }

    setStageActionTarget(null)
  }, [stageActionTarget, advanceOrder, t, clearSelection])

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

  const handleAssignDriver = useCallback((orderId: string, driverId: string) => {
    const driver = availableDrivers.find((d) => d.id === driverId)
    if (!driver) return

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, driver } : o)),
    )

    const order = orders.find((o) => o.id === orderId)
    if (order) {
      notify.success({
        title: t('toastDriverAssigned'),
        description: t('toastDriverAssignedDesc')
          .replace('{{driver}}', driver.fullName)
          .replace('{{orderNumber}}', order.orderNumber),
      })
    }
  }, [orders, t])

  const handleAutoAssign = useCallback((orderId: string) => {
    const randomDriver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)]
    if (!randomDriver) return
    handleAssignDriver(orderId, randomDriver.id)
  }, [handleAssignDriver])

  const handleSaveBagAssignments = useCallback(
    (orderId: string, bagAssignments: ItemBagAssignment[], processingBags: LaundryBag[]) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, bagAssignments, processingBags } : o,
        ),
      )
      notify.success({ title: t('toastBagsAssigned') })
    },
    [t],
  )

  const handleAddNote = useCallback((orderId: string, content: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              notes: [
                ...o.notes,
                {
                  id: `note-${Date.now()}`,
                  content,
                  createdAt: new Date().toISOString(),
                  author: 'Current User',
                },
              ],
            }
          : o,
      ),
    )
    notify.success({ title: t('toastNoteAdded') })
  }, [t])

  const handleReceiveFirst = useCallback((order: LaundryOrder) => {
    advanceOrder(order.id, order.stage)
    notify.success({
      title: t('toastOrderReceived'),
      description: t('toastOrderReceivedDesc').replace('{{orderNumber}}', order.orderNumber),
    })
  }, [advanceOrder, t])

  const handleDispatchFirst = useCallback((order: LaundryOrder) => {
    advanceOrder(order.id, order.stage)
    notify.success({
      title: t('toastOrderDispatched'),
      description: t('toastOrderDispatchedDesc').replace('{{orderNumber}}', order.orderNumber),
    })
  }, [advanceOrder, t])

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
      return
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
    stats: laundryStats,
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
    drivers: availableDrivers,
    processingBagPool: availableProcessingBags,

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
