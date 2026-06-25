import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
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
import { companyDetailsData } from '@/presentation/components/admin/companies/details/company-details.data'
import { PAGE_EASE } from '@/presentation/utils'

const VALID_TABS: CompanyDetailsTab[] = ['overview', 'orders', 'invoices', 'branches', 'activity']

export const CompanyDetailsPage = () => {
  const { companySlug: _companySlug } = useParams<{ companySlug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab') as CompanyDetailsTab | null
  const branchParam = searchParams.get('branch')
  const searchParam = searchParams.get('search') ?? ''

  const [activeTab, setActiveTab] = useState<CompanyDetailsTab>(() =>
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'overview',
  )

  const company = companyDetailsData

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
    // In real app, would call API to toggle active state
  }, [])

  const handleOrderClick = useCallback((_orderId: string) => {
    // In real app, would navigate to order details
  }, [])

  const branchesSearch = useMemo(() => {
    if (searchParam) return searchParam
    if (activeTab === 'branches' && branchParam) {
      const branch = company.branches.find((b) => b.slug === branchParam)
      return branch?.name ?? branchParam
    }
    return ''
  }, [searchParam, activeTab, branchParam, company.branches])

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
              orders={company.recentOrders}
              branches={company.branches}
              branchFilter={branchFilter}
              search={searchParam}
              onBranchFilterChange={handleBranchFilterChange}
              onSearchChange={handleSearchChange}
              onOrderClick={handleOrderClick}
            />
          )}
          {activeTab === 'invoices' && (
            <InvoicesTab
              invoices={company.invoices}
              branches={company.branches}
              branchFilter={branchFilter}
              search={searchParam}
              onBranchFilterChange={handleBranchFilterChange}
              onSearchChange={handleSearchChange}
            />
          )}
          {activeTab === 'branches' && (
            <BranchesTab
              branches={company.branches}
              search={branchesSearch}
              onSearchChange={handleSearchChange}
              focusedBranchSlug={branchParam ?? undefined}
              onViewOrders={(slug) => navigateToTabWithBranch('orders', slug)}
              onViewInvoices={(slug) => navigateToTabWithBranch('invoices', slug)}
            />
          )}
          {activeTab === 'activity' && <ActivityTab activities={company.activities} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
