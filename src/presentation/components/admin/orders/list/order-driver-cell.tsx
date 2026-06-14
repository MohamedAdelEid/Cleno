import { Pencil, UserRound } from 'lucide-react'

import type { OrderDriver } from '@/domain/entities'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { Button } from '@/presentation/components/ui/button'
import { cn } from '@/presentation/utils'

interface OrderDriverCellProps {
  driver: OrderDriver | null
  assignLabel: string
  changeLabel: string
  onAssignClick?: () => void
  onChangeClick?: () => void
  onDriverClick?: (driver: OrderDriver) => void
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const OrderDriverCell = ({
  driver,
  assignLabel,
  changeLabel,
  onAssignClick,
  onChangeClick,
  onDriverClick,
}: OrderDriverCellProps) => {
  if (!driver) {
    return (
      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={onAssignClick}
        className="h-8 gap-1.5 rounded-full border-dashed font-normal text-muted-foreground hover:text-foreground"
      >
        <UserRound className="size-3.5 opacity-70" strokeWidth={2} />
        {assignLabel}
      </Button>
    )
  }

  return (
    <div className="flex min-w-[180px] items-center gap-2">
      <button
        type="button"
        onClick={() => onDriverClick?.(driver)}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2 rounded-md px-0.5 -mx-0.5',
          'transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        )}
      >
        <Avatar size="sm" className="shrink-0">
          <AvatarImage src={driver.avatarUrl ?? undefined} alt={driver.fullName} />
          <AvatarFallback className="text-[10px]">{getInitials(driver.fullName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 text-start">
          <p className="truncate text-sm font-medium text-foreground">{driver.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{driver.email}</p>
        </div>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground"
        aria-label={changeLabel}
        onClick={onChangeClick}
      >
        <Pencil className="size-3.5" />
      </Button>
    </div>
  )
}
