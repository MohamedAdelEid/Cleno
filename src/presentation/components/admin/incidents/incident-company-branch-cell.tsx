import type { ManagedIncident } from '@/domain/entities'
import { DataTableCellLink } from '@/presentation/components/dashboard/data-table'
import { Building2 } from 'lucide-react'

interface IncidentCompanyBranchCellProps {
  incident: ManagedIncident
  onCompanyClick?: (incident: ManagedIncident) => void
  onBranchClick?: (incident: ManagedIncident) => void
}

export const IncidentCompanyBranchCell = ({
  incident,
  onCompanyClick,
  onBranchClick,
}: IncidentCompanyBranchCellProps) => (
  <div className="min-w-[200px] space-y-1">
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground">
        <Building2 className="size-3.5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <DataTableCellLink
          className="text-sm font-medium"
          onClick={() => onCompanyClick?.(incident)}
        >
          {incident.company.name}
        </DataTableCellLink>
        {incident.branch.name ? (
          <DataTableCellLink
            className="mt-0.5 block text-xs text-muted-foreground hover:text-primary"
            onClick={() => onBranchClick?.(incident)}
          >
            {incident.branch.name}
          </DataTableCellLink>
        ) : null}
      </div>
    </div>
  </div>
)
