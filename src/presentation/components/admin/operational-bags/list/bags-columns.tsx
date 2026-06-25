import type { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { OperationalBag } from '@/domain/entities'
import {
  OperationalBagStatus,
  OperationalBagSystemStatus,
  type OperationalBagStatus as OperationalBagStatusType,
  type OperationalBagSystemStatus as OperationalBagSystemStatusType,
} from '@/domain/enums'
import { DataTableColumnHeader } from '@/presentation/components/dashboard/data-table'
import { BagOperationalStatusBadge, BagSystemStatusBadge } from '@/presentation/components/admin/operational-bags/shared'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { ROUTES } from '@/presentation/routes/routes.constants'

export interface BagsColumnLabels {
  bagId: string
  currentOrder: string
  customer: string
  systemStatus: string
  operationalStatus: string
  lastUpdated: string
  systemActive: string
  systemInactive: string
  opReady: string
  opProcessing: string
  opOnTheWay: string
  opAssigned: string
  opInTransit: string
  opMissing: string
  view: string
  edit: string
  delete: string
  noOrder: string
  noCustomer: string
}

const systemLabelKey: Record<
  OperationalBagSystemStatusType,
  keyof Pick<BagsColumnLabels, 'systemActive' | 'systemInactive'>
> = {
  [OperationalBagSystemStatus.Active]: 'systemActive',
  [OperationalBagSystemStatus.Inactive]: 'systemInactive',
}

const operationalLabelKey: Record<
  OperationalBagStatusType,
  keyof Pick<
    BagsColumnLabels,
    'opReady' | 'opProcessing' | 'opOnTheWay' | 'opAssigned' | 'opInTransit' | 'opMissing'
  >
> = {
  [OperationalBagStatus.Ready]: 'opReady',
  [OperationalBagStatus.Processing]: 'opProcessing',
  [OperationalBagStatus.OnTheWay]: 'opOnTheWay',
  [OperationalBagStatus.Assigned]: 'opAssigned',
  [OperationalBagStatus.InTransit]: 'opInTransit',
  [OperationalBagStatus.Missing]: 'opMissing',
}

const formatRelativeTime = (iso: string) => {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return iso
  }
}

export const createBagsColumns = (
  labels: BagsColumnLabels,
  options: {
    onViewClick: (bag: OperationalBag) => void
    onEditClick: (bag: OperationalBag) => void
    onDeleteClick: (bag: OperationalBag) => void
  },
): ColumnDef<OperationalBag>[] => [
  {
    accessorKey: 'bagId',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.bagId} />,
    cell: ({ row }) => (
      <button
        type="button"
        onClick={() => options.onViewClick(row.original)}
        className="font-mono text-sm font-semibold text-primary hover:underline"
      >
        {row.original.bagId}
      </button>
    ),
  },
  {
    id: 'currentOrder',
    accessorFn: (row) => row.currentOrderNumber ?? '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.currentOrder} />
    ),
    cell: ({ row }) => {
      const orderNumber = row.original.currentOrderNumber
      if (!orderNumber) {
        return <span className="text-sm text-muted-foreground/50">{labels.noOrder}</span>
      }

      return (
        <Link
          to={ROUTES.ORDERS.INDEX}
          className="text-sm font-medium text-primary hover:underline"
        >
          {orderNumber}
        </Link>
      )
    },
  },
  {
    id: 'customer',
    accessorFn: (row) => row.customerName ?? '',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.customer} />,
    cell: ({ row }) => {
      const { customerName, customerSlug } = row.original
      if (!customerName) {
        return <span className="text-sm text-muted-foreground/50">{labels.noCustomer}</span>
      }

      if (customerSlug) {
        return (
          <Link
            to={ROUTES.COMPANIES.DETAILS.replace(':companySlug', customerSlug)}
            className="text-sm font-medium text-foreground hover:text-primary hover:underline"
          >
            {customerName}
          </Link>
        )
      }

      return <span className="text-sm text-foreground">{customerName}</span>
    },
  },
  {
    id: 'systemStatus',
    accessorFn: (row) => row.systemStatus,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.systemStatus} />
    ),
    cell: ({ row }) => (
      <BagSystemStatusBadge
        status={row.original.systemStatus}
        label={labels[systemLabelKey[row.original.systemStatus]]}
      />
    ),
  },
  {
    id: 'operationalStatus',
    accessorFn: (row) => row.operationalStatus,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.operationalStatus} />
    ),
    cell: ({ row }) => (
      <BagOperationalStatusBadge
        status={row.original.operationalStatus}
        label={labels[operationalLabelKey[row.original.operationalStatus]]}
      />
    ),
  },
  {
    id: 'lastUpdated',
    accessorFn: (row) => row.updatedAt,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.lastUpdated} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {formatRelativeTime(row.original.updatedAt)}
      </span>
    ),
  },
  {
    id: 'actions',
    enableSorting: false,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => options.onViewClick(row.original)}>
              <Eye className="size-4" />
              {labels.view}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => options.onEditClick(row.original)}>
              <Pencil className="size-4" />
              {labels.edit}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => options.onDeleteClick(row.original)}
            >
              <Trash2 className="size-4" />
              {labels.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]
