import { Plus, Shirt } from 'lucide-react'
import { useCallback, useRef } from 'react'

import {
  LaundryItemsOverviewSection,
  LaundryItemsTableSection,
  useLaundryItemManagement,
} from '@/presentation/components/admin/laundry-items'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'

export const LaundryItemsPage = () => {
  const { t } = useTranslation('laundryItems')
  const openCreateRef = useRef<(() => void) | null>(null)

  const handleRegisterOpenCreate = useCallback((openCreate: () => void) => {
    openCreateRef.current = openCreate
  }, [])

  const {
    items,
    stats,
    statTrends,
    paginatedItems,
    totalRows,
    isLoading,
    isStatsLoading,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    paginationState,
    setPaginationState,
    hasActiveFilters,
    clearFilters,
    createLaundryItem,
    updateLaundryItem,
    bulkToggleActive,
    bulkDeleteItems,
  } = useLaundryItemManagement()

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
        icon={Shirt}
        action={
          <Button type="button" onClick={() => openCreateRef.current?.()}>
            <Plus />
            {t('createLaundryItem')}
          </Button>
        }
      />

      <LaundryItemsOverviewSection
        stats={stats}
        statTrends={statTrends}
        isLoading={isStatsLoading}
      />

      <LaundryItemsTableSection
        items={items}
        paginatedItems={paginatedItems}
        totalRows={totalRows}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        keyword={keyword}
        onKeywordChange={setKeyword}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        onClearFilters={clearFilters}
        paginationState={paginationState}
        onPaginationStateChange={setPaginationState}
        onCreateLaundryItem={createLaundryItem}
        onUpdateLaundryItem={updateLaundryItem}
        onBulkToggleActive={bulkToggleActive}
        onBulkDeleteItems={bulkDeleteItems}
        onRegisterOpenCreate={handleRegisterOpenCreate}
      />
    </div>
  )
}
