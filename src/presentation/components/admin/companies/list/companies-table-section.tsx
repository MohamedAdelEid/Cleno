import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import type { PaginationState, RowSelectionState } from '@tanstack/react-table'
import { CircleCheck, CircleOff, Trash2, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { ManagedCompany } from '@/domain/entities'
import { companiesApi } from '@/infrastructure/api/companies.api'
import { notify } from '@/infrastructure/libs/toast/toast'
import {
  CompanyActiveFilter,
  CompanyStatusFilter,
  type CompanyActiveFilterValue,
} from '@/presentation/components/admin/companies/shared'
import {
  CompanyActiveStateDialog,
  CompanyApproveDialog,
  CompanyRejectDialog,
} from '@/presentation/components/admin/companies/shared/company-action-dialogs'
import {
  getBulkActivateIds,
  getBulkApproveIds,
  getBulkDeactivateIds,
  getBulkRejectIds,
} from '@/presentation/components/admin/companies/shared/company-actions.utils'
import type { CompanyAccountStatus } from '@/domain/enums'
import {
  DataTable,
  DataTableBulkActions,
  DataTablePagination,
  DataTablePanel,
  DataTableToolbar,
} from '@/presentation/components/dashboard/data-table'
import { ConfirmDialog } from '@/presentation/components/feedback/confirm-dialog'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useDirection } from '@/presentation/hooks/use-direction'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { buildCompanyEditPath } from '@/presentation/routes/company.routes'
import { createCompaniesColumns } from './companies-columns'

interface CompaniesTableSectionProps {
  companies: ManagedCompany[]
  totalRows: number
  isLoading?: boolean
  onRefetch: () => Promise<void>
  search: string
  onSearchChange: (value: string) => void
  statusFilter: CompanyAccountStatus | 'all'
  onStatusFilterChange: (value: CompanyAccountStatus | 'all') => void
  activeFilter: CompanyActiveFilterValue
  onActiveFilterChange: (value: CompanyActiveFilterValue) => void
  paginationState: PaginationState
  onPaginationStateChange: Dispatch<SetStateAction<PaginationState>>
}

type PendingActionType = 'approve' | 'reject' | 'activate' | 'deactivate'

type PendingAction =
  | { type: PendingActionType; ids: string[]; companyName?: string }
  | null

const TableSkeleton = () => (
  <div className="space-y-2 px-1 py-2">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 rounded-lg px-3 py-3">
        <Skeleton className="size-11 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="hidden h-4 w-24 sm:block" />
        <Skeleton className="hidden h-4 w-16 md:block" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    ))}
  </div>
)

