import { Clock, Plus } from 'lucide-react'
import { useCallback, useRef } from 'react'

import {
  TimeSlotsOverviewSection,
  TimeSlotsTableSection,
  useTimeSlotManagement,
} from '@/presentation/components/admin/time-slots'
import { PageHeader } from '@/presentation/components/layout'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'

export const TimeSlotsPage = () => {
  const { t } = useTranslation('timeSlots')
  const openCreateRef = useRef<(() => void) | null>(null)

  const handleRegisterOpenCreate = useCallback((openCreate: () => void) => {
    openCreateRef.current = openCreate
  }, [])

  const {
    slots,
    filteredSlots,
    stats,
    statTrends,
    isLoading,
    isStatsLoading,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    clearFilters,
    createTimeSlot,
    updateTimeSlot,
    toggleTimeSlotActive,
    bulkToggleActive,
    getTimeSlotForEdit,
  } = useTimeSlotManagement()

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
        icon={Clock}
        action={
          <Button type="button" onClick={() => openCreateRef.current?.()}>
            <Plus />
            {t('createTimeSlot')}
          </Button>
        }
      />

      <TimeSlotsOverviewSection stats={stats} statTrends={statTrends} isLoading={isStatsLoading} />

      <TimeSlotsTableSection
        slots={slots}
        filteredSlots={filteredSlots}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={clearFilters}
        onCreateTimeSlot={createTimeSlot}
        onUpdateTimeSlot={updateTimeSlot}
        onToggleTimeSlotActive={toggleTimeSlotActive}
        onBulkToggleActive={bulkToggleActive}
        onGetTimeSlotForEdit={getTimeSlotForEdit}
        onRegisterOpenCreate={handleRegisterOpenCreate}
      />
    </div>
  )
}
