import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/presentation/components/ui/tooltip'
import { DataTableCellLink } from '@/presentation/components/dashboard/data-table'

interface BagsCellProps {
  bags: string[]
  onClick?: () => void
}

export const BagsCell = ({ bags, onClick }: BagsCellProps) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <DataTableCellLink onClick={onClick}>{bags.length}</DataTableCellLink>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-medium">{bags.join(' · ')}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)
