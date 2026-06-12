import { Check, ChevronDown } from 'lucide-react'

import { RoleStatus } from '@/domain/enums'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'

export interface RoleStatusFilterLabels {
  filterStatus: string
  filterAll: string
  statusActive: string
  statusInactive: string
}

interface RoleStatusFilterProps {
  value: RoleStatus | 'all'
  onChange: (value: RoleStatus | 'all') => void
  labels: RoleStatusFilterLabels
}

const statusOptions: Array<{ value: RoleStatus | 'all'; labelKey: keyof RoleStatusFilterLabels }> =
  [
    { value: 'all', labelKey: 'filterAll' },
    { value: RoleStatus.Active, labelKey: 'statusActive' },
    { value: RoleStatus.Inactive, labelKey: 'statusInactive' },
  ]

export const RoleStatusFilter = ({ value, onChange, labels }: RoleStatusFilterProps) => {
  const activeLabel =
    value === 'all'
      ? labels.filterAll
      : value === RoleStatus.Active
        ? labels.statusActive
        : labels.statusInactive

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
      <DropdownMenuContent align="end" className="w-44">
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
