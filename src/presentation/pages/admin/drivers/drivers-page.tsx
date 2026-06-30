import { Truck, UserPlus } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  DriversOverviewSection,
  DriversTableSection,
  useDriverManagement,
} from '@/presentation/components/admin/drivers'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'

export const DriversPage = () => {
  const { t } = useTranslation('drivers')
  const [searchParams] = useSearchParams()
  const searchFromUrl = searchParams.get('search') ?? ''
  const openCreateRef = useRef<(() => void) | null>(null)

  const handleRegisterOpenCreate = useCallback((openCreate: () => void) => {
    openCreateRef.current = openCreate
  }, [])

  const {
    stats,
    statTrends,
    paginatedDrivers,
    totalRows,
    isLoading,
    isStatsLoading,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    paginationState,
    setPaginationState,
    hasActiveFilters,
    clearFilters,
    createDriver,
    updateDriver,
    toggleDriverStatus,
    deleteDriver,
    bulkToggleStatus,
    bulkDeleteDrivers,
    drivers,
  } = useDriverManagement({ initialKeyword: searchFromUrl })

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
        icon={Truck}
        action={
          <Button type="button" onClick={() => openCreateRef.current?.()}>
            <UserPlus />
            {t('createDriver')}
          </Button>
        }
      />

      <DriversOverviewSection stats={stats} statTrends={statTrends} isLoading={isStatsLoading} />

      <DriversTableSection
        drivers={drivers}
        paginatedDrivers={paginatedDrivers}
        totalRows={totalRows}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        keyword={keyword}
        onKeywordChange={setKeyword}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={clearFilters}
        paginationState={paginationState}
        onPaginationStateChange={setPaginationState}
        onCreateDriver={createDriver}
        onUpdateDriver={updateDriver}
        onToggleDriverStatus={toggleDriverStatus}
        onDeleteDriver={deleteDriver}
        onBulkToggleStatus={bulkToggleStatus}
        onBulkDeleteDrivers={bulkDeleteDrivers}
        onRegisterOpenCreate={handleRegisterOpenCreate}
      />
    </div>
  )
}
