import { useCallback, useEffect, useState } from 'react'

import type {
  CompanyActivity,
  CompanyDetailsBranch,
  CompanyDetailsData,
  CompanyInvoice,
  CompanyOrder,
} from '@/domain/entities/company-details.entity'
import { companiesApi } from '@/infrastructure/api/companies.api'
import type { CompanyDetailsTab } from '@/presentation/components/admin/companies/details'

const TAB_PAGE_SIZE = 50

const findBranchByName = (branchName: string, branchList: CompanyDetailsBranch[]) =>
  branchList.find((branch) => branch.name === branchName)

const enrichWithBranchMeta = (orders: CompanyOrder[], branchList: CompanyDetailsBranch[]) =>
  orders.map((order) => {
    const branch = findBranchByName(order.branchName, branchList)

    return {
      ...order,
      branchId: branch?.id ?? order.branchId,
      branchSlug: branch?.slug ?? order.branchSlug,
    }
  })

const enrichInvoicesWithBranchMeta = (
  invoices: CompanyInvoice[],
  branchList: CompanyDetailsBranch[],
) =>
  invoices.map((invoice) => {
    const branch = findBranchByName(invoice.branchName, branchList)

    return {
      ...invoice,
      branchId: branch?.id ?? invoice.branchId,
      branchSlug: branch?.slug ?? invoice.branchSlug,
    }
  })

interface UseCompanyDetailsOptions {
  slug: string | undefined
  activeTab: CompanyDetailsTab
}

export const useCompanyDetails = ({ slug, activeTab }: UseCompanyDetailsOptions) => {
  const [company, setCompany] = useState<CompanyDetailsData | null>(null)
  const [orders, setOrders] = useState<CompanyOrder[]>([])
  const [invoices, setInvoices] = useState<CompanyInvoice[]>([])
  const [branches, setBranches] = useState<CompanyDetailsBranch[]>([])
  const [activities, setActivities] = useState<CompanyActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTabLoading, setIsTabLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!slug) {
      setCompany(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await companiesApi.getProfile(slug)

    if (result.hasValue && result.data) {
      setCompany(result.data)
    } else {
      setCompany(null)
      setError(result.error?.message ?? 'Unable to load company profile.')
    }

    setIsLoading(false)
  }, [slug])

  const fetchBranches = useCallback(async () => {
    if (!slug) return

    const result = await companiesApi.getProfileBranches(slug, {
      pageNumber: 1,
      pageSize: TAB_PAGE_SIZE,
    })

    if (result.hasValue && result.data) {
      setBranches(result.data)
    } else {
      setBranches([])
    }
  }, [slug])

  const fetchTabData = useCallback(async () => {
    if (!slug) return

    setIsTabLoading(true)

    try {
      if (activeTab === 'orders') {
        const [ordersResult, branchesResult] = await Promise.all([
          companiesApi.getProfileOrders(slug, {
            pageNumber: 1,
            pageSize: TAB_PAGE_SIZE,
            sortBy: 'createdAt',
            sortDirection: 'desc',
          }),
          companiesApi.getProfileBranches(slug, {
            pageNumber: 1,
            pageSize: TAB_PAGE_SIZE,
          }),
        ])

        const branchList =
          branchesResult.hasValue && branchesResult.data ? branchesResult.data : []
        setBranches(branchList)
        setOrders(enrichWithBranchMeta(ordersResult.data ?? [], branchList))
        return
      }

      if (activeTab === 'invoices') {
        const [invoicesResult, branchesResult] = await Promise.all([
          companiesApi.getProfileInvoices(slug, {
            pageNumber: 1,
            pageSize: TAB_PAGE_SIZE,
          }),
          companiesApi.getProfileBranches(slug, {
            pageNumber: 1,
            pageSize: TAB_PAGE_SIZE,
          }),
        ])

        const branchList =
          branchesResult.hasValue && branchesResult.data ? branchesResult.data : []
        setBranches(branchList)
        setInvoices(enrichInvoicesWithBranchMeta(invoicesResult.data ?? [], branchList))
        return
      }

      if (activeTab === 'branches') {
        await fetchBranches()
        return
      }

      if (activeTab === 'activity') {
        const result = await companiesApi.getProfileActivity(slug, {
          pageNumber: 1,
          pageSize: TAB_PAGE_SIZE,
        })

        setActivities(result.hasValue && result.data ? result.data : [])
      }
    } finally {
      setIsTabLoading(false)
    }
  }, [activeTab, fetchBranches, slug])

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (!company || activeTab === 'overview') return
    void fetchTabData()
  }, [activeTab, company, fetchTabData])

  const toggleActive = useCallback(async () => {
    if (!company) return false

    const result = await companiesApi.toggleActive([company.id])

    if (!result.hasValue) {
      return false
    }

    setCompany((current) =>
      current
        ? {
            ...current,
            isActive: !current.isActive,
          }
        : current,
    )

    return true
  }, [company])

  const refresh = useCallback(async () => {
    await fetchProfile()
    if (activeTab !== 'overview') {
      await fetchTabData()
    }
  }, [activeTab, fetchProfile, fetchTabData])

  return {
    company,
    orders,
    invoices,
    branches,
    activities,
    isLoading,
    isTabLoading,
    error,
    toggleActive,
    refresh,
  }
}
