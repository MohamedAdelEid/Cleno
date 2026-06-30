import { AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { LaundryOrder } from '@/domain/entities/laundry-order.entity'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/presentation/components/ui/tooltip'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'
import { cn } from '@/presentation/utils'

interface OrderIncidentTriggerProps {
  order: LaundryOrder
  className?: string
}

export const OrderIncidentTrigger = ({ order, className }: OrderIncidentTriggerProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation('incidents')

  const hasOpenIncidents = order.hasOpenIncidents ?? false

  if (!hasOpenIncidents) return null

  const handleClick = () => {
    const params = new URLSearchParams({
      keyword: order.orderNumber,
      isOpen: 'true',
    })
    navigate(`${ROUTES.INCIDENTS.INDEX}?${params.toString()}`)
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
            aria-label={t('viewIncidents')}
          >
            <AlertTriangle className="size-3.5" strokeWidth={2} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-56 p-2.5">
          <p className="text-xs leading-snug">{t('viewOpenIncidents')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
