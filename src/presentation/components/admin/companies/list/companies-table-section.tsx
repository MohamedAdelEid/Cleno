import type { Dispatch, SetStateAction } from 'react'
import type { PaginationState, RowSelectionState } from '@tanstack/react-table'
import { ChevronDown, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { ManagedCompany } from '@/domain/entities'
import { CompanyAccountStatus, COMPANY_CHANGEABLE_STATUSES } from '@/domain/enums'
import { notify } from '@/infrastructure/libs/toast/toast'
import {
  CompanyActiveFilter,
  CompanyStatusFilter,
  type CompanyActiveFilterValue,
} from '@/presentation/components/admin/companies/shared'
import {
  DataTable,
  DataTableBulkActions,
  DataTablePagination,
  DataTablePanel,
  DataTableToolbar,
} from '@/presentation/components/dashboard/data-table'
import { ConfirmDialog } from '@/presentation/components/feedback/confirm-dialog'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { buildCompanyEditPath } from '@/presentation/routes/company.routes'
import { createCompaniesColumns } from './companies-columns'

interface CompaniesTableSectionProps {
  companies: ManagedCompany[]
  setCompanies: Dispatch<SetStateAction<ManagedCompany[]>>
}

const changeableStatusLabelKey = {
  [CompanyAccountStatus.PendingAdminApproval]: 'statusPendingAdminApproval',
  [CompanyAccountStatus.Approved]: 'statusApproved',
  [CompanyAccountStatus.Rejected]: 'statusRejected',
  [CompanyAccountStatus.Suspended]: 'statusSuspended',
} as const

export const CompaniesTableSection = ({ companies, setCompanies }: CompaniesTableSectionProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation('companies')
  const { t: tCommon } = useTranslation('common')
  const { isRtl } = useDirection()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CompanyAccountStatus | 'all'>('all')
  const [activeFilter, setActiveFilter] = useState<CompanyActiveFilterValue>('all')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })
  const [deleteTarget, setDeleteTarget] = useState<'bulk' | ManagedCompany | null>(null)

  const filteredCompanies = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    return companies.filter((company) => {
      const matchesStatus = statusFilter === 'all' || company.status === statusFilter
      const matchesActive =
        activeFilter === 'all' ||
        (activeFilter === 'active' ? company.isActive : !company.isActive)
      const matchesSearch =
        !normalized ||
        company.name.toLowerCase().includes(normalized) ||
        company.email.toLowerCase().includes(normalized) ||
        company.phone.toLowerCase().includes(normalized) ||
        company.type.toLowerCase().includes(normalized) ||
        company.responsible.fullName.toLowerCase().includes(normalized) ||
        company.responsible.email.toLowerCase().includes(normalized)

      return matchesStatus && matchesActive && matchesSearch
    })
  }, [companies, search, statusFilter, activeFilter])

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedCount = selectedIds.length

  const clearSelection = useCallback(() => setRowSelection({}), [])

  const handleBulkStatusChange = (status: CompanyAccountStatus) => {
    setCompanies((current) =>
      current.map((company) =>
        selectedIds.includes(company.id) ? { ...company, status } : company,
      ),
    )
    notify.success({
      title: t('toastStatusUpdated'),
      description: t('toastStatusUpdatedDesc', { count: selectedCount }),
    })
    clearSelection()
  }

  const handleBulkActiveChange = (isActive: boolean) => {
    setCompanies((current) =>
      current.map((company) =>
        selectedIds.includes(company.id) ? { ...company, isActive } : company,
      ),
    )
    notify.success({
      title: t('toastActiveUpdated'),
      description: t('toastActiveUpdatedDesc', { count: selectedCount }),
    })
    clearSelection()
  }

  const handleBulkDelete = () => {
    setCompanies((current) => current.filter((company) => !selectedIds.includes(company.id)))
    notify.success({
      title: t('toastDeleted'),
      description: t('toastDeletedDesc', { count: selectedCount }),
    })
    setDeleteTarget(null)
    clearSelection()
  }

  const handleSingleDelete = (company: ManagedCompany) => {
    setCompanies((current) => current.filter((item) => item.id !== company.id))
    notify.success({
      title: t('toastCompanyDeleted'),
      description: t('toastCompanyDeletedDesc', { name: company.name }),
    })
    setDeleteTarget(null)
  }

  const handleEditCompany = useCallback(
    (company: ManagedCompany) => {
      navigate(buildCompanyEditPath(company.id))
    },
    [navigate],
  )

  const columns = useMemo(
    () =>
      createCompaniesColumns(
        {
          company: t('colCompany'),
          responsible: t('colResponsible'),
          phone: t('colPhone'),
          branches: t('colBranches'),
          activeOrders: t('colActiveOrders'),
          completedOrders: t('colCompletedOrders'),
          pendingInvoices: t('colPendingInvoices'),
          outstandingBalance: t('colOutstandingBalance'),
          status: t('colStatus'),
          statusPendingEmailVerification: t('statusPendingEmailVerification'),
          statusPendingAdminApproval: t('statusPendingAdminApproval'),
          statusApproved: t('statusApproved'),
          statusRejected: t('statusRejected'),
          statusSuspended: t('statusSuspended'),
          view: t('view'),
          edit: t('edit'),
          delete: t('delete'),
        },
        {
          locale: isRtl ? 'ar-BH' : 'en-BH',
          onViewClick: () =>
            notify.info({
              title: t('view'),
              description: t('viewCompanyComingSoon'),
            }),
          onEditClick: handleEditCompany,
          onDeleteClick: (company) => setDeleteTarget(company),
        },
      ),
    [isRtl, t, handleEditCompany],
  )

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
    <>
      <DataTablePanel
        index={1}
        tableClassName="overflow-x-auto"
        toolbar={
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-medium text-foreground">{t('tableTitle')}</h2>
              <p className="text-xs text-muted-foreground">{t('tableDescription')}</p>
            </div>

            <DataTableToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder={t('searchPlaceholder')}
              endContent={
                <>
                  <DataTableBulkActions
                    visible={selectedCount > 0}
                    selectedCount={selectedCount}
                    selectedLabel={t('selected')}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="xs">
                          {t('changeStatus')}
                          <ChevronDown className="size-3.5 opacity-60" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {COMPANY_CHANGEABLE_STATUSES.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleBulkStatusChange(status)}
                          >
                            {t(changeableStatusLabelKey[status])}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="xs">
                          {t('toggleActive')}
                          <ChevronDown className="size-3.5 opacity-60" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleBulkActiveChange(true)}>
                          {t('statusActive')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkActiveChange(false)}>
                          {t('statusInactive')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => setDeleteTarget('bulk')}
                    >
                      <Trash2 />
                      {t('deleteSelected')}
                    </Button>
                  </DataTableBulkActions>

                  <CompanyStatusFilter
                    value={statusFilter}
                    onChange={setStatusFilter}
                    labels={{
                      filterStatus: t('filterStatus'),
                      filterAll: t('filterAll'),
                      statusPendingEmailVerification: t('statusPendingEmailVerification'),
                      statusPendingAdminApproval: t('statusPendingAdminApproval'),
                      statusApproved: t('statusApproved'),
                      statusRejected: t('statusRejected'),
                      statusSuspended: t('statusSuspended'),
                    }}
                  />

                  <CompanyActiveFilter
                    value={activeFilter}
                    onChange={setActiveFilter}
                    labels={{
                      filterActive: t('filterActive'),
                      filterAll: t('filterAllActive'),
                      active: t('statusActive'),
                      inactive: t('statusInactive'),
                    }}
                  />
                </>
              }
            />
          </div>
        }
        footer={
          <DataTablePagination
            pageIndex={paginationState.pageIndex}
            pageSize={paginationState.pageSize}
            totalRows={filteredCompanies.length}
            onPageChange={(pageIndex) =>
              setPaginationState((current) => ({ ...current, pageIndex }))
            }
            onPageSizeChange={(pageSize) => setPaginationState({ pageIndex: 0, pageSize })}
            labels={paginationLabels}
          />
        }
      >
        <DataTable
          columns={columns}
          data={filteredCompanies}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={(row) => row.id}
          getRowClassName={(row) =>
            !row.isActive
              ? 'bg-red-50/70 hover:bg-red-50/90 dark:bg-red-950/20 dark:hover:bg-red-950/30'
              : undefined
          }
          emptyMessage={t('empty')}
          animateRows
          enablePagination
          pagination={paginationState}
          onPaginationChange={setPaginationState}
          className="py-1"
        />
      </DataTablePanel>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget === 'bulk' ? t('deleteBulkTitle') : t('deleteTitle')}
        description={
          deleteTarget === 'bulk'
            ? t('deleteBulkDescription', { count: selectedCount })
            : t('deleteDescription', { name: (deleteTarget as ManagedCompany)?.name ?? '' })
        }
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        destructive
        onConfirm={() => {
          if (deleteTarget === 'bulk') {
            handleBulkDelete()
            return
          }
          if (deleteTarget) {
            handleSingleDelete(deleteTarget)
          }
        }}
      />
    </>
  )
}
