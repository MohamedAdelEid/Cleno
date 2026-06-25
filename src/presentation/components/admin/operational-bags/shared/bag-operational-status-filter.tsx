import { Check, ChevronDown } from 'lucide-react'

import { OperationalBagStatus } from '@/domain/enums'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import type { BagOperationalFilterValue } from '@/presentation/components/admin/operational-bags/hooks/use-operational-bags'

export interface BagOperationalStatusFilterLabels {
  filterOperationalStatus: string
  filterAll: string
  opReady: string
  opProcessing: string  
  opOnTheWay: string
  opAssigned: string
  opInTransit: string
  opMissing: string
}

interface BagOperationalStatusFilterProps {
  value: BagOperationalFilterValue
  onChange: (value: BagOperationalFilterValue) => void
  labels: BagOperationalStatusFilterLabels
}

const filterOptions: Array<{
  value: BagOperationalFilterValue
  labelKey: keyof BagOperationalStatusFilterLabels
}> = [
  { value: 'all', labelKey: 'filterAll' },
  { value: OperationalBagStatus.Ready, labelKey: 'opReady' },
  { value: OperationalBagStatus.Processing, labelKey: 'opProcessing' },
  { value: OperationalBagStatus.OnTheWay, labelKey: 'opOnTheWay' },
  { value: OperationalBagStatus.Assigned, labelKey: 'opAssigned' },
  { value: OperationalBagStatus.InTransit, labelKey: 'opInTransit' },
  { value: OperationalBagStatus.Missing, labelKey: 'opMissing' },
]

export const BagOperationalStatusFilter = ({
  value,
  onChange,
  labels,
}: BagOperationalStatusFilterProps) => {
  const activeLabel =
    value === 'all'
      ? labels.filterAll
      : labels[filterOptions.find((option) => option.value === value)?.labelKey ?? 'filterAll']

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 min-w-44 justify-between gap-2">
          <span className="text-muted-foreground">{labels.filterOperationalStatus}</span>
          <span className="flex items-center gap-1 font-medium">
            {activeLabel}
            <ChevronDown className="size-4 opacity-60" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
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
