import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, CircleCheck, CircleOff, Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

import type { ManagedDriver } from '@/domain/entities'
import { DriverAvailability } from '@/domain/enums'
import { DataTableColumnHeader } from '@/presentation/components/dashboard/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { getDriverInitials } from './drivers.data'
import { DriverStatusBadge } from './driver-status-badge'

export interface DriversColumnLabels {
  driver: string
  phone: string
  orders: string
  status: string
  createdAt: string
  statusAvailable: string
  statusUnavailable: string
  copyPhone: string
  copiedPhone: string
  makeAvailable: string
  makeUnavailable: string
  edit: string
  delete: string
}

const statusLabelKey: Record<DriverAvailability, keyof DriversColumnLabels> = {
  [DriverAvailability.Available]: 'statusAvailable',
  [DriverAvailability.Unavailable]: 'statusUnavailable',
}

const formatDate = (value: string, isRtl: boolean) =>
  format(new Date(value), 'dd MMM yyyy', {
    locale: isRtl ? arSA : enUS,
  })

const PhoneCopy = ({ phone, labels }: { phone: string; labels: DriversColumnLabels }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard?.writeText(phone)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1300)
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-2 text-sm text-foreground">
      <span className="truncate font-medium tabular-nums">{phone}</span>
      <button
        type="button"
        aria-label={copied ? labels.copiedPhone : labels.copyPhone}
        title={copied ? labels.copiedPhone : labels.copyPhone}
        onClick={(event) => {
          event.stopPropagation()
          void handleCopy()
        }}
        className="relative inline-flex items-center justify-center text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-primary"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? 'copied' : 'copy'}
            initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.7, rotate: 12 }}
            transition={{ duration: 0.18 }}
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-600" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </span>
  )
}

const DriverCell = ({ driver }: { driver: ManagedDriver }) => (
  <div className="flex min-w-0 items-center gap-3">
    <Avatar size="lg" className="border border-border/70">
      {driver.photoUrl ? <AvatarImage src={driver.photoUrl} alt={driver.fullName} /> : null}
      <AvatarFallback className="bg-primary/10 font-semibold text-primary">
        {getDriverInitials(driver.fullName)}
      </AvatarFallback>
    </Avatar>
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-foreground">{driver.fullName}</p>
      <p className="truncate text-xs text-muted-foreground">{driver.email}</p>
    </div>
  </div>
)

export const createDriversColumns = (
  labels: DriversColumnLabels,
  options: {
    isRtl: boolean
    onEditClick?: (driver: ManagedDriver) => void
    onToggleStatusClick?: (driver: ManagedDriver) => void
    onDeleteClick?: (driver: ManagedDriver) => void
  },
): ColumnDef<ManagedDriver>[] => [
  {
    accessorKey: 'fullName',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.driver} />,
    cell: ({ row }) => <DriverCell driver={row.original} />,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.phone} />,
    cell: ({ row }) => <PhoneCopy phone={row.original.phone} labels={labels} />,
  },
  {
    accessorKey: 'ordersCount',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.orders} />,
    cell: ({ row }) => (
      <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 text-primary">
        {row.original.ordersCount}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.status} />,
    cell: ({ row }) => {
      const status = row.original.status
      return <DriverStatusBadge status={status} label={labels[statusLabelKey[status]]} />
    },
  },
  {
    accessorKey: 'createdAt',
    sortingFn: (rowA, rowB) => {
      const first = rowA.original.createdAt ?? ''
      const second = rowB.original.createdAt ?? ''
      return new Date(first).getTime() - new Date(second).getTime()
    },
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.createdAt} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.createdAt ? formatDate(row.original.createdAt, options.isRtl) : '—'}
      </span>
    ),
  },
  {
    id: 'actions',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const driver = row.original
      const isAvailable = driver.status === DriverAvailability.Available
      const StatusIcon = isAvailable ? CircleOff : CircleCheck

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => options.onEditClick?.(driver)}>
              <Pencil />
              {labels.edit}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => options.onToggleStatusClick?.(driver)}>
              <StatusIcon />
              {isAvailable ? labels.makeUnavailable : labels.makeAvailable}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => options.onDeleteClick?.(driver)}>
              <Trash2 />
              {labels.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
