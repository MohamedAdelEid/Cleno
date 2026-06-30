import type { ColumnDef } from '@tanstack/react-table'
import { arSA, enUS } from 'date-fns/locale'
import { CircleCheck, CircleOff, MoreHorizontal, Pencil } from 'lucide-react'

import type { ManagedTimeSlot } from '@/domain/entities'
import { formatTimeOnly } from '@/infrastructure/utils/time-only.utils'
import { DataTableColumnHeader } from '@/presentation/components/dashboard/data-table'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { TimeSlotStatusBadge } from './time-slot-status-badge'

export interface TimeSlotsColumnLabels {
  label: string
  startTime: string
  endTime: string
  displayOrder: string
  status: string
  statusActive: string
  statusInactive: string
  activate: string
  deactivate: string
  edit: string
}

export const createTimeSlotsColumns = (
  labels: TimeSlotsColumnLabels,
  options: {
    isRtl: boolean
    onEditClick?: (slot: ManagedTimeSlot) => void
    onToggleActiveClick?: (slot: ManagedTimeSlot) => void
  },
): ColumnDef<ManagedTimeSlot>[] => {
  const locale = options.isRtl ? arSA : enUS

  return [
    {
      accessorKey: 'label',
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.label} />,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">{row.original.label}</span>
      ),
    },
    {
      accessorKey: 'startTime',
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.startTime} />,
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatTimeOnly(row.original.startTime, locale)}
        </span>
      ),
    },
    {
      accessorKey: 'endTime',
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.endTime} />,
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatTimeOnly(row.original.endTime, locale)}
        </span>
      ),
    },
    {
      accessorKey: 'displayOrder',
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.displayOrder} />,
      cell: ({ row }) => (
        <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 text-primary">
          {row.original.displayOrder}
        </Badge>
      ),
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.status} />,
      cell: ({ row }) => (
        <TimeSlotStatusBadge
          isActive={row.original.isActive}
          activeLabel={labels.statusActive}
          inactiveLabel={labels.statusInactive}
        />
      ),
    },
    {
      id: 'actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const slot = row.original
        const StatusIcon = slot.isActive ? CircleOff : CircleCheck

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => options.onEditClick?.(slot)}>
                <Pencil />
                {labels.edit}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => options.onToggleActiveClick?.(slot)}>
                <StatusIcon />
                {slot.isActive ? labels.deactivate : labels.activate}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
