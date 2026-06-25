import { Check, ChevronDown } from 'lucide-react'

import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { useTranslation } from '@/presentation/hooks/use-translation'

export type InvoiceStatusFilterValue = 'all' | 'paid' | 'pending' | 'overdue'

interface InvoiceStatusFilterProps {
  value: InvoiceStatusFilterValue
  onChange: (value: InvoiceStatusFilterValue) => void
}

const options: Array<{ value: InvoiceStatusFilterValue; labelKey: string }> = [
  { value: 'all', labelKey: 'detailsFilterAll' },
  { value: 'paid', labelKey: 'invoiceStatusPaid' },
  { value: 'pending', labelKey: 'invoiceStatusPending' },
  { value: 'overdue', labelKey: 'invoiceStatusOverdue' },
]

export const InvoiceStatusFilter = ({ value, onChange }: InvoiceStatusFilterProps) => {
  const { t } = useTranslation('companies')
  const activeOption = options.find((o) => o.value === value) ?? options[0]!
  const activeLabel = t(activeOption.labelKey)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 min-w-36 justify-between gap-2">
          <span className="text-muted-foreground">{t('detailsFilterInvoiceStatus')}</span>
          <span className="flex items-center gap-1 font-medium">
            {activeLabel}
            <ChevronDown className="size-4 opacity-60" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => onChange(option.value)}>
            {t(option.labelKey)}
            {value === option.value && <Check className="ms-auto size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
