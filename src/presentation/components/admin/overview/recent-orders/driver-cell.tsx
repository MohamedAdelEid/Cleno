import { UserRound } from 'lucide-react'

import type { OrderDriver } from '@/domain/entities'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { cn } from '@/presentation/utils'

interface DriverCellProps {
  driver: OrderDriver | null
  unassignedLabel: string
  onAssignClick?: () => void
  onDriverClick?: (driver: OrderDriver) => void
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const DriverCell = ({
  driver,
  unassignedLabel,
  onAssignClick,
  onDriverClick,
}: DriverCellProps) => {
  if (!driver) {
    return (
      <button
        type="button"
        onClick={onAssignClick}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-dashed border-border/80',
          'px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors',
          'hover:border-primary/40 hover:bg-primary/5 hover:text-foreground',
        )}
      >
        <UserRound className="size-3.5 opacity-70" strokeWidth={2} />
        {unassignedLabel}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onDriverClick?.(driver)}
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-md px-0.5 -mx-0.5',
        'transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      )}
    >
      <Avatar size="sm">
        <AvatarImage src={driver.avatarUrl ?? undefined} alt={driver.fullName} />
        <AvatarFallback className="text-[10px]">{getInitials(driver.fullName)}</AvatarFallback>
      </Avatar>
      <span className="truncate text-sm font-medium text-foreground">{driver.fullName}</span>
    </button>
  )
}
