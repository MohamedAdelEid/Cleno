import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { Copy, Eye, MoreHorizontal, UserRound } from 'lucide-react'

import type { RecentOrder } from '@/domain/entities'
import { OrderStatus } from '@/domain/enums'
import {
  DataTableCellLink,
  DataTableColumnHeader,
} from '@/presentation/components/dashboard/data-table'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { BagsCell } from './bags-cell'
import { DriverCell } from './driver-cell'
import { OrderStatusBadge } from './order-status-badge'

export interface RecentOrdersColumnLabels {
  orderId: string
  customer: string
  branch: string
  pickup: string
  expectedDelivery: string
  bags: string
  driver: string
  status: string
  unassigned: string
  viewOrder: string
  viewCustomer: string
  copyOrderId: string
  assignDriver: string
  statusOrderCreated: string
  statusOnTheWayToLaundry: string
  statusInLaundry: string
  statusReadyForDelivery: string
  statusDelivered: string
}

const statusLabelKey: Record<OrderStatus, keyof RecentOrdersColumnLabels> = {
  [OrderStatus.OrderCreated]: 'statusOrderCreated',
  [OrderStatus.OnTheWayToLaundry]: 'statusOnTheWayToLaundry',
  [OrderStatus.InLaundry]: 'statusInLaundry',
  [OrderStatus.ReadyForDelivery]: 'statusReadyForDelivery',
  [OrderStatus.Delivered]: 'statusDelivered',
}

const formatDate = (value: string, isRtl: boolean) =>
  format(new Date(value), 'dd MMM yyyy', {
    locale: isRtl ? arSA : enUS,
  })

export const createRecentOrdersColumns = (
  labels: RecentOrdersColumnLabels,
  options: {
    isRtl: boolean
    onOrderClick?: (order: RecentOrder) => void
    onCustomerClick?: (order: RecentOrder) => void
    onBranchClick?: (order: RecentOrder) => void
    onBagsClick?: (order: RecentOrder) => void
    onAssignDriverClick?: (order: RecentOrder) => void
    onDriverClick?: (order: RecentOrder) => void
  },
): ColumnDef<RecentOrder>[] => [
  {
    accessorKey: 'orderNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.orderId} />
    ),
    cell: ({ row }) => (
      <DataTableCellLink onClick={() => options.onOrderClick?.(row.original)}>
        {row.getValue<string>('orderNumber')}
      </DataTableCellLink>
    ),
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.customer} />
    ),
    cell: ({ row }) => (
      <DataTableCellLink onClick={() => options.onCustomerClick?.(row.original)}>
        {row.getValue<string>('customerName')}
      </DataTableCellLink>
    ),
  },
  {
    accessorKey: 'branchName',
    enableSorting: false,
    header: () => (
      <span className="text-xs font-medium text-muted-foreground">{labels.branch}</span>
    ),
    cell: ({ row }) => (
      <DataTableCellLink onClick={() => options.onBranchClick?.(row.original)}>
        {row.getValue<string>('branchName')}
      </DataTableCellLink>
    ),
  },
  {
    accessorKey: 'pickupAt',
    sortingFn: (rowA, rowB) =>
      new Date(rowA.original.pickupAt).getTime() -
      new Date(rowB.original.pickupAt).getTime(),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.pickup} />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.pickupAt, options.isRtl)}
      </span>
    ),
  },
  {
    accessorKey: 'expectedDeliveryAt',
    sortingFn: (rowA, rowB) =>
      new Date(rowA.original.expectedDeliveryAt).getTime() -
      new Date(rowB.original.expectedDeliveryAt).getTime(),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.expectedDelivery} />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.expectedDeliveryAt, options.isRtl)}
      </span>
    ),
  },
  {
    id: 'bags',
    accessorFn: (row) => row.bags.length,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.bags} />
    ),
    cell: ({ row }) => (
      <BagsCell
        bags={row.original.bags}
        onClick={() => options.onBagsClick?.(row.original)}
      />
    ),
  },
  {
    id: 'driver',
    accessorFn: (row) => row.driver?.fullName ?? '',
    enableSorting: false,
    header: () => (
      <span className="text-xs font-medium text-muted-foreground">{labels.driver}</span>
    ),
    cell: ({ row }) => (
      <DriverCell
        driver={row.original.driver}
        unassignedLabel={labels.unassigned}
        onAssignClick={() => options.onAssignDriverClick?.(row.original)}
        onDriverClick={() => options.onDriverClick?.(row.original)}
      />
    ),
  },
  {
    accessorKey: 'status',
    enableSorting: false,
    header: () => (
      <span className="text-xs font-medium text-muted-foreground">{labels.status}</span>
    ),
    cell: ({ row }) => {
      const status = row.original.status
      const labelKey = statusLabelKey[status]

      return <OrderStatusBadge status={status} label={labels[labelKey]} />
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => {
      const order = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => options.onOrderClick?.(order)}>
              <Eye />
              {labels.viewOrder}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => options.onCustomerClick?.(order)}>
              <UserRound />
              {labels.viewCustomer}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.orderNumber)}
            >
              <Copy />
              {labels.copyOrderId}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
