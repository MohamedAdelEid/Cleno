import { AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { LaundryOrder } from '@/domain/entities/laundry-order.entity'
import { LaundryWorkflowStage } from '@/domain/enums'
import { buildLaundryIncidentsPath } from '@/presentation/routes/laundry.routes'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/presentation/components/ui/tooltip'
import { cn } from '@/presentation/utils'

const stageTypeLabels: Record<LaundryWorkflowStage, string> = {
  [LaundryWorkflowStage.IncomingToLaundry]: 'Incoming',
  [LaundryWorkflowStage.InLaundry]: 'Processing',
  [LaundryWorkflowStage.ReadyForDelivery]: 'Ready',
}

const truncate = (text: string, max = 72) =>
  text.length <= max ? text : `${text.slice(0, max).trim()}…`

interface OrderIncidentTriggerProps {
  order: LaundryOrder
  className?: string
}

export const OrderIncidentTrigger = ({ order, className }: OrderIncidentTriggerProps) => {
  const navigate = useNavigate()
  const count = order.incidents.length

  if (count === 0) return null

  const latest = order.incidents[count - 1]
  if (!latest) return null

  const handleClick = () => {
    navigate(buildLaundryIncidentsPath(order.id))
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleClick}
            className={cn(
              'relative flex size-7 shrink-0 items-center justify-center rounded-lg',
              'border border-amber-200/80 bg-amber-50 text-amber-700 transition-colors',
              'hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50',
              className,
            )}
            aria-label="View incidents"
          >
            <AlertTriangle className="size-3.5" strokeWidth={2} />
            {count > 1 && (
              <span className="absolute -top-1 -end-1 flex size-3.5 items-center justify-center rounded-full bg-amber-600 text-[8px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-56 space-y-1 p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
            {latest.type || stageTypeLabels[latest.stage]}
          </p>
          <p className="text-xs leading-snug">{truncate(latest.content)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
