import { RoleStatus } from '@/domain/enums'
import { Badge } from '@/presentation/components/ui/badge'
import { cn } from '@/presentation/utils'

interface RoleStatusBadgeProps {
  status: RoleStatus
  label: string
}

const statusStyles: Record<RoleStatus, string> = {
  [RoleStatus.Active]:
    'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  [RoleStatus.Inactive]: 'border-border/80 bg-muted/60 text-muted-foreground',
}

export const RoleStatusBadge = ({ status, label }: RoleStatusBadgeProps) => (
  <Badge variant="outline" className={cn('font-medium', statusStyles[status])}>
    {label}
  </Badge>
)