export const CompaniesTableSection = ({
  companies,
  totalRows,
  isLoading = false,
  onRefetch,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  activeFilter,
  onActiveFilterChange,
  paginationState,
  onPaginationStateChange,
}: CompaniesTableSectionProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation('companies')
  const { t: tCommon } = useTranslation('common')
  const { isRtl } = useDirection()

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [deleteTarget, setDeleteTarget] = useState<'bulk' | ManagedCompany | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [isMutating, setIsMutating] = useState(false)

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedCount = selectedIds.length

  const bulkApproveIds = useMemo(
    () => getBulkApproveIds(companies, selectedIds),
    [companies, selectedIds],
  )
  const bulkRejectIds = useMemo(
    () => getBulkRejectIds(companies, selectedIds),
    [companies, selectedIds],
  )
  const bulkActivateIds = useMemo(
    () => getBulkActivateIds(companies, selectedIds),
    [companies, selectedIds],
  )
  const bulkDeactivateIds = useMemo(
    () => getBulkDeactivateIds(companies, selectedIds),
    [companies, selectedIds],
  )

  const clearSelection = useCallback(() => setRowSelection({}), [])

  const closePendingAction = () => setPendingAction(null)

  const handleApprove = async (ids: string[]) => {
    if (!ids.length) return

    setIsMutating(true)
    const result = await companiesApi.approve(ids)
    setIsMutating(false)

    if (!result.hasValue) {
      notify.error({
        title: t('approve'),
        description: result.error?.message ?? t('toastActionFailed'),
      })
      return
    }

    notify.success({
      title: t('toastApproved'),
      description: t('toastApprovedDesc', { count: ids.length }),
    })
    closePendingAction()
    clearSelection()
    await onRefetch()
  }

  const handleReject = async (ids: string[], reason: string) => {
    if (!ids.length) return

    setIsMutating(true)
    const result = await companiesApi.reject(ids, reason)
    setIsMutating(false)

    if (!result.hasValue) {
      notify.error({
        title: t('reject'),
        description: result.error?.message ?? t('toastActionFailed'),
      })
      return
    }

    notify.success({
      title: t('toastRejected'),
      description: t('toastRejectedDesc', { count: ids.length }),
    })
    closePendingAction()
    clearSelection()
    await onRefetch()
  }

  const handleToggleActive = async (ids: string[]) => {
    if (!ids.length) return

    setIsMutating(true)
    const result = await companiesApi.toggleActive(ids)
    setIsMutating(false)

    if (!result.hasValue) {
      notify.error({
        title: t('toastActionFailed'),
        description: result.error?.message ?? t('toastActionFailed'),
      })
      return
    }

    notify.success({
      title: t('toastActiveUpdated'),
      description: t('toastActiveUpdatedDesc', { count: ids.length }),
    })
    closePendingAction()
    clearSelection()
    await onRefetch()
  }

  const handleDelete = async (companyIds: string[]) => {
    if (!companyIds.length) return

    setIsMutating(true)
    const result = await companiesApi.delete(companyIds)
    setIsMutating(false)

    if (!result.hasValue) {
      notify.error({
        title: t('delete'),
        description: result.error?.message ?? t('toastActionFailed'),
      })
      return
    }

    if (companyIds.length > 1) {
      notify.success({
        title: t('toastDeleted'),
        description: t('toastDeletedDesc', { count: companyIds.length }),
      })
    } else {
      const deletedCompany = companies.find((company) => company.id === companyIds[0])
      notify.success({
        title: t('toastCompanyDeleted'),
        description: deletedCompany
          ? t('toastCompanyDeletedDesc', { name: deletedCompany.name })
          : t('toastDeletedDesc', { count: 1 }),
      })
    }

    setDeleteTarget(null)
    clearSelection()
    await onRefetch()
  }

  const handleEditCompany = useCallback(
    (company: ManagedCompany) => {
      navigate(buildCompanyEditPath(company.id))
    },
    [navigate],
  )

  const openSingleAction = useCallback((type: PendingActionType, company: ManagedCompany) => {
    setPendingAction({ type, ids: [company.id], companyName: company.name })
  }, [])

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
          view: t('view'),
          edit: t('edit'),
          delete: t('delete'),
          approve: t('approve'),
          reject: t('reject'),
          activate: t('makeActive'),
          deactivate: t('makeInactive'),
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
          onApproveClick: (company) => openSingleAction('approve', company),
          onRejectClick: (company) => openSingleAction('reject', company),
          onActivateClick: (company) => openSingleAction('activate', company),
          onDeactivateClick: (company) => openSingleAction('deactivate', company),
        },
      ),
    [handleEditCompany, isRtl, openSingleAction, t],
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

  const pendingCount = pendingAction?.ids.length ?? 0
  const pendingCompanyName = pendingAction?.companyName

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
              onSearchChange={onSearchChange}
              searchPlaceholder={t('searchPlaceholder')}
              endContent={
                <>
                  <DataTableBulkActions
                    visible={selectedCount > 0}
                    selectedCount={selectedCount}
                    selectedLabel={t('selected')}
                  >
                    {bulkApproveIds.length > 0 ? (
                      <Button
                        variant="outline"
                        size="xs"
                        disabled={isMutating}
                        onClick={() =>
                          setPendingAction({ type: 'approve', ids: bulkApproveIds })
                        }
                      >
                        <CircleCheck />
                        {t('approve')}
                      </Button>
                    ) : null}

                    {bulkRejectIds.length > 0 ? (
                      <Button
                        variant="outline"
                        size="xs"
                        disabled={isMutating}
                        onClick={() => setPendingAction({ type: 'reject', ids: bulkRejectIds })}
                      >
                        <XCircle />
                        {t('reject')}
                      </Button>
                    ) : null}

                    {bulkActivateIds.length > 0 ? (
                      <Button
                        variant="outline"
                        size="xs"
                        disabled={isMutating}
                        onClick={() =>
                          setPendingAction({ type: 'activate', ids: bulkActivateIds })
                        }
                      >
                        <CircleCheck />
                        {t('makeActive')}
                      </Button>
                    ) : null}

                    {bulkDeactivateIds.length > 0 ? (
                      <Button
                        variant="outline"
                        size="xs"
                        disabled={isMutating}
                        onClick={() =>
                          setPendingAction({ type: 'deactivate', ids: bulkDeactivateIds })
                        }
                      >
                        <CircleOff />
                        {t('makeInactive')}
                      </Button>
                    ) : null}

                    <Button
                      variant="destructive"
                      size="xs"
                      disabled={isMutating}
                      onClick={() => setDeleteTarget('bulk')}
                    >
                      <Trash2 />
                      {t('deleteSelected')}
                    </Button>
                  </DataTableBulkActions>

                  <CompanyStatusFilter
                    value={statusFilter}
                    onChange={onStatusFilterChange}
                    labels={{
                      filterStatus: t('filterStatus'),
                      filterAll: t('filterAll'),
                      statusPendingEmailVerification: t('statusPendingEmailVerification'),
                      statusPendingAdminApproval: t('statusPendingAdminApproval'),
                      statusApproved: t('statusApproved'),
                      statusRejected: t('statusRejected'),
                    }}
                  />

                  <CompanyActiveFilter
                    value={activeFilter}
                    onChange={onActiveFilterChange}
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
            totalRows={totalRows}
            onPageChange={(pageIndex) =>
              onPaginationStateChange((current) => ({ ...current, pageIndex }))
            }
            onPageSizeChange={(pageSize) =>
              onPaginationStateChange({ pageIndex: 0, pageSize })
            }
            labels={paginationLabels}
          />
        }
      >
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={companies}
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
            className="py-1"
          />
        )}
      </DataTablePanel>

      <CompanyApproveDialog
        open={pendingAction?.type === 'approve'}
        onOpenChange={(open) => !open && closePendingAction()}
        title={pendingCompanyName ? t('approveTitle') : t('approveBulkTitle')}
        description={
          pendingCompanyName
            ? t('approveDescription', { name: pendingCompanyName })
            : t('approveBulkDescription', { count: pendingCount })
        }
        confirmLabel={t('approve')}
        cancelLabel={t('cancel')}
        loading={isMutating}
        onConfirm={() => {
          if (pendingAction?.type === 'approve') {
            void handleApprove(pendingAction.ids)
          }
        }}
      />

      <CompanyRejectDialog
        open={pendingAction?.type === 'reject'}
        onOpenChange={(open) => !open && closePendingAction()}
        title={pendingCompanyName ? t('rejectTitle') : t('rejectBulkTitle')}
        description={
          pendingCompanyName
            ? t('rejectDescription', { name: pendingCompanyName })
            : t('rejectBulkDescription', { count: pendingCount })
        }
        reasonLabel={t('rejectReasonLabel')}
        reasonPlaceholder={t('rejectReasonPlaceholder')}
        reasonRequired={t('rejectReasonRequired')}
        confirmLabel={t('reject')}
        cancelLabel={t('cancel')}
        loading={isMutating}
        onConfirm={(reason) => {
          if (pendingAction?.type === 'reject') {
            void handleReject(pendingAction.ids, reason)
          }
        }}
      />

      <CompanyActiveStateDialog
        open={pendingAction?.type === 'activate'}
        onOpenChange={(open) => !open && closePendingAction()}
        title={pendingCompanyName ? t('activateTitle') : t('activateBulkTitle')}
        description={
          pendingCompanyName
            ? t('activateDescription', { name: pendingCompanyName })
            : t('activateBulkDescription', { count: pendingCount })
        }
        confirmLabel={t('makeActive')}
        cancelLabel={t('cancel')}
        mode="activate"
        loading={isMutating}
        onConfirm={() => {
          if (pendingAction?.type === 'activate') {
            void handleToggleActive(pendingAction.ids)
          }
        }}
      />

      <CompanyActiveStateDialog
        open={pendingAction?.type === 'deactivate'}
        onOpenChange={(open) => !open && closePendingAction()}
        title={pendingCompanyName ? t('deactivateTitle') : t('deactivateBulkTitle')}
        description={
          pendingCompanyName
            ? t('deactivateDescription', { name: pendingCompanyName })
            : t('deactivateBulkDescription', { count: pendingCount })
        }
        confirmLabel={t('makeInactive')}
        cancelLabel={t('cancel')}
        mode="deactivate"
        loading={isMutating}
        onConfirm={() => {
          if (pendingAction?.type === 'deactivate') {
            void handleToggleActive(pendingAction.ids)
          }
        }}
      />

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
        loading={isMutating}
        onConfirm={() => {
          if (deleteTarget === 'bulk') {
            void handleDelete(selectedIds)
            return
          }
          if (deleteTarget) {
            void handleDelete([deleteTarget.id])
          }
        }}
      />
    </>
  )
}
