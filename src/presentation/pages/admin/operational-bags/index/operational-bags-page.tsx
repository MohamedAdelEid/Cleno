import { Package, Plus } from 'lucide-react'
import { useCallback, useRef } from 'react'

import {
  BagsOverviewSection,
  BagsTableSection,
  useOperationalBags,
} from '@/presentation/components/admin/operational-bags'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'

export const OperationalBagsPage = () => {
  const { t } = useTranslation('operationalBags')
  const openCreateRef = useRef<(() => void) | null>(null)
  const handleRegisterOpenCreate = useCallback((openCreate: () => void) => {
    openCreateRef.current = openCreate
  }, [])

  const {
    bags,
    stats,
    paginatedBags,
    totalRows,
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
  } = useOperationalBags()

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
        icon={Package}
        action={
          <Button type="button" onClick={() => openCreateRef.current?.()}>
            <Plus />
            {t('createBag')}
          </Button>
        }
      />

      <BagsOverviewSection stats={stats} isLoading={isLoading} />

      <BagsTableSection
        bags={bags}
        paginatedBags={paginatedBags}
        totalRows={totalRows}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        keyword={keyword}
        onKeywordChange={setKeyword}
        systemFilter={systemFilter}
        onSystemFilterChange={setSystemFilter}
        operationalFilter={operationalFilter}
        onOperationalFilterChange={setOperationalFilter}
        onClearFilters={clearFilters}
        paginationState={paginationState}
        onPaginationStateChange={setPaginationState}
        onCreateBag={createBag}
        onUpdateBag={updateBag}
        onDeleteBag={deleteBag}
        onBulkDeleteBags={bulkDeleteBags}
        onBulkUpdateSystemStatus={bulkUpdateSystemStatus}
        isBagIdTaken={isBagIdTaken}
        onRegisterOpenCreate={handleRegisterOpenCreate}
      />
    </div>
  )
}
