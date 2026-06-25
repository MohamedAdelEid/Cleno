import type { ReactNode } from 'react'
import type { BagOperationalFilterValue, BagSystemFilterValue } from '@/presentation/components/admin/operational-bags/hooks/use-operational-bags'
import { BagOperationalStatusFilter } from '@/presentation/components/admin/operational-bags/shared/bag-operational-status-filter'
import { BagSystemStatusFilter } from '@/presentation/components/admin/operational-bags/shared/bag-system-status-filter'
import { DataTableToolbar } from '@/presentation/components/dashboard/data-table'

interface BagsFiltersSectionProps {
  search: string
  onSearchChange: (value: string) => void
  systemFilter: BagSystemFilterValue
  onSystemFilterChange: (value: BagSystemFilterValue) => void
  operationalFilter: BagOperationalFilterValue
  onOperationalFilterChange: (value: BagOperationalFilterValue) => void
  bulkActions?: ReactNode
  labels: {
    searchPlaceholder: string
    filterSystemStatus: string
    filterOperationalStatus: string
    filterAll: string
    systemActive: string
    systemInactive: string
    opReady: string
    opProcessing: string
    opOnTheWay: string
    opAssigned: string
    opInTransit: string
    opMissing: string
  }
}

export const BagsFiltersSection = ({
  search,
  onSearchChange,
  systemFilter,
  onSystemFilterChange,
  operationalFilter,
  onOperationalFilterChange,
  bulkActions,
  labels,
}: BagsFiltersSectionProps) => (
  <DataTableToolbar
    search={search}
    onSearchChange={onSearchChange}
    searchPlaceholder={labels.searchPlaceholder}
    endContent={
      <>
        {bulkActions}
        <BagSystemStatusFilter
          value={systemFilter}
          onChange={onSystemFilterChange}
          labels={{
            filterSystemStatus: labels.filterSystemStatus,
            filterAll: labels.filterAll,
            systemActive: labels.systemActive,
            systemInactive: labels.systemInactive,
          }}
        />
        <BagOperationalStatusFilter
          value={operationalFilter}
          onChange={onOperationalFilterChange}
          labels={{
            filterOperationalStatus: labels.filterOperationalStatus,
            filterAll: labels.filterAll,
            opReady: labels.opReady,
            opProcessing: labels.opProcessing,
            opOnTheWay: labels.opOnTheWay,
            opAssigned: labels.opAssigned,
            opInTransit: labels.opInTransit,
            opMissing: labels.opMissing,
          }}
        />
      </>
    }
  />
)
