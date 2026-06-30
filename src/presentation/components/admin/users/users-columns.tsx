import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, CircleCheck, CircleOff, Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

import type { ManagedUser } from '@/domain/entities'
import { ManagedUserStatus } from '@/domain/enums'
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
import { getManagedUserInitials } from './users.data'
import { UserStatusBadge } from './user-status-badge'

export interface UsersColumnLabels {
  user: string
  phone: string
  role: string
  status: string
  activity: string
  createdAt: string
  noLastLogin: string
  noPhone: string
  statusActive: string
  statusInactive: string
  statusSuspended: string
  copyPhone: string
  copiedPhone: string
  makeActive: string
  makeInactive: string
  edit: string
  delete: string
  viewPhoto: string
}

const statusLabelKey: Record<ManagedUserStatus, keyof UsersColumnLabels> = {
  [ManagedUserStatus.Active]: 'statusActive',
  [ManagedUserStatus.Inactive]: 'statusInactive',
  [ManagedUserStatus.Suspended]: 'statusSuspended',
}

const formatDate = (value: string, isRtl: boolean) =>
  format(new Date(value), 'dd MMM yyyy', {
    locale: isRtl ? arSA : enUS,
  })

const PhoneCopy = ({ phone, labels }: { phone: string; labels: UsersColumnLabels }) => {
  const [copied, setCopied] = useState(false)
  const normalizedPhone = phone?.trim() ?? ''

  if (!normalizedPhone) {
    return <span className="text-sm text-muted-foreground">{labels.noPhone}</span>
  }

  const handleCopy = async () => {
    await navigator.clipboard?.writeText(normalizedPhone)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1300)
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-2 text-sm text-foreground">
      <span className="truncate font-medium tabular-nums">{normalizedPhone}</span>
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

const UserCell = ({
  user,
  onPhotoClick,
  viewPhotoLabel,
}: {
  user: ManagedUser
  onPhotoClick?: (user: ManagedUser) => void
  viewPhotoLabel: string
}) => {
  const hasPhoto = Boolean(user.avatarUrl)

  const avatar = (
    <Avatar size="lg" className="size-10 shrink-0 border border-border/70">
      {hasPhoto ? <AvatarImage src={user.avatarUrl!} alt={user.fullName} /> : null}
      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
        {getManagedUserInitials(user.fullName)}
      </AvatarFallback>
    </Avatar>
  )

  return (
    <div className="flex min-w-0 items-center gap-3">
      {hasPhoto ? (
        <button
          type="button"
          className="shrink-0 rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={viewPhotoLabel}
          title={viewPhotoLabel}
          onClick={(event) => {
            event.stopPropagation()
            onPhotoClick?.(user)
          }}
        >
          {avatar}
        </button>
      ) : (
        avatar
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{user.fullName}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
    </div>
  )
}

export const createUsersColumns = (
  labels: UsersColumnLabels,
  options: {
    isRtl: boolean
    onEditClick?: (user: ManagedUser) => void
    onToggleStatusClick?: (user: ManagedUser) => void
    onDeleteClick?: (user: ManagedUser) => void
    onPhotoClick?: (user: ManagedUser) => void
  },
): ColumnDef<ManagedUser>[] => [
  {
    accessorKey: 'fullName',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.user} />,
    cell: ({ row }) => (
      <UserCell
        user={row.original}
        onPhotoClick={options.onPhotoClick}
        viewPhotoLabel={labels.viewPhoto}
      />
    ),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.phone} />,
    cell: ({ row }) => <PhoneCopy phone={row.original.phone} labels={labels} />,
  },
  {
    id: 'role',
    accessorFn: (row) => row.role.name,
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.role} />,
    cell: ({ row }) => (
      <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 text-primary">
        {row.original.role.name}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.status} />,
    cell: ({ row }) => {
      const status = row.original.status
      return <UserStatusBadge status={status} label={labels[statusLabelKey[status]]} />
    },
  },
  {
    id: 'activity',
    accessorFn: (row) => row.lastLoginAt ?? row.createdAt,
    sortingFn: (rowA, rowB) => {
      const first = rowA.original.lastLoginAt ?? rowA.original.createdAt
      const second = rowB.original.lastLoginAt ?? rowB.original.createdAt
      return new Date(first).getTime() - new Date(second).getTime()
    },
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.activity} />,
    cell: ({ row }) => (
      <div className="min-w-28 space-y-1">
        <p className="text-sm text-foreground">
          {row.original.hasSignedIn === false || !row.original.lastLoginAt
            ? labels.noLastLogin
            : formatDate(row.original.lastLoginAt, options.isRtl)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    sortingFn: (rowA, rowB) =>
      new Date(rowA.original.createdAt).getTime() - new Date(rowB.original.createdAt).getTime(),
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.createdAt} />,
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
      const user = row.original
      const isActive = user.status === ManagedUserStatus.Active
      const StatusIcon = isActive ? CircleOff : CircleCheck

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => options.onEditClick?.(user)}>
              <Pencil />
              {labels.edit}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => options.onToggleStatusClick?.(user)}>
              <StatusIcon />
              {isActive ? labels.makeInactive : labels.makeActive}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => options.onDeleteClick?.(user)}>
              <Trash2 />
              {labels.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
