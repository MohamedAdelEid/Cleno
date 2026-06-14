import type { ManagedOrder } from '@/domain/entities'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { Badge } from '@/presentation/components/ui/badge'
import { DataTableCellLink } from '@/presentation/components/dashboard/data-table'

interface OrderCustomerCellProps {
  order: ManagedOrder
  onCompanyClick?: (order: ManagedOrder) => void
  onBranchClick?: (order: ManagedOrder) => void
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export const OrderCustomerCell = ({
  order,
  onCompanyClick,
  onBranchClick,
}: OrderCustomerCellProps) => (
  <div className="min-w-[240px] space-y-1.5">
    <div className="flex items-center gap-3">
      <Avatar className="size-10 shrink-0">
        <AvatarImage src={order.company.logoUrl ?? undefined} alt={order.company.name} />
        <AvatarFallback className="bg-neutral-200 text-xs text-neutral-600 dark:bg-muted dark:text-muted-foreground">
          {getInitials(order.company.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <DataTableCellLink
          className="text-sm font-medium"
          onClick={() => onCompanyClick?.(order)}
        >
          {order.company.name}
        </DataTableCellLink>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground"
          >
            {order.company.type}
          </Badge>
          <span className="truncate text-xs text-muted-foreground">{order.company.email}</span>
        </div>
      </div>
    </div>
    <DataTableCellLink
      className="ps-[52px] text-xs text-muted-foreground hover:text-primary"
      onClick={() => onBranchClick?.(order)}
    >
      {order.branchName}
    </DataTableCellLink>
  </div>
)
