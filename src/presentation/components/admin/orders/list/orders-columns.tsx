import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import type { ManagedOrder } from '@/domain/entities'
import { OrderStatus } from '@/domain/enums'
import { OrderStatusBadge } from '@/presentation/components/admin/overview/recent-orders/order-status-badge'
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
import { OrderBagsCell } from './order-bags-cell'
import { OrderCustomerCell } from './order-customer-cell'
import { OrderDriverCell } from './order-driver-cell'

export interface OrdersColumnLabels {
  orderId: string
  customer: string
  pickup: string
  expectedDelivery: string
  bags: string
  driver: string
  status: string
  assignDriver: string
  changeDriver: string
  view: string
  edit: string
  delete: string
  statusOrderCreated: string
  statusPickedUp: string
  statusInLaundry: string
  statusReadyForDelivery: string
  statusDelivered: string
  statusCancelled: string
}

const statusLabelKey: Record<OrderStatus, keyof OrdersColumnLabels> = {
  [OrderStatus.OrderCreated]: 'statusOrderCreated',
  [OrderStatus.PickedUp]: 'statusPickedUp',
  [OrderStatus.InLaundry]: 'statusInLaundry',
  [OrderStatus.ReadyForDelivery]: 'statusReadyForDelivery',
  [OrderStatus.Delivered]: 'statusDelivered',
  [OrderStatus.Cancelled]: 'statusCancelled',
}

const formatDate = (value: string, isRtl: boolean) =>
  format(new Date(value), 'dd MMM yyyy', {
    locale: isRtl ? arSA : enUS,
  })

export const createOrdersColumns = (
  labels: OrdersColumnLabels,
  options: {
    isRtl: boolean
    onOrderClick?: (order: ManagedOrder) => void
    onCompanyClick?: (order: ManagedOrder) => void
    onBranchClick?: (order: ManagedOrder) => void
    onAssignDriverClick?: (order: ManagedOrder) => void
    onChangeDriverClick?: (order: ManagedOrder) => void
    onDriverClick?: (order: ManagedOrder) => void
    onViewClick?: (order: ManagedOrder) => void
    onEditClick?: (order: ManagedOrder) => void
    onDeleteClick?: (order: ManagedOrder) => void
  },
): ColumnDef<ManagedOrder>[] => [
  {
    accessorKey: 'orderNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.orderId} />,
    cell: ({ row }) => (
      <DataTableCellLink onClick={() => options.onOrderClick?.(row.original)}>
        {row.getValue<string>('orderNumber')}
      </DataTableCellLink>
    ),
  },
  {
    id: 'customer',
    accessorFn: (row) => row.company.name,
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.customer} />,
    cell: ({ row }) => (
      <OrderCustomerCell
        order={row.original}
        onCompanyClick={options.onCompanyClick}
        onBranchClick={options.onBranchClick}
      />
    ),
  },
  {
    accessorKey: 'pickupAt',
    sortingFn: (rowA, rowB) =>
      new Date(rowA.original.pickupAt).getTime() - new Date(rowB.original.pickupAt).getTime(),
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.pickup} />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
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
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {formatDate(row.original.expectedDeliveryAt, options.isRtl)}
      </span>
    ),
  },
  {
    id: 'bags',
    accessorFn: (row) => row.bagCount,
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.bags} />,
    cell: ({ row }) => (
      <OrderBagsCell count={row.original.bagCount} labels={row.original.bags} />
    ),
  },
  {
    id: 'driver',
    accessorFn: (row) => row.driver?.fullName ?? '',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.driver} />,
    cell: ({ row }) => (
      <OrderDriverCell
        driver={row.original.driver}
        assignLabel={labels.assignDriver}
        changeLabel={labels.changeDriver}
        onAssignClick={() => options.onAssignDriverClick?.(row.original)}
        onChangeClick={() => options.onChangeDriverClick?.(row.original)}
        onDriverClick={() => options.onDriverClick?.(row.original)}
      />
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.status} />,
    cell: ({ row }) => {
      const status = row.original.status
      return <OrderStatusBadge status={status} label={labels[statusLabelKey[status]]} />
    },
  },
  {
    id: 'actions',
    enableSorting: false,
    enableHiding: false,
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
            <DropdownMenuItem onClick={() => options.onViewClick?.(order)}>
              <Eye />
              {labels.view}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => options.onEditClick?.(order)}>
              <Pencil />
              {labels.edit}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => options.onDeleteClick?.(order)}>
              <Trash2 />
              {labels.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
