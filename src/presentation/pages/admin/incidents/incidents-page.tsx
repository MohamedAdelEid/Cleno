import { AlertTriangle, Plus } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  IncidentsOverviewSection,
  IncidentsTableSection,
  useIncidentManagement,
} from '@/presentation/components/admin/incidents'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'

export const IncidentsPage = () => {
  const { t } = useTranslation('incidents')
  const [searchParams] = useSearchParams()
  const openCreateRef = useRef<(() => void) | null>(null)

  const initialKeyword = searchParams.get('keyword') ?? ''
  const initialOpenFilter =
    searchParams.get('isOpen') === 'true'
      ? ('open' as const)
      : searchParams.get('isOpen') === 'false'
        ? ('closed' as const)
        : ('all' as const)

  const handleRegisterOpenCreate = useCallback((openCreate: () => void) => {
    openCreateRef.current = openCreate
  }, [])

  const {
    incidents,
    stats,
    statTrends,
    totalRows,
    isLoading,
    isStatsLoading,
    keyword,
    setKeyword,
    typeFilter,
    setTypeFilter,
    stageFilter,
    setStageFilter,
    openFilter,
    setOpenFilter,
    orderStatusFilter,
    setOrderStatusFilter,
    paginationState,
    setPaginationState,
    hasActiveFilters,
    clearFilters,
    fetchIncidentDetail,
    createIncident,
    updateIncident,
    deleteIncident,
    bulkDeleteIncidents,
    addReply,
    updateReply,
    deleteReply,
  } = useIncidentManagement({ initialKeyword, initialOpenFilter })

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
        icon={AlertTriangle}
        iconClassName="text-amber-700 dark:text-amber-400"
        action={
          <Button type="button" onClick={() => openCreateRef.current?.()}>
            <Plus />
            {t('reportIncident')}
          </Button>
        }
      />

      <IncidentsOverviewSection stats={stats} statTrends={statTrends} isLoading={isStatsLoading} />

      <IncidentsTableSection
        incidents={incidents}
        totalRows={totalRows}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        keyword={keyword}
        onKeywordChange={setKeyword}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        stageFilter={stageFilter}
        onStageFilterChange={setStageFilter}
        openFilter={openFilter}
        onOpenFilterChange={setOpenFilter}
        orderStatusFilter={orderStatusFilter}
        onOrderStatusFilterChange={setOrderStatusFilter}
        onClearFilters={clearFilters}
        paginationState={paginationState}
        onPaginationStateChange={setPaginationState}
        onCreateIncident={(orderSlug, values) =>
          createIncident(orderSlug, {
            type: values.type,
            stage: values.stage,
            title: values.title,
            description: values.description,
          })
        }
        onUpdateIncident={(slug, values) =>
          updateIncident(slug, {
            type: values.type,
            stage: values.stage,
            title: values.title,
            description: values.description,
          })
        }
        onDeleteIncident={deleteIncident}
        onBulkDeleteIncidents={bulkDeleteIncidents}
        onFetchDetail={fetchIncidentDetail}
        onAddReply={addReply}
        onUpdateReply={updateReply}
        onDeleteReply={deleteReply}
        onRegisterOpenCreate={handleRegisterOpenCreate}
      />
    </div>
  )
}
