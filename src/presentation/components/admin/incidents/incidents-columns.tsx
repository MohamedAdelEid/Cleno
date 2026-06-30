import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import type { ManagedIncident } from '@/domain/entities'
import { DataTableCellLink, DataTableColumnHeader } from '@/presentation/components/dashboard/data-table'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'

import { IncidentCompanyBranchCell } from './incident-company-branch-cell'
import { IncidentStatusBadge } from './incident-status-badge'

const formatDate = (value: string, isRtl: boolean) =>
  format(new Date(value), 'dd MMM yyyy', {
    locale: isRtl ? arSA : enUS,
  })

export const createIncidentsColumns = (options: {
  isRtl: boolean
  labels: {
    incident: string
    order: string
    customer: string
    stage: string
    status: string
    reporter: string
    replies: string
    createdAt: string
    view: string
    edit: string
    delete: string
  }
  onOrderClick?: (incident: ManagedIncident) => void
  onCompanyClick?: (incident: ManagedIncident) => void
  onBranchClick?: (incident: ManagedIncident) => void
  onViewClick?: (incident: ManagedIncident) => void
  onEditClick?: (incident: ManagedIncident) => void
  onDeleteClick?: (incident: ManagedIncident) => void
}): ColumnDef<ManagedIncident>[] => [
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title={options.labels.incident} />,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{row.original.title}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.typeLabel}</p>
      </div>
    ),
  },
  {
    accessorKey: 'order.number',
    header: ({ column }) => <DataTableColumnHeader column={column} title={options.labels.order} />,
    cell: ({ row }) => (
      <DataTableCellLink
        className="font-mono text-sm"
        onClick={() => options.onOrderClick?.(row.original)}
      >
        {row.original.order.number}
      </DataTableCellLink>
    ),
  },
  {
    id: 'customer',
    accessorFn: (row) => `${row.company.name} ${row.branch.name}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title={options.labels.customer} />,
    cell: ({ row }) => (
      <IncidentCompanyBranchCell
        incident={row.original}
        onCompanyClick={options.onCompanyClick}
        onBranchClick={options.onBranchClick}
      />
    ),
  },
  {
    accessorKey: 'stageLabel',
    header: ({ column }) => <DataTableColumnHeader column={column} title={options.labels.stage} />,
    cell: ({ row }) => (
      <Badge variant="outline" className="font-medium">
        {row.original.stageLabel}
      </Badge>
    ),
  },
  {
    accessorKey: 'isOpen',
    header: ({ column }) => <DataTableColumnHeader column={column} title={options.labels.status} />,
    cell: ({ row }) => <IncidentStatusBadge isOpen={row.original.isOpen} />,
  },
  {
    accessorKey: 'replyCount',
    header: ({ column }) => <DataTableColumnHeader column={column} title={options.labels.replies} />,
    cell: ({ row }) => (
      <Badge variant="outline" className="w-fit">
        {row.original.replyCount}
      </Badge>
    ),
  },
  {
    accessorKey: 'reporterName',
    header: ({ column }) => <DataTableColumnHeader column={column} title={options.labels.reporter} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.reporterName}</span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title={options.labels.createdAt} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.createdAt, options.isRtl)}
      </span>
    ),
  },
  {
    id: 'actions',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const incident = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => options.onViewClick?.(incident)}>
              <Eye />
              {options.labels.view}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => options.onEditClick?.(incident)}>
              <Pencil />
              {options.labels.edit}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => options.onDeleteClick?.(incident)}>
              <Trash2 />
              {options.labels.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
