import type { ColumnDef } from '@tanstack/react-table'
import {
  CircleCheck,
  CircleOff,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  XCircle,
} from 'lucide-react'

import type { ManagedCompany } from '@/domain/entities'
import { CompanyAccountStatus } from '@/domain/enums'
import { DataTableColumnHeader } from '@/presentation/components/dashboard/data-table'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import {
  canActivateCompany,
  canApproveCompany,
  canDeactivateCompany,
  canRejectCompany,
} from '@/presentation/components/admin/companies/shared/company-actions.utils'
import { CompanyStatusBadge } from '@/presentation/components/admin/companies/shared'
import { CompanyCell } from './company-cell'

export interface CompaniesColumnLabels {
  company: string
  responsible: string
  phone: string
  branches: string
  activeOrders: string
  completedOrders: string
  pendingInvoices: string
  outstandingBalance: string
  status: string
  statusPendingEmailVerification: string
  statusPendingAdminApproval: string
  statusApproved: string
  statusRejected: string
  view: string
  edit: string
  delete: string
  approve: string
  reject: string
  activate: string
  deactivate: string
}

const statusLabelKey: Record<CompanyAccountStatus, keyof CompaniesColumnLabels> = {
  [CompanyAccountStatus.PendingEmailVerification]: 'statusPendingEmailVerification',
  [CompanyAccountStatus.PendingAdminApproval]: 'statusPendingAdminApproval',
  [CompanyAccountStatus.Approved]: 'statusApproved',
  [CompanyAccountStatus.Rejected]: 'statusRejected',
}

const formatCurrency = (amount: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BHD',
    maximumFractionDigits: 3,
  }).format(amount)

export const createCompaniesColumns = (
  labels: CompaniesColumnLabels,
  options: {
    locale: string
    onViewClick?: (company: ManagedCompany) => void
    onEditClick?: (company: ManagedCompany) => void
    onDeleteClick?: (company: ManagedCompany) => void
    onApproveClick?: (company: ManagedCompany) => void
    onRejectClick?: (company: ManagedCompany) => void
    onActivateClick?: (company: ManagedCompany) => void
    onDeactivateClick?: (company: ManagedCompany) => void
  },
): ColumnDef<ManagedCompany>[] => [
  {
    id: 'company',
    accessorFn: (row) => row.name,
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.company} />,
    cell: ({ row }) => <CompanyCell company={row.original} />,
  },
  {
    id: 'responsible',
    accessorFn: (row) => row.responsible.fullName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.responsible} />
    ),
    cell: ({ row }) => (
      <div className="min-w-[140px]">
        <p className="text-sm font-medium text-foreground">{row.original.responsible.fullName}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.responsible.email}</p>
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.phone} />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {row.getValue<string>('phone')}
      </span>
    ),
  },
  {
    accessorKey: 'branchesCount',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.branches} />,
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-foreground">{row.original.branchesCount}</span>
    ),
  },
  {
    accessorKey: 'activeOrders',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.activeOrders} />
    ),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-foreground">{row.original.activeOrders}</span>
    ),
  },
  {
    accessorKey: 'completedOrders',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.completedOrders} />
    ),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-muted-foreground">
        {row.original.completedOrders}
      </span>
    ),
  },
  {
    accessorKey: 'pendingInvoices',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.pendingInvoices} />
    ),
    cell: ({ row }) => {
      const count = row.original.pendingInvoices
      return (
        <span
          className={
            count > 0
              ? 'text-sm tabular-nums font-medium text-foreground'
              : 'text-sm tabular-nums text-muted-foreground'
          }
        >
          {count}
        </span>
      )
    },
  },
  {
    accessorKey: 'outstandingBalance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.outstandingBalance} />
    ),
    cell: ({ row }) => {
      const balance = row.original.outstandingBalance
      return (
        <span
          className={
            balance > 0
              ? 'whitespace-nowrap text-sm tabular-nums font-medium text-foreground'
              : 'whitespace-nowrap text-sm tabular-nums text-muted-foreground'
          }
        >
          {formatCurrency(balance, options.locale)}
        </span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title={labels.status} />,
    cell: ({ row }) => {
      const status = row.original.status
      return <CompanyStatusBadge status={status} label={labels[statusLabelKey[status]]} />
    },
  },
  {
    id: 'actions',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const company = row.original
      const showApprove = canApproveCompany(company)
      const showReject = canRejectCompany(company)
      const showActivate = canActivateCompany(company)
      const showDeactivate = canDeactivateCompany(company)
      const showStatusActions = showApprove || showReject || showActivate || showDeactivate

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => options.onViewClick?.(company)}>
              <Eye />
              {labels.view}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => options.onEditClick?.(company)}>
              <Pencil />
              {labels.edit}
            </DropdownMenuItem>

            {showStatusActions ? <DropdownMenuSeparator /> : null}

            {showApprove ? (
              <DropdownMenuItem onClick={() => options.onApproveClick?.(company)}>
                <CircleCheck />
                {labels.approve}
              </DropdownMenuItem>
            ) : null}

            {showReject ? (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => options.onRejectClick?.(company)}
              >
                <XCircle />
                {labels.reject}
              </DropdownMenuItem>
            ) : null}

            {showActivate ? (
              <DropdownMenuItem onClick={() => options.onActivateClick?.(company)}>
                <CircleCheck />
                {labels.activate}
              </DropdownMenuItem>
            ) : null}

            {showDeactivate ? (
              <DropdownMenuItem onClick={() => options.onDeactivateClick?.(company)}>
                <CircleOff />
                {labels.deactivate}
              </DropdownMenuItem>
            ) : null}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => options.onDeleteClick?.(company)}
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
