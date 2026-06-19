import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { MoreHorizontal, Pencil, Trash2, UserPlus } from 'lucide-react'

import type { ManagedRole } from '@/domain/entities'
import { RoleStatus } from '@/domain/enums'
import { DataTableColumnHeader } from '@/presentation/components/dashboard/data-table'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { RoleDescriptionCell } from './role-description-cell'
import { RolePermissionsCell } from './role-permissions-cell'
import { RoleStatusBadge } from './role-status-badge'
import { RoleUsersCell } from './role-users-cell'

export interface RolesColumnLabels {
  roleName: string
  description: string
  permissions: string
  users: string
  status: string
  createdAt: string
  permissionsCount: string
  usersMore: string
  statusActive: string
  statusInactive: string
  assignUser: string
  edit: string
  delete: string
}

const statusLabelKey: Record<RoleStatus, keyof RolesColumnLabels> = {
  [RoleStatus.Active]: 'statusActive',
  [RoleStatus.Inactive]: 'statusInactive',
}

const formatDate = (value: string, isRtl: boolean) =>
  format(new Date(value), 'dd MMM yyyy', {
    locale: isRtl ? arSA : enUS,
  })

export const createRolesColumns = (
  labels: RolesColumnLabels,
  options: {
    isRtl: boolean
    onPermissionsClick?: (role: ManagedRole) => void
    onUsersClick?: (role: ManagedRole) => void
    onAssignUserClick?: (role: ManagedRole) => void
    onEditClick?: (role: ManagedRole) => void
    onDeleteClick?: (role: ManagedRole) => void
  },
): ColumnDef<ManagedRole>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.roleName} />
    ),
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground">{row.getValue<string>('name')}</span>
    ),
  },
  {
    accessorKey: 'description',
    enableSorting: false,
    header: () => (
      <span className="text-xs font-medium text-muted-foreground">{labels.description}</span>
    ),
    cell: ({ row }) => <RoleDescriptionCell description={row.original.description} />,
  },
  {
    id: 'permissions',
    accessorFn: (row) => row.permissionsCount,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.permissions} />
    ),
    cell: ({ row }) => (
      <RolePermissionsCell
        count={row.original.permissionsCount}
        label={labels.permissionsCount}
        onClick={() => options.onPermissionsClick?.(row.original)}
      />
    ),
  },
  {
    id: 'users',
    accessorFn: (row) => row.usersCount,
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.users} />,
    cell: ({ row }) => (
      <RoleUsersCell
        users={row.original.users}
        totalCount={row.original.usersCount}
        remainingCount={row.original.remainingUsersCount}
        moreLabel={(count) => labels.usersMore.replace('{{count}}', String(count))}
        onMoreClick={() => options.onUsersClick?.(row.original)}
      />
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.status} />,
    cell: ({ row }) => {
      const status = row.original.status
      return <RoleStatusBadge status={status} label={labels[statusLabelKey[status]]} />
    },
  },
  {
    accessorKey: 'createdAt',
    sortingFn: (rowA, rowB) =>
      new Date(rowA.original.createdAt).getTime() - new Date(rowB.original.createdAt).getTime(),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.createdAt} />
    ),
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
      const role = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => options.onAssignUserClick?.(role)}>
              <UserPlus />
              {labels.assignUser}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => options.onEditClick?.(role)}>
              <Pencil />
              {labels.edit}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => options.onDeleteClick?.(role)}
            >
              <Trash2 />
              {labels.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
