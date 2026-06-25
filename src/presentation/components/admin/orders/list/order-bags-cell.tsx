import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/presentation/components/ui/tooltip'

interface OrderBagsCellProps {
  count: number
  labels?: string[]
}

export const OrderBagsCell = ({ count, labels = [] }: OrderBagsCellProps) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-default text-sm font-medium tabular-nums text-foreground">
          {count}
        </span>
      </TooltipTrigger>
      {labels.length > 0 ? (
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs font-medium">{labels.join(' · ')}</p>
        </TooltipContent>
      ) : null}
    </Tooltip>
  </TooltipProvider>
)
