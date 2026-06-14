import { Check, ChevronDown } from 'lucide-react'

import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'

export type CompanyActiveFilterValue = 'all' | 'active' | 'inactive'

export interface CompanyActiveFilterLabels {
  filterActive: string
  filterAll: string
  active: string
  inactive: string
}

interface CompanyActiveFilterProps {
  value: CompanyActiveFilterValue
  onChange: (value: CompanyActiveFilterValue) => void
  labels: CompanyActiveFilterLabels
}

const filterOptions: Array<{
  value: CompanyActiveFilterValue
  labelKey: keyof CompanyActiveFilterLabels
}> = [
  { value: 'all', labelKey: 'filterAll' },
  { value: 'active', labelKey: 'active' },
  { value: 'inactive', labelKey: 'inactive' },
]

export const CompanyActiveFilter = ({
  value,
  onChange,
  labels,
}: CompanyActiveFilterProps) => {
  const activeLabel =
    value === 'all'
      ? labels.filterAll
      : value === 'active'
        ? labels.active
        : labels.inactive

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 min-w-36 justify-between gap-2">
          <span className="text-muted-foreground">{labels.filterActive}</span>
          <span className="flex items-center gap-1 font-medium">
            {activeLabel}
            <ChevronDown className="size-4 opacity-60" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
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
