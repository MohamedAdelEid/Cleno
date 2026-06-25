import type { PaginationState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ManagedCompany } from '@/domain/entities'
import { CompanyAccountStatus } from '@/domain/enums'
import type { CompanyStat } from '@/domain/types'
import { companiesApi } from '@/infrastructure/api/companies.api'
import type { CompanyActiveFilterValue } from '@/presentation/components/admin/companies/shared'

const SEARCH_DEBOUNCE_MS = 400

interface UseCompaniesOptions {
  initialPageSize?: number
}

export const useCompanies = ({ initialPageSize = 5 }: UseCompaniesOptions = {}) => {
  const now = useMemo(() => new Date(), [])
  const trendYear = now.getFullYear()
  const trendMonth = now.getMonth() + 1

  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<CompanyAccountStatus | 'all'>('all')
  const [activeFilter, setActiveFilter] = useState<CompanyActiveFilterValue>('all')
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const [companies, setCompanies] = useState<ManagedCompany[]>([])
  const [stats, setStats] = useState<CompanyStat[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    setPaginationState((current) =>
      current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
    )
  }, [debouncedKeyword, statusFilter, activeFilter])

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await companiesApi.getAdminAll({
        keyword: debouncedKeyword || undefined,
        pageNumber: paginationState.pageIndex + 1,
        pageSize: paginationState.pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter,
        isActive:
          activeFilter === 'all' ? undefined : activeFilter === 'active',
        trendYear,
        trendMonth,
      })

      if (result.hasValue && result.data) {
        setCompanies(result.data.items)
        setStats(result.data.stats)

        const totalFromPagination = result.pagination?.total
        const totalFromStats = result.data.stats.find((stat) => stat.key === 'totalCompanies')?.value
        setTotalRows(totalFromPagination ?? totalFromStats ?? result.data.items.length)
      } else {
        setCompanies([])
        setStats([])
        setTotalRows(0)
        setError(result.error?.message ?? null)
      }
    } catch {
      setCompanies([])
      setStats([])
      setTotalRows(0)
      setError('Unable to load companies.')
    } finally {
      setIsLoading(false)
    }
  }, [
    activeFilter,
    debouncedKeyword,
    paginationState.pageIndex,
    paginationState.pageSize,
    statusFilter,
    trendMonth,
    trendYear,
  ])

  useEffect(() => {
    void fetchCompanies()
  }, [fetchCompanies])

  return {
    companies,
    setCompanies,
    stats,
    totalRows,
    isLoading,
    error,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    activeFilter,
    setActiveFilter,
    paginationState,
    setPaginationState,
    refetch: fetchCompanies,
  }
}
