import type { PaginationState } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import {
  Building2,
  User,
  Phone,
  MapPin,
  ClipboardList,
  CheckCircle2,
  CalendarDays,
  DollarSign,
  AlertCircle,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { forwardRef, useEffect, useMemo, useState } from 'react'

import type { CompanyDetailsBranch } from '@/domain/entities/company-details.entity'
import {
  DataTablePagination,
  DataTablePanel,
  DataTableToolbar,
} from '@/presentation/components/dashboard/data-table'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, PAGE_EASE } from '@/presentation/utils'

interface BranchesTabProps {
  branches: CompanyDetailsBranch[]
  search: string
  isLoading?: boolean
  onSearchChange: (value: string) => void
  focusedBranchSlug?: string
  onViewOrders: (branchSlug: string) => void
  onViewInvoices: (branchSlug: string) => void
}

const formatCurrency = (val: number) =>
  `$${val.toLocaleString('en-US', { minimumFractionDigits: 0 })}`

const BranchCard = forwardRef<
  HTMLDivElement,
  {
    branch: CompanyDetailsBranch
    isFocused: boolean
    onViewOrders: () => void
    onViewInvoices: () => void
  }
>(({ branch, isFocused, onViewOrders, onViewInvoices }, ref) => {
  const { t } = useTranslation('companies')

  return (
    <div
      ref={ref}
      className={cn(
        'group overflow-hidden rounded-xl border bg-card transition-all',
        isFocused
          ? 'border-primary/50 shadow-md ring-2 ring-primary/20'
          : 'border-border/70 hover:shadow-sm',
      )}
    >
      <div className="flex items-start justify-between border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-muted/50">
            <Building2 className="size-4.5 text-muted-foreground" strokeWidth={1.75} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{branch.name}</h3>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                branch.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
              )}
            >
              <span className={cn('size-1.5 rounded-full', branch.status === 'active' ? 'bg-emerald-500' : 'bg-red-500')} />
              {branch.status === 'active' ? t('detailsBranchActive') : t('detailsBranchInactive')}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-5 py-3">
        <BranchInfoRow icon={User} label={t('detailsBranchManager')} value={branch.managerName} />
        <BranchInfoRow icon={Phone} label={t('detailsBranchPhone')} value={branch.phone} />
        <BranchInfoRow icon={MapPin} label={t('detailsBranchAddress')} value={branch.address} />
        {branch.googleMapsLink && (
          <a
            href={branch.googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <ExternalLink className="size-3" />
            {t('detailsGoogleMaps')}
          </a>
        )}
      </div>

      <div className="border-t border-border/50 px-5 py-3">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <BranchMetric icon={ClipboardList} label={t('detailsBranchActiveOrders')} value={branch.activeOrders} />
          <BranchMetric icon={CheckCircle2} label={t('detailsBranchCompleted')} value={branch.completedOrders} variant="success" />
          <BranchMetric icon={CalendarDays} label={t('detailsBranchThisMonth')} value={branch.ordersThisMonth} />
          <BranchMetric icon={DollarSign} label={t('detailsBranchOutstanding')} value={formatCurrency(branch.outstandingBalance)} variant={branch.outstandingBalance > 0 ? 'warning' : 'default'} />
          <BranchMetric icon={AlertCircle} label={t('detailsBranchOverdueOrders')} value={branch.overdueOrders} variant={branch.overdueOrders > 0 ? 'danger' : 'default'} />
          <BranchMetric icon={FileText} label={t('detailsBranchPendingInvoices')} value={branch.pendingInvoices} variant={branch.pendingInvoices > 0 ? 'warning' : 'default'} />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border/50 px-5 py-3">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onViewOrders}>
          <ClipboardList className="size-3" />
          {t('detailsViewOrders')}
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onViewInvoices}>
          <ExternalLink className="size-3" />
          {t('detailsViewInvoices')}
        </Button>
      </div>
    </div>
  )
})
BranchCard.displayName = 'BranchCard'

export const BranchesTab = ({
  branches,
  search,
  isLoading = false,
  onSearchChange,
  focusedBranchSlug,
  onViewOrders,
  onViewInvoices,
}: BranchesTabProps) => {
  const { t } = useTranslation('companies')
  const { t: tCommon } = useTranslation('common')
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 4,
  })

  const filteredBranches = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return branches
    return branches.filter(
      (branch) =>
        branch.name.toLowerCase().includes(q) ||
        branch.slug.toLowerCase().includes(q) ||
        branch.managerName.toLowerCase().includes(q) ||
        branch.address.toLowerCase().includes(q),
    )
  }, [branches, search])

  useEffect(() => {
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }))
  }, [search, focusedBranchSlug])

  const paginatedBranches = useMemo(() => {
    const start = paginationState.pageIndex * paginationState.pageSize
    return filteredBranches.slice(start, start + paginationState.pageSize)
  }, [filteredBranches, paginationState])

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: PAGE_EASE }}
    >
      <DataTablePanel
        toolbar={
          <DataTableToolbar
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder={t('detailsSearchBranchesPlaceholder')}
          />
        }
        footer={
          filteredBranches.length > 0 ? (
            <DataTablePagination
              pageIndex={paginationState.pageIndex}
              pageSize={paginationState.pageSize}
              totalRows={filteredBranches.length}
              onPageChange={(pageIndex) => setPaginationState((prev) => ({ ...prev, pageIndex }))}
              onPageSizeChange={(pageSize) => setPaginationState({ pageIndex: 0, pageSize })}
              labels={paginationLabels}
            />
          ) : undefined
        }
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Building2 className="size-10 animate-pulse text-muted-foreground/40" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-muted-foreground">{t('detailsLoadingBranches')}</p>
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Building2 className="size-10 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-muted-foreground">{t('detailsNoBranches')}</p>
          </div>
        ) : (
          <div className="grid gap-4 p-4 lg:grid-cols-2">
            {paginatedBranches.map((branch) => (
              <BranchCard
                key={branch.id}
                ref={(el) => {
                  if (focusedBranchSlug === branch.slug && el) {
                    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400)
                  }
                }}
                branch={branch}
                isFocused={focusedBranchSlug === branch.slug}
                onViewOrders={() => onViewOrders(branch.slug)}
                onViewInvoices={() => onViewInvoices(branch.slug)}
              />
            ))}
          </div>
        )}
      </DataTablePanel>
    </motion.div>
  )
}

const BranchInfoRow = ({ icon: Icon, label, value }: { icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string; value: string }) => (
  <div className="flex items-center gap-2.5 text-xs">
    <Icon className="size-3.5 shrink-0 text-muted-foreground/60" strokeWidth={1.75} />
    <span className="text-muted-foreground">{label}:</span>
    <span className="truncate font-medium text-foreground">{value}</span>
  </div>
)

const BranchMetric = ({
  icon: Icon,
  label,
  value,
  variant = 'default',
}: {
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  label: string
  value: string | number
  variant?: 'default' | 'success' | 'warning' | 'danger'
}) => {
  const colorMap = {
    default: 'text-foreground',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className="rounded-lg bg-muted/30 px-2.5 py-2">
      <div className="flex items-center gap-1">
        <Icon className="size-3 text-muted-foreground/60" strokeWidth={1.75} />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <p className={cn('mt-0.5 text-sm font-semibold', colorMap[variant])}>{value}</p>
    </div>
  )
}
