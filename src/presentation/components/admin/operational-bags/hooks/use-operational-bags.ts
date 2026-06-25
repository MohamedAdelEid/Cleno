import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PaginationState } from '@tanstack/react-table'

import type { OperationalBag, OperationalBagStats } from '@/domain/entities'
import {
  OperationalBagStatus,
  type OperationalBagStatus as OperationalBagStatusType,
  type OperationalBagSystemStatus as OperationalBagSystemStatusType,
} from '@/domain/enums'
import type { OperationalBagFormValues } from '@/domain/schemas'
import {
  computeOperationalBagStats,
  operationalBagsDummyData,
} from '@/presentation/components/admin/operational-bags/operational-bags.data'

const SEARCH_DEBOUNCE_MS = 400
const INITIAL_LOAD_MS = 650

export type BagSystemFilterValue = OperationalBagSystemStatusType | 'all'
export type BagOperationalFilterValue = OperationalBagStatusType | 'all'

export const useOperationalBags = () => {
  const [bags, setBags] = useState<OperationalBag[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  useEffect(() => {
    setIsLoading(true)
    const timer = window.setTimeout(() => {
      setBags(operationalBagsDummyData)
      setIsLoading(false)
    }, INITIAL_LOAD_MS)

    return () => window.clearTimeout(timer)
  }, [])

  const stats: OperationalBagStats = useMemo(() => computeOperationalBagStats(bags), [bags])

  const filteredBags = useMemo(() => {
    const q = debouncedKeyword.toLowerCase()

    return bags.filter((bag) => {
      const matchesSystem = systemFilter === 'all' || bag.systemStatus === systemFilter
      const matchesOperational =
        operationalFilter === 'all' || bag.operationalStatus === operationalFilter
      const matchesSearch =
        !q ||
        bag.bagId.toLowerCase().includes(q) ||
        bag.currentOrderNumber?.toLowerCase().includes(q) ||
        bag.customerName?.toLowerCase().includes(q)

      return matchesSystem && matchesOperational && matchesSearch
    })
  }, [bags, debouncedKeyword, operationalFilter, systemFilter])

  const paginatedBags = useMemo(() => {
    const start = paginationState.pageIndex * paginationState.pageSize
    return filteredBags.slice(start, start + paginationState.pageSize)
  }, [filteredBags, paginationState])

  const hasActiveFilters =
    debouncedKeyword.length > 0 || systemFilter !== 'all' || operationalFilter !== 'all'

  const clearFilters = useCallback(() => {
    setKeyword('')
    setDebouncedKeyword('')
    setSystemFilter('all')
    setOperationalFilter('all')
  }, [])

  const isBagIdTaken = useCallback(
    (bagId: string, excludeId?: string) =>
      bags.some(
        (bag) => bag.bagId.toUpperCase() === bagId.toUpperCase() && bag.id !== excludeId,
      ),
    [bags],
  )

  const createBag = useCallback((values: OperationalBagFormValues): boolean => {
    if (isBagIdTaken(values.bagId)) return false

    const newBag: OperationalBag = {
      id: `bag-${crypto.randomUUID()}`,
      bagId: values.bagId.toUpperCase(),
      systemStatus: values.systemStatus,
      operationalStatus: OperationalBagStatus.Ready,
      currentOrderId: null,
      currentOrderNumber: null,
      customerId: null,
      customerName: null,
      customerSlug: null,
      updatedAt: new Date().toISOString(),
    }

    setBags((current) => [newBag, ...current])
    return true
  }, [isBagIdTaken])

  const updateBag = useCallback(
    (id: string, values: OperationalBagFormValues): boolean => {
      if (isBagIdTaken(values.bagId, id)) return false

      setBags((current) =>
        current.map((bag) =>
          bag.id === id
            ? {
                ...bag,
                bagId: values.bagId.toUpperCase(),
                systemStatus: values.systemStatus,
                updatedAt: new Date().toISOString(),
              }
            : bag,
        ),
      )
      return true
    },
    [isBagIdTaken],
  )

  const deleteBag = useCallback((id: string) => {
    setBags((current) => current.filter((bag) => bag.id !== id))
  }, [])

  const bulkDeleteBags = useCallback((ids: string[]) => {
    if (!ids.length) return
    const idSet = new Set(ids)
    setBags((current) => current.filter((bag) => !idSet.has(bag.id)))
  }, [])

  const bulkUpdateSystemStatus = useCallback(
    (ids: string[], systemStatus: OperationalBagSystemStatusType) => {
      if (!ids.length) return
      const idSet = new Set(ids)
      const now = new Date().toISOString()

      setBags((current) =>
        current.map((bag) =>
          idSet.has(bag.id) ? { ...bag, systemStatus, updatedAt: now } : bag,
        ),
      )
    },
    [],
  )

  return {
    bags,
    stats,
    filteredBags,
    paginatedBags,
    totalRows: filteredBags.length,
    isLoading,
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
    isBagIdTaken,
  }
}
