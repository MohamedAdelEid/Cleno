import { CheckCircle2, CircleDot } from 'lucide-react'

import { Badge } from '@/presentation/components/ui/badge'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'

interface IncidentStatusBadgeProps {
  isOpen: boolean
  className?: string
}

export const IncidentStatusBadge = ({ isOpen, className }: IncidentStatusBadgeProps) => {
  const { t } = useTranslation('incidents')
  const Icon = isOpen ? CircleDot : CheckCircle2

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 px-2.5 text-[11px] font-semibold',
        isOpen
          ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300',
        className,
      )}
    >
      <Icon className="size-3" />
      {isOpen ? t('statusOpen') : t('statusClosed')}
    </Badge>
  )
}
