import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ChevronRight, TrendingUp } from 'lucide-react'

import type { CompanyDetailsData } from '@/domain/entities/company-details.entity'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, PAGE_EASE } from '@/presentation/utils'
import { CompanyStatusBadge } from '../../shared/company-status-badge'
import { FinancialDonutChart } from '../financial-donut-chart'

import { ActivityTimelineItem } from './activity-tab'
import { OrderStatusBadge, InvoiceStatusBadge } from './shared-badges'
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Calendar,
  ShieldCheck,
  FileText,
} from 'lucide-react'

interface OverviewTabProps {
  company: CompanyDetailsData
  onOrderClick: (orderId: string) => void
  onViewAllOrders: () => void
  onViewAllActivity: () => void
}

const formatCurrency = (val: number) =>
  `$${val.toLocaleString('en-US', { minimumFractionDigits: 0 })}`

const formatDate = (iso: string) => {
  try { return format(new Date(iso), 'MMM d, yyyy') } catch { return iso }
}

const formatDateTime = (iso: string) => {
  try { return format(new Date(iso), 'MMM d, h:mm a') } catch { return iso }
}

const InfoRow = ({ icon: Icon, label, children }: { icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-3 py-2.5">
    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
      <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{label}</p>
      <div className="mt-0.5 text-sm text-foreground">{children}</div>
    </div>
  </div>
)

const SectionCard = ({
  title,
  delay,
  action,
  children,
}: {
  title: string
  delay: number
  action?: React.ReactNode
  children: React.ReactNode
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: PAGE_EASE, delay }}
    className="overflow-hidden rounded-xl border border-border/70 bg-card"
  >
    <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {action}
    </div>
    <div className="px-5 py-2">{children}</div>
  </motion.div>
)

