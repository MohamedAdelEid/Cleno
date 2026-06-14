import { Check, ChevronDown } from 'lucide-react'

import { CompanyAccountStatus } from '@/domain/enums'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'

export interface CompanyStatusFilterLabels {
  filterStatus: string
  filterAll: string
  statusPendingEmailVerification: string
  statusPendingAdminApproval: string
  statusApproved: string
  statusRejected: string
  statusSuspended: string
}

interface CompanyStatusFilterProps {
  value: CompanyAccountStatus | 'all'
  onChange: (value: CompanyAccountStatus | 'all') => void
  labels: CompanyStatusFilterLabels
}

const statusOptions: Array<{
  value: CompanyAccountStatus | 'all'
  labelKey: keyof CompanyStatusFilterLabels
}> = [
  { value: 'all', labelKey: 'filterAll' },
  {
    value: CompanyAccountStatus.PendingEmailVerification,
    labelKey: 'statusPendingEmailVerification',
  },
  {
    value: CompanyAccountStatus.PendingAdminApproval,
    labelKey: 'statusPendingAdminApproval',
  },
  { value: CompanyAccountStatus.Approved, labelKey: 'statusApproved' },
  { value: CompanyAccountStatus.Rejected, labelKey: 'statusRejected' },
  { value: CompanyAccountStatus.Suspended, labelKey: 'statusSuspended' },
]

export const CompanyStatusFilter = ({ value, onChange, labels }: CompanyStatusFilterProps) => {
  const activeLabel =
    value === 'all'
      ? labels.filterAll
      : labels[statusOptions.find((option) => option.value === value)?.labelKey ?? 'filterAll']

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 min-w-36 justify-between gap-2">
          <span className="text-muted-foreground">{labels.filterStatus}</span>
          <span className="flex items-center gap-1 font-medium">
            {activeLabel}
            <ChevronDown className="size-4 opacity-60" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {statusOptions.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => onChange(option.value)}>
            {labels[option.labelKey]}
            {value === option.value && <Check className="ms-auto size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
