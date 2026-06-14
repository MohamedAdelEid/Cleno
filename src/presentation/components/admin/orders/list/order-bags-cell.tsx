import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/presentation/components/ui/tooltip'

interface OrderBagsCellProps {
  bags: string[]
}

export const OrderBagsCell = ({ bags }: OrderBagsCellProps) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-default text-sm font-medium tabular-nums text-foreground">
          {bags.length}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs font-medium">{bags.join(' · ')}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)
