import { CalendarDays, Check, ChevronDown } from 'lucide-react'

import { OrderVolumePeriod } from '@/domain/enums'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { cn } from '@/presentation/utils'

interface OrderVolumePeriodFilterProps {
  value: OrderVolumePeriod
  onChange: (period: OrderVolumePeriod) => void
  labels: Record<OrderVolumePeriod, string>
  className?: string
}

const PERIOD_OPTIONS = [
  OrderVolumePeriod.LastWeek,
  OrderVolumePeriod.Last14Days,
  OrderVolumePeriod.LastMonth,
] as const

export const OrderVolumePeriodFilter = ({
  value,
  onChange,
  labels,
  className,
}: OrderVolumePeriodFilterProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          'h-8 gap-1.5 rounded-lg border-border/80 bg-background px-2.5 text-xs font-medium shadow-none',
          className,
        )}
      >
        <CalendarDays className="size-3.5 text-muted-foreground" strokeWidth={2} />
        {labels[value]}
        <ChevronDown className="size-3.5 text-muted-foreground" strokeWidth={2} />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-40">
      {PERIOD_OPTIONS.map((period) => (
        <DropdownMenuItem key={period} onClick={() => onChange(period)}>
          <span className="flex-1">{labels[period]}</span>
          {value === period && <Check className="size-4 text-foreground" />}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)
