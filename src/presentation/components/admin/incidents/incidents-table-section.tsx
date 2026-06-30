import type { Dispatch, SetStateAction } from 'react'
import type { PaginationState, RowSelectionState } from '@tanstack/react-table'
import { AlertTriangle, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { ManagedIncident, ManagedIncidentDetail } from '@/domain/entities'
import { IncidentStage, IncidentType, OrderStatus } from '@/domain/enums'
import { notify } from '@/infrastructure/libs/toast/toast'
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
import { ROUTES } from '@/presentation/routes/routes.constants'

import { IncidentDetailSheet } from './incident-detail-sheet'
import { IncidentFormDialog, type IncidentFormValues } from './incident-form-dialog'
import { createIncidentsColumns } from './incidents-columns'
import { IncidentsFilterDropdown } from './incidents-filter-dropdown'
import type {
  IncidentOpenFilterValue,
  IncidentOrderStatusFilterValue,
  IncidentStageFilterValue,
  IncidentTypeFilterValue,
} from './hooks/use-incident-management'

interface IncidentsTableSectionProps {
  incidents: ManagedIncident[]
  totalRows: number
  isLoading?: boolean
  hasActiveFilters: boolean
  keyword: string
  onKeywordChange: (value: string) => void
  typeFilter: IncidentTypeFilterValue
  onTypeFilterChange: (value: IncidentTypeFilterValue) => void
  stageFilter: IncidentStageFilterValue
  onStageFilterChange: (value: IncidentStageFilterValue) => void
  openFilter: IncidentOpenFilterValue
  onOpenFilterChange: (value: IncidentOpenFilterValue) => void
  orderStatusFilter: IncidentOrderStatusFilterValue
  onOrderStatusFilterChange: (value: IncidentOrderStatusFilterValue) => void
  onClearFilters: () => void
  paginationState: PaginationState
  onPaginationStateChange: Dispatch<SetStateAction<PaginationState>>
  onCreateIncident: (
    orderSlug: string,
    values: Omit<IncidentFormValues, 'orderSlug'>,
  ) => Promise<{ success: boolean; error?: string }>
  onUpdateIncident: (
    slug: string,
    values: Omit<IncidentFormValues, 'orderSlug'>,
  ) => Promise<{ success: boolean; error?: string }>
  onDeleteIncident: (slug: string) => Promise<{ success: boolean; error?: string }>
  onBulkDeleteIncidents: (slugs: string[]) => Promise<{ success: boolean; error?: string }>
  onFetchDetail: (slug: string) => Promise<ManagedIncidentDetail | null>
  onAddReply: (slug: string, message: string) => Promise<{ success: boolean; error?: string }>
  onUpdateReply: (
    slug: string,
    replyId: string,
    message: string,
  ) => Promise<{ success: boolean; error?: string }>
  onDeleteReply: (slug: string, replyId: string) => Promise<{ success: boolean; error?: string }>
  onRegisterOpenCreate?: (openCreate: () => void) => void
}

type DeleteTarget = ManagedIncident | 'bulk' | null

const TableSkeleton = () => (
  <div className="space-y-2 px-1 py-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 rounded-lg px-3 py-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    ))}
  </div>
)

export const IncidentsTableSection = ({
  incidents,
  totalRows,
  isLoading = false,
  hasActiveFilters,
  keyword,
  onKeywordChange,
  typeFilter,
  onTypeFilterChange,
  stageFilter,
  onStageFilterChange,
  openFilter,
  onOpenFilterChange,
  orderStatusFilter,
  onOrderStatusFilterChange,
  onClearFilters,
  paginationState,
  onPaginationStateChange,
  onCreateIncident,
  onUpdateIncident,
  onDeleteIncident,
  onBulkDeleteIncidents,
  onFetchDetail,
  onAddReply,
  onUpdateReply,
  onDeleteReply,
  onRegisterOpenCreate,
}: IncidentsTableSectionProps) => {
  const { t } = useTranslation('incidents')
  const { t: tCommon } = useTranslation('common')
  const { isRtl } = useDirection()
  const navigate = useNavigate()

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formOpen, setFormOpen] = useState(false)
  const [editingIncident, setEditingIncident] = useState<ManagedIncident | null>(null)
  const [detailSlug, setDetailSlug] = useState<string | null>(null)
  const [detailPreview, setDetailPreview] = useState<ManagedIncident | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)
  const [isMutating, setIsMutating] = useState(false)

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedIncidents = useMemo(
    () => incidents.filter((incident) => selectedIds.includes(incident.id)),
    [incidents, selectedIds],
  )
  const selectedCount = selectedIds.length

  const openCreate = useCallback(() => {
    setFormMode('create')
    setEditingIncident(null)
    setFormOpen(true)
  }, [])

  useEffect(() => {
    onRegisterOpenCreate?.(openCreate)
  }, [onRegisterOpenCreate, openCreate])

  const openDetail = useCallback((incident: ManagedIncident) => {
    setDetailSlug(incident.slug)
    setDetailPreview(incident)
    setDetailOpen(true)
  }, [])

  const navigateToOrder = useCallback(
    (incident: ManagedIncident) => {
      navigate(ROUTES.ORDERS.withSearch(incident.order.number))
    },
    [navigate],
  )

  const navigateToCompany = useCallback(
    (incident: ManagedIncident) => {
      if (!incident.company.slug) return
      navigate(ROUTES.COMPANIES.details(incident.company.slug))
    },
    [navigate],
  )

  const navigateToBranch = useCallback(
    (incident: ManagedIncident) => {
      if (!incident.company.slug || !incident.branch.slug) return
      navigate(ROUTES.COMPANIES.detailsTab(incident.company.slug, 'branches', { branch: incident.branch.slug }))
    },
    [navigate],
  )

  const columnLabels = useMemo(
    () => ({
      incident: t('colIncident'),
      order: t('colOrder'),
      customer: t('colCustomer'),
      stage: t('colStage'),
      status: t('colStatus'),
      reporter: t('colReporter'),
      replies: t('colReplies'),
      createdAt: t('colCreatedAt'),
      view: t('view'),
      edit: t('edit'),
      delete: t('delete'),
    }),
    [t],
  )

  const columns = useMemo(
    () =>
      createIncidentsColumns({
        isRtl,
        labels: columnLabels,
        onOrderClick: navigateToOrder,
        onCompanyClick: navigateToCompany,
        onBranchClick: navigateToBranch,
        onViewClick: openDetail,
        onEditClick: (incident) => {
          setFormMode('edit')
          setEditingIncident(incident)
          setFormOpen(true)
        },
        onDeleteClick: setDeleteTarget,
      }),
    [columnLabels, isRtl, navigateToBranch, navigateToCompany, navigateToOrder, openDetail],
  )

  const typeOptions = useMemo(
    () => [
      { value: 'all', label: t('filterAll') },
      { value: String(IncidentType.DamagedBag), label: t('typeDamagedBag') },
      { value: String(IncidentType.WrongItems), label: t('typeWrongItems') },
      { value: String(IncidentType.MissingItems), label: t('typeMissingItems') },
      { value: String(IncidentType.Delay), label: t('typeDelay') },
      { value: String(IncidentType.Other), label: t('typeOther') },
    ],
    [t],
  )

  const stageOptions = useMemo(
    () => [
      { value: 'all', label: t('filterAll') },
      { value: String(IncidentStage.Incoming), label: t('stageIncoming') },
      { value: String(IncidentStage.InLaundry), label: t('stageInLaundry') },
      { value: String(IncidentStage.ReadyForDelivery), label: t('stageReadyForDelivery') },
    ],
    [t],
  )

  const openOptions = useMemo(
    () => [
      { value: 'all', label: t('filterAll') },
      { value: 'open', label: t('statusOpen') },
      { value: 'closed', label: t('statusClosed') },
    ],
    [t],
  )

  const orderStatusOptions = useMemo(
    () => [
      { value: 'all', label: t('filterAll') },
      { value: String(OrderStatus.PickedUp), label: t('orderStatusPickedUp') },
      { value: String(OrderStatus.InLaundry), label: t('orderStatusInLaundry') },
      { value: String(OrderStatus.ReadyForDelivery), label: t('orderStatusReady') },
      { value: String(OrderStatus.Delivered), label: t('orderStatusDelivered') },
    ],
    [t],
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

  const handleFormSubmit = async (values: IncidentFormValues) => {
    const payload = {
      type: values.type,
      stage: values.stage,
      title: values.title,
      description: values.description,
    }

    if (formMode === 'create') {
      const result = await onCreateIncident(values.orderSlug, payload)
      if (result.success) notify.success({ title: t('toastCreated') })
      return result
    }

    if (!editingIncident) return { success: false }

    const result = await onUpdateIncident(editingIncident.slug, payload)
    if (result.success) notify.success({ title: t('toastUpdated') })
    return result
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsMutating(true)

    if (deleteTarget === 'bulk') {
      const result = await onBulkDeleteIncidents(selectedIncidents.map((item) => item.slug))
      setIsMutating(false)
      setDeleteTarget(null)
      setRowSelection({})

      if (result.success) {
        notify.success({ title: t('toastBulkDeleted') })
      } else {
        notify.error({ title: t('toastDeleteFailed') })
      }
      return
    }

    const result = await onDeleteIncident(deleteTarget.slug)
    setIsMutating(false)
    setDeleteTarget(null)

    if (result.success) {
      notify.success({
        title: t('toastDeleted'),
        description: t('toastDeletedDesc', { title: deleteTarget.title }),
      })
    } else {
      notify.error({ title: t('toastDeleteFailed') })
    }
  }

  const isEmpty = !isLoading && incidents.length === 0 && !hasActiveFilters
  const isFilteredEmpty = !isLoading && incidents.length === 0 && hasActiveFilters

  const bulkActions = (
    <DataTableBulkActions visible={selectedCount > 0} selectedCount={selectedCount} selectedLabel={t('selected')}>
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
  )

  return (
    <>
      <DataTablePanel
        index={1}
        toolbar={
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-medium text-foreground">{t('tableTitle')}</h2>
              <p className="text-xs text-muted-foreground">{t('tableDescription')}</p>
            </div>

            <DataTableToolbar
              search={keyword}
              onSearchChange={onKeywordChange}
              searchPlaceholder={t('searchPlaceholder')}
              endContent={
                <>
                  {bulkActions}
                  <IncidentsFilterDropdown
                    label={t('filterType')}
                    value={typeFilter === 'all' ? 'all' : String(typeFilter)}
                    options={typeOptions}
                    onChange={(value) =>
                      onTypeFilterChange(value === 'all' ? 'all' : (Number(value) as IncidentType))
                    }
                  />
                  <IncidentsFilterDropdown
                    label={t('filterStage')}
                    value={stageFilter === 'all' ? 'all' : String(stageFilter)}
                    options={stageOptions}
                    onChange={(value) =>
                      onStageFilterChange(value === 'all' ? 'all' : (Number(value) as IncidentStage))
                    }
                  />
                  <IncidentsFilterDropdown
                    label={t('filterStatus')}
                    value={openFilter}
                    options={openOptions}
                    onChange={(value) => onOpenFilterChange(value as IncidentOpenFilterValue)}
                  />
                  <IncidentsFilterDropdown
                    label={t('filterOrderStatus')}
                    value={orderStatusFilter === 'all' ? 'all' : String(orderStatusFilter)}
                    options={orderStatusOptions}
                    onChange={(value) =>
                      onOrderStatusFilterChange(
                        value === 'all' ? 'all' : (Number(value) as OrderStatus),
                      )
                    }
                    className="min-w-40"
                  />
                  <Button type="button" size="sm" onClick={openCreate}>
                    <Plus className="size-3.5" />
                    {t('reportIncident')}
                  </Button>
                </>
              }
            />
          </div>
        }
        footer={
          !isLoading && totalRows > 0 ? (
            <DataTablePagination
              pageIndex={paginationState.pageIndex}
              pageSize={paginationState.pageSize}
              totalRows={totalRows}
              onPageChange={(pageIndex) =>
                onPaginationStateChange((current) => ({ ...current, pageIndex }))
              }
              onPageSizeChange={(pageSize) => onPaginationStateChange({ pageIndex: 0, pageSize })}
              labels={paginationLabels}
            />
          ) : undefined
        }
      >
        {isLoading ? (
          <TableSkeleton />
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full border border-dashed border-border bg-muted/30">
              <AlertTriangle className="size-5 text-muted-foreground" strokeWidth={1.75} />
            </span>
            <p className="mt-4 text-sm font-medium text-foreground">{t('emptyTitle')}</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t('emptyDesc')}</p>
            <Button type="button" size="sm" className="mt-5" onClick={openCreate}>
              <Plus className="size-4" />
              {t('reportIncident')}
            </Button>
          </div>
        ) : isFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="text-sm font-medium text-foreground">{t('emptyFilterTitle')}</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t('emptyFilterDesc')}</p>
            <Button type="button" variant="outline" size="sm" className="mt-5" onClick={onClearFilters}>
              {t('clearFilters')}
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={incidents}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row.id}
            onRowClick={openDetail}
            animateRows
            className="py-1"
          />
        )}
      </DataTablePanel>

      <IncidentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        incident={editingIncident}
        onSubmit={handleFormSubmit}
      />

      <IncidentDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        incidentSlug={detailSlug}
        incidentPreview={detailPreview}
        onLoad={onFetchDetail}
        onAddReply={onAddReply}
        onUpdateReply={onUpdateReply}
        onDeleteReply={onDeleteReply}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget === 'bulk' ? t('deleteBulkTitle') : t('deleteTitle')}
        description={
          deleteTarget === 'bulk'
            ? t('deleteBulkDesc', { count: selectedCount })
            : t('deleteDesc', { title: deleteTarget?.title ?? '' })
        }
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        destructive
        loading={isMutating}
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}
