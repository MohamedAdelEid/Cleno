import type { PaginationState } from '@tanstack/react-table'
import { format } from 'date-fns'
import { FileText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import type { CompanyDetailsBranch, CompanyInvoice } from '@/domain/entities/company-details.entity'
import {
  DataTablePagination,
  DataTablePanel,
  DataTableToolbar,
} from '@/presentation/components/dashboard/data-table'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'

import { BranchFilter } from '../shared/branch-filter'
import { InvoiceStatusFilter, type InvoiceStatusFilterValue } from '../shared/invoice-status-filter'
import { InvoiceStatusBadge } from './shared-badges'

interface InvoicesTabProps {
  invoices: CompanyInvoice[]
  branches: CompanyDetailsBranch[]
  branchFilter: string
  search: string
  onBranchFilterChange: (slug: string) => void
  onSearchChange: (value: string) => void
}

const formatCurrency = (val: number) =>
  `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

const formatDate = (iso: string) => {
  try { return format(new Date(iso), 'MMM d, yyyy') } catch { return iso }
}

export const InvoicesTab = ({
  invoices,
  branches,
  branchFilter,
  search,
  onBranchFilterChange,
  onSearchChange,
}: InvoicesTabProps) => {
  const { t } = useTranslation('companies')
  const { t: tCommon } = useTranslation('common')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilterValue>('all')
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase()
    return invoices.filter((invoice) => {
      const matchesBranch = branchFilter === 'all' || invoice.branchSlug === branchFilter
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
      const matchesSearch =
        !q ||
        invoice.invoiceNumber.toLowerCase().includes(q) ||
        invoice.branchName.toLowerCase().includes(q)

      return matchesBranch && matchesStatus && matchesSearch
    })
  }, [invoices, branchFilter, statusFilter, search])

  useEffect(() => {
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }))
  }, [branchFilter, statusFilter, search])

  const paginatedInvoices = useMemo(() => {
    const start = paginationState.pageIndex * paginationState.pageSize
    return filteredInvoices.slice(start, start + paginationState.pageSize)
  }, [filteredInvoices, paginationState])

  const paginationLabels = useMemo(
    () => ({
      showing: tCommon('paginationShowing'),
      rowsPerPage: tCommon('paginationRowsPerPage'),
      previous: tCommon('paginationPrevious'),
      next: tCommon('paginationNext'),
    }),
    [tCommon],
  )

  return (
    <DataTablePanel
      toolbar={
        <DataTableToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder={t('detailsSearchPlaceholder')}
          endContent={
            <>
              <BranchFilter
                branches={branches}
                value={branchFilter}
                onChange={onBranchFilterChange}
              />
              <InvoiceStatusFilter value={statusFilter} onChange={setStatusFilter} />
            </>
          }
        />
      }
      footer={
        filteredInvoices.length > 0 ? (
          <DataTablePagination
            pageIndex={paginationState.pageIndex}
            pageSize={paginationState.pageSize}
            totalRows={filteredInvoices.length}
            onPageChange={(pageIndex) => setPaginationState((prev) => ({ ...prev, pageIndex }))}
            onPageSizeChange={(pageSize) => setPaginationState({ pageIndex: 0, pageSize })}
            labels={paginationLabels}
          />
        ) : undefined
      }
    >
      {filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FileText className="size-10 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-muted-foreground">{t('detailsNoInvoices')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-5 py-3 text-start text-xs font-medium text-muted-foreground">{t('detailsInvoiceNumber')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t('detailsBranchName')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t('detailsInvoiceDate')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t('detailsDueDate')}</th>
                <th className="px-4 py-3 text-end text-xs font-medium text-muted-foreground">{t('detailsAmount')}</th>
                <th className="px-5 py-3 text-start text-xs font-medium text-muted-foreground">{t('detailsInvoiceStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className={cn(
                    'border-b border-border/30 last:border-0 transition-colors hover:bg-muted/30',
                    invoice.status === 'overdue' && 'bg-red-50/30 dark:bg-red-950/10',
                  )}
                >
                  <td className="px-5 py-3">
                    <button type="button" className="text-sm font-medium text-primary hover:underline">
                      {invoice.invoiceNumber}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{invoice.branchName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(invoice.invoiceDate)}</td>
                  <td className={cn('px-4 py-3', invoice.status === 'overdue' ? 'font-medium text-red-600 dark:text-red-400' : 'text-muted-foreground')}>
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-end font-medium">{formatCurrency(invoice.amount)}</td>
                  <td className="px-5 py-3"><InvoiceStatusBadge status={invoice.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DataTablePanel>
  )
}
