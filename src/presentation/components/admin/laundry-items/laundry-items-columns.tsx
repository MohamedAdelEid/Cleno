import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { CircleCheck, CircleOff, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import type { ManagedLaundryItem } from '@/domain/entities'
import { LaundryItemCategory } from '@/domain/enums'
import type { LaundryItemCategory as LaundryItemCategoryType } from '@/domain/enums'
import { DataTableColumnHeader } from '@/presentation/components/dashboard/data-table'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { formatLaundryItemPrice } from './laundry-items.data'
import { LaundryItemStatusBadge } from './laundry-item-status-badge'

export interface LaundryItemsColumnLabels {
  name: string
  category: string
  price: string
  status: string
  createdAt: string
  categoryWash: string
  categoryIron: string
  categoryWashAndIron: string
  statusActive: string
  statusInactive: string
  activate: string
  deactivate: string
  edit: string
  delete: string
}

const categoryLabelKey: Record<
  LaundryItemCategoryType,
  'categoryWash' | 'categoryIron' | 'categoryWashAndIron'
> = {
  [LaundryItemCategory.Wash]: 'categoryWash',
  [LaundryItemCategory.Iron]: 'categoryIron',
  [LaundryItemCategory.WashAndIron]: 'categoryWashAndIron',
}

const formatDate = (value: string, isRtl: boolean) =>
  format(new Date(value), 'dd MMM yyyy', {
    locale: isRtl ? arSA : enUS,
  })

export const createLaundryItemsColumns = (
  labels: LaundryItemsColumnLabels,
  options: {
    isRtl: boolean
    onEditClick?: (item: ManagedLaundryItem) => void
    onToggleActiveClick?: (item: ManagedLaundryItem) => void
    onDeleteClick?: (item: ManagedLaundryItem) => void
  },
): ColumnDef<ManagedLaundryItem>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.name} />,
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground">{row.original.name}</span>
    ),
  },
  {
    accessorKey: 'category',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.category} />,
    cell: ({ row }) => (
      <Badge variant="outline" className="w-fit">
        {labels[categoryLabelKey[row.original.category]]}
      </Badge>
    ),
  },
  {
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.price} />,
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums text-foreground">
        {formatLaundryItemPrice(row.original.price, options.isRtl ? 'ar-SA' : 'en')}
      </span>
    ),
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.status} />,
    cell: ({ row }) => (
      <LaundryItemStatusBadge
        isActive={row.original.isActive}
        activeLabel={labels.statusActive}
        inactiveLabel={labels.statusInactive}
      />
    ),
  },
  {
    accessorKey: 'createdAt',
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
      const item = row.original
      const StatusIcon = item.isActive ? CircleOff : CircleCheck

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => options.onEditClick?.(item)}>
              <Pencil />
              {labels.edit}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => options.onToggleActiveClick?.(item)}>
              <StatusIcon />
              {item.isActive ? labels.deactivate : labels.activate}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => options.onDeleteClick?.(item)}>
              <Trash2 />
              {labels.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