export const OverviewTab = ({
  company,
  onOrderClick,
  onViewAllOrders,
  onViewAllActivity,
}: OverviewTabProps) => {
  const { t } = useTranslation('companies')
  const statusLabel = company.isActive ? t('detailsActive') : t('detailsInactive')
  const previewActivities = company.activities.slice(0, 4)
  const previewOrders = company.recentOrders.slice(0, 5)
  const pendingAndOverdueInvoices = company.invoices.filter((inv) => inv.status !== 'paid').slice(0, 4)

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <SectionCard title={t('detailsCompanyInfo')} delay={0.05}>
          <div className="grid gap-x-8 sm:grid-cols-2">
            <div className="space-y-0.5">
              <h4 className="mb-1 mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{t('detailsBusinessInfo')}</h4>
              <InfoRow icon={Building2} label={t('detailsBusinessName')}>{company.name}</InfoRow>
              <InfoRow icon={FileText} label={t('detailsBusinessType')}>{company.type}</InfoRow>
              <InfoRow icon={ShieldCheck} label={t('detailsCommercialRegistration')}>{company.commercialRegistration || '—'}</InfoRow>
            </div>
            <div className="space-y-0.5">
              <h4 className="mb-1 mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{t('detailsContactInfo')}</h4>
              <InfoRow icon={User} label={t('detailsMainContact')}>{company.responsible.fullName}</InfoRow>
              <InfoRow icon={Phone} label={t('detailsPhone')}>
                <a href={`tel:${company.phone}`} className="text-primary hover:underline">{company.phone}</a>
              </InfoRow>
              <InfoRow icon={Mail} label={t('detailsEmail')}>
                <a href={`mailto:${company.email}`} className="text-primary hover:underline">{company.email}</a>
              </InfoRow>
            </div>
          </div>

          <div className="mt-1 border-t border-border/40 pt-1">
            <div className="grid gap-x-8 sm:grid-cols-2">
              <div>
                <h4 className="mb-1 mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{t('detailsLocationInfo')}</h4>
                <InfoRow icon={MapPin} label={t('detailsAddress')}>
                  <p>{company.address}</p>
                  {company.googleMapsLink && (
                    <a href={company.googleMapsLink} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink className="size-3" />
                      {t('detailsGoogleMaps')}
                    </a>
                  )}
                </InfoRow>
              </div>
              <div>
                <h4 className="mb-1 mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{t('detailsStatusInfo')}</h4>
                <InfoRow icon={ShieldCheck} label={t('detailsCompanyStatus')}>
                  <CompanyStatusBadge status={company.status} label={statusLabel} />
                </InfoRow>
                <InfoRow icon={Calendar} label={t('detailsRegistrationDate')}>
                  {formatDate(company.createdAt)}
                </InfoRow>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title={t('detailsRecentOrders')}
          delay={0.15}
          action={
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={onViewAllOrders}>
              {t('detailsViewAll')}
              <ChevronRight className="size-3.5" />
            </Button>
          }
        >
          {previewOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t('detailsNoOrders')}</p>
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-5 py-2.5 text-start text-xs font-medium text-muted-foreground">{t('detailsOrderId')}</th>
                    <th className="px-3 py-2.5 text-start text-xs font-medium text-muted-foreground">{t('detailsBranchName')}</th>
                    <th className="px-3 py-2.5 text-start text-xs font-medium text-muted-foreground">{t('detailsOrderStatus')}</th>
                    <th className="px-3 py-2.5 text-end text-xs font-medium text-muted-foreground">{t('detailsItemsCount')}</th>
                    <th className="px-5 py-2.5 text-end text-xs font-medium text-muted-foreground">{t('detailsPickupDate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {previewOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/30 last:border-0 transition-colors hover:bg-muted/30">
                      <td className="px-5 py-2.5">
                        <button type="button" onClick={() => onOrderClick(order.id)} className="text-sm font-medium text-primary hover:underline">{order.orderNumber}</button>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{order.branchName}</td>
                      <td className="px-3 py-2.5"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-3 py-2.5 text-end text-muted-foreground">{order.itemsCount}</td>
                      <td className="px-5 py-2.5 text-end text-xs text-muted-foreground">{formatDateTime(order.pickupDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="space-y-5">
        <SectionCard title={t('detailsFinancialSummary')} delay={0.1}>
          <div className="space-y-4 py-2">
            <FinancialDonutChart financials={company.financials} />

            <div className="space-y-2 border-t border-border/40 pt-3">
              <FinancialRow label={t('detailsTotalBilled')} value={formatCurrency(company.financials.totalBilledAmount)} />
              <FinancialRow label={t('detailsTotalPaid')} value={formatCurrency(company.financials.totalPaidAmount)} variant="success" />
              <FinancialRow label={t('detailsOutstandingBalance')} value={formatCurrency(company.financials.outstandingBalance)} variant={company.financials.outstandingBalance > 0 ? 'warning' : 'default'} />
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="size-3.5" />
                  {t('detailsCollectionRate')}
                </span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{company.financials.collectionRate}%</span>
              </div>
            </div>

            {pendingAndOverdueInvoices.length > 0 && (
              <div className="space-y-1.5 border-t border-border/40 pt-3">
                <h4 className="text-xs font-semibold text-muted-foreground">{t('detailsPendingInvoicesTitle')}</h4>
                {pendingAndOverdueInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/30">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">{inv.invoiceNumber}</p>
                      <p className="text-[10px] text-muted-foreground">Due {formatDate(inv.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{formatCurrency(inv.amount)}</span>
                      <InvoiceStatusBadge status={inv.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title={t('detailsRecentActivity')}
          delay={0.2}
          action={
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={onViewAllActivity}>
              {t('detailsViewAll')}
              <ChevronRight className="size-3.5" />
            </Button>
          }
        >
          {previewActivities.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t('detailsNoActivity')}</p>
          ) : (
            <div className="py-2">
              {previewActivities.map((activity, index) => (
                <ActivityTimelineItem key={activity.id} activity={activity} isLast={index === previewActivities.length - 1} />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

const FinancialRow = ({ label, value, variant = 'default' }: { label: string; value: string; variant?: 'default' | 'success' | 'warning' }) => {
  const colorMap = { default: 'text-foreground', success: 'text-emerald-600 dark:text-emerald-400', warning: 'text-amber-600 dark:text-amber-400' }
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium', colorMap[variant])}>{value}</span>
    </div>
  )
}
