import { CalendarDays, Check, ChevronDown } from 'lucide-react'

import { ORDER_ANALYSIS_INTERVALS, type OrderAnalysisInterval } from '@/domain/enums'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { cn } from '@/presentation/utils'

interface OrderAnalysisIntervalFilterProps {
  value: OrderAnalysisInterval
  onChange: (interval: OrderAnalysisInterval) => void
  labels: Record<OrderAnalysisInterval, string>
  className?: string
}

export const OrderAnalysisIntervalFilter = ({
  value,
  onChange,
  labels,
  className,
}: OrderAnalysisIntervalFilterProps) => (
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
      {ORDER_ANALYSIS_INTERVALS.map((interval) => (
        <DropdownMenuItem key={interval} onClick={() => onChange(interval)}>
          <span className="flex-1">{labels[interval]}</span>
          {value === interval && <Check className="size-4 text-foreground" />}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)
