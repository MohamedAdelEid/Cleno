import type { PaginationState } from '@tanstack/react-table'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { ManagedRole } from '@/domain/entities'
import { RoleStatus } from '@/domain/enums'
import type { RoleStats } from '@/domain/types'
import { rolesApi } from '@/infrastructure/api/roles.api'

const SEARCH_DEBOUNCE_MS = 400

const EMPTY_STATS: RoleStats = {
  totalRoles: 0,
  activeRoles: 0,
  inactiveRoles: 0,
}

interface UseRolesOptions {
  initialPageSize?: number
}

export const useRoles = ({ initialPageSize = 5 }: UseRolesOptions = {}) => {
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<RoleStatus | 'all'>('all')
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const [roles, setRoles] = useState<ManagedRole[]>([])
  const [featuredRoles, setFeaturedRoles] = useState<ManagedRole[]>([])
  const [stats, setStats] = useState<RoleStats>(EMPTY_STATS)
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const hasLoadedOnceRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    setPaginationState((current) => ({ ...current, pageIndex: 0 }))
  }, [debouncedKeyword, statusFilter])

  const fetchRoles = useCallback(async () => {
    const showBlockingLoader = !hasLoadedOnceRef.current
    if (showBlockingLoader) {
      setIsLoading(true)
    }
    setError(null)

    try {
      const result = await rolesApi.getAll({
        keyword: debouncedKeyword || undefined,
        pageNumber: paginationState.pageIndex + 1,
        pageSize: paginationState.pageSize,
        isActive: statusFilter === 'all' ? undefined : statusFilter === RoleStatus.Active,
      })

      if (result.hasValue && result.data) {
        setRoles(result.data.items)
        setFeaturedRoles(result.data.featuredRoles)
        setStats(result.data.stats)

        const totalFromPagination = result.pagination?.total
        setTotalRows(totalFromPagination ?? result.data.stats.totalRoles ?? result.data.items.length)
        hasLoadedOnceRef.current = true
        setHasLoadedOnce(true)
      } else {
        setRoles([])
        setFeaturedRoles([])
        setStats(EMPTY_STATS)
        setTotalRows(0)
        setError(result.error?.message ?? null)
      }
    } catch {
      setError('Unable to load roles.')
    } finally {
      setIsLoading(false)
    }
  }, [debouncedKeyword, paginationState.pageIndex, paginationState.pageSize, statusFilter])

  useEffect(() => {
    void fetchRoles()
  }, [fetchRoles])

  return {
    roles,
    featuredRoles,
    stats,
    totalRows,
    isLoading,
    isInitialLoading: isLoading && !hasLoadedOnce,
    error,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    paginationState,
    setPaginationState,
    refetch: fetchRoles,
  }
}
