import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import {
  CompanyDetailsHeader,
  CompanyExecutiveStats,
  CompanyDetailsTabs,
  OverviewTab,
  OrdersTab,
  InvoicesTab,
  BranchesTab,
  ActivityTab,
  type CompanyDetailsTab,
} from '@/presentation/components/admin/companies/details'
import { useCompanyDetails } from '@/presentation/components/admin/companies/hooks/use-company-details'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { PAGE_EASE } from '@/presentation/utils'
import { ROUTES } from '@/presentation/routes/routes.constants'
import { useBreadcrumbStore } from '@/presentation/store/breadcrumb.store'

const VALID_TABS: CompanyDetailsTab[] = ['overview', 'orders', 'invoices', 'branches', 'activity']

const CompanyDetailsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="size-14 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-5 w-32" />
      </div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="h-24 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
    <Skeleton className="h-96 w-full rounded-xl" />
  </div>
)

export const CompanyDetailsPage = () => {
  const { companySlug } = useParams<{ companySlug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab') as CompanyDetailsTab | null
  const branchParam = searchParams.get('branch')
  const searchParam = searchParams.get('search') ?? ''

  const [activeTab, setActiveTab] = useState<CompanyDetailsTab>(() =>
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'overview',
  )

  const {
    company,
    orders,
    invoices,
    branches,
    activities,
    isLoading,
    isTabLoading,
    toggleActive,
  } = useCompanyDetails({
    slug: companySlug,
    activeTab,
  })

  const setDynamicLabel = useBreadcrumbStore((state) => state.setDynamicLabel)

  useEffect(() => {
    setDynamicLabel(company?.slug ?? companySlug ?? null)

    return () => {
      setDynamicLabel(null)
    }
  }, [company?.slug, companySlug, setDynamicLabel])

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam, activeTab])

  const branchFilter = branchParam ?? 'all'

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(updates).forEach(([key, value]) => {
          if (value === null || value === '') next.delete(key)
          else next.set(key, value)
        })
        return next
      })
    },
    [setSearchParams],
  )

  const handleTabChange = useCallback(
    (tab: CompanyDetailsTab) => {
      setActiveTab(tab)
      updateParams({
        tab: tab === 'overview' ? null : tab,
        branch: tab === 'orders' || tab === 'invoices' || tab === 'branches' ? branchParam : null,
        search: tab === 'branches' || tab === 'orders' || tab === 'invoices' ? searchParam || null : null,
      })
    },
    [branchParam, searchParam, updateParams],
  )

  const handleBranchFilterChange = useCallback(
    (slug: string) => {
      updateParams({ branch: slug === 'all' ? null : slug })
    },
    [updateParams],
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      updateParams({ search: value || null })
    },
    [updateParams],
  )

  const navigateToTabWithBranch = useCallback(
    (tab: 'orders' | 'invoices', branchSlug: string) => {
      setActiveTab(tab)
      updateParams({ tab, branch: branchSlug, search: null })
    },
    [updateParams],
  )

  const handleViewAllOrders = useCallback(() => handleTabChange('orders'), [handleTabChange])
  const handleViewAllActivity = useCallback(() => handleTabChange('activity'), [handleTabChange])

  const handleToggleActive = useCallback(() => {
    void toggleActive()
  }, [toggleActive])

  const handleOrderClick = useCallback((_orderId: string) => {
    // In real app, would navigate to order details
  }, [])

  const branchesSearch = useMemo(() => {
    if (searchParam) return searchParam
    if (activeTab === 'branches' && branchParam) {
      const branch = branches.find((b) => b.slug === branchParam)
      return branch?.name ?? branchParam
    }
    return ''
  }, [searchParam, activeTab, branchParam, branches])

  if (isLoading) {
    return <CompanyDetailsSkeleton />
  }

  if (!company) {
    return <Navigate to={ROUTES.COMPANIES.INDEX} replace />
  }

  return (
    <div className="space-y-6">
      <CompanyDetailsHeader company={company} onToggleActive={handleToggleActive} />

      <CompanyExecutiveStats stats={company.stats} />

      <CompanyDetailsTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: PAGE_EASE }}
        >
          {activeTab === 'overview' && (
            <OverviewTab
              company={company}
              onOrderClick={handleOrderClick}
              onViewAllOrders={handleViewAllOrders}
              onViewAllActivity={handleViewAllActivity}
            />
          )}
          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              branches={branches}
              branchFilter={branchFilter}
              search={searchParam}
              isLoading={isTabLoading}
              onBranchFilterChange={handleBranchFilterChange}
              onSearchChange={handleSearchChange}
              onOrderClick={handleOrderClick}
            />
          )}
          {activeTab === 'invoices' && (
            <InvoicesTab
              invoices={invoices}
              branches={branches}
              branchFilter={branchFilter}
              search={searchParam}
              isLoading={isTabLoading}
              onBranchFilterChange={handleBranchFilterChange}
              onSearchChange={handleSearchChange}
            />
          )}
          {activeTab === 'branches' && (
            <BranchesTab
              branches={branches}
              search={branchesSearch}
              isLoading={isTabLoading}
              onSearchChange={handleSearchChange}
              focusedBranchSlug={branchParam ?? undefined}
              onViewOrders={(slug) => navigateToTabWithBranch('orders', slug)}
              onViewInvoices={(slug) => navigateToTabWithBranch('invoices', slug)}
            />
          )}
          {activeTab === 'activity' && (
            <ActivityTab activities={activities} isLoading={isTabLoading} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
