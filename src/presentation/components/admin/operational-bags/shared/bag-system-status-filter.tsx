import { Check, ChevronDown } from 'lucide-react'

import { OperationalBagSystemStatus } from '@/domain/enums'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import type { BagSystemFilterValue } from '@/presentation/components/admin/operational-bags/hooks/use-operational-bags'

export interface BagSystemStatusFilterLabels {
  filterSystemStatus: string
  filterAll: string
  systemActive: string
  systemInactive: string
}

interface BagSystemStatusFilterProps {
  value: BagSystemFilterValue
  onChange: (value: BagSystemFilterValue) => void
  labels: BagSystemStatusFilterLabels
}

const filterOptions: Array<{
  value: BagSystemFilterValue
  labelKey: keyof BagSystemStatusFilterLabels
}> = [
  { value: 'all', labelKey: 'filterAll' },
  { value: OperationalBagSystemStatus.Active, labelKey: 'systemActive' },
  { value: OperationalBagSystemStatus.Inactive, labelKey: 'systemInactive' },
]

export const BagSystemStatusFilter = ({
  value,
  onChange,
  labels,
}: BagSystemStatusFilterProps) => {
  const activeLabel =
    value === 'all'
      ? labels.filterAll
      : labels[filterOptions.find((option) => option.value === value)?.labelKey ?? 'filterAll']

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 min-w-40 justify-between gap-2">
          <span className="text-muted-foreground">{labels.filterSystemStatus}</span>
          <span className="flex items-center gap-1 font-medium">
            {activeLabel}
            <ChevronDown className="size-4 opacity-60" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {filterOptions.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => onChange(option.value)}>
            {labels[option.labelKey]}
            {value === option.value && <Check className="ms-auto size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
