import { Check, ChevronDown } from 'lucide-react'

import { OrderStatus } from '@/domain/enums'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'

export interface OrderStatusFilterLabels {
  filterOrderStatus: string
  filterAll: string
  statusOrderCreated: string
  statusPickedUp: string
  statusInLaundry: string
  statusReadyForDelivery: string
  statusDelivered: string
}

interface OrderStatusFilterProps {
  value: OrderStatus | 'all'
  onChange: (value: OrderStatus | 'all') => void
  labels: OrderStatusFilterLabels
}

const statusOptions: Array<{
  value: OrderStatus | 'all'
  labelKey: keyof OrderStatusFilterLabels
}> = [
  { value: 'all', labelKey: 'filterAll' },
  { value: OrderStatus.OrderCreated, labelKey: 'statusOrderCreated' },
  { value: OrderStatus.OnTheWayToLaundry, labelKey: 'statusPickedUp' },
  { value: OrderStatus.InLaundry, labelKey: 'statusInLaundry' },
  { value: OrderStatus.ReadyForDelivery, labelKey: 'statusReadyForDelivery' },
  { value: OrderStatus.Delivered, labelKey: 'statusDelivered' },
]

export const OrderStatusFilter = ({ value, onChange, labels }: OrderStatusFilterProps) => {
  const activeLabel =
    value === 'all'
      ? labels.filterAll
      : labels[
          statusOptions.find((option) => option.value === value)?.labelKey ?? 'filterAll'
        ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 min-w-36 justify-between gap-2">
          <span className="text-muted-foreground">{labels.filterOrderStatus}</span>
          <span className="flex items-center gap-1 font-medium">
            {activeLabel}
            <ChevronDown className="size-4 opacity-60" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
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
