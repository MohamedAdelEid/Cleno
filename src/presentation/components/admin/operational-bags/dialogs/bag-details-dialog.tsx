import { format, formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

import type { OperationalBag } from '@/domain/entities'
import {
  OperationalBagStatus,
  OperationalBagSystemStatus,
} from '@/domain/enums'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { BagOperationalStatusBadge, BagSystemStatusBadge } from '@/presentation/components/admin/operational-bags/shared'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'

interface BagDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bag: OperationalBag | null
  onEdit: (bag: OperationalBag) => void
}

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/40 last:border-0">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <div className="text-end text-sm text-foreground">{children}</div>
  </div>
)

export const BagDetailsDialog = ({
  open,
  onOpenChange,
  bag,
  onEdit,
}: BagDetailsDialogProps) => {
  const { t } = useTranslation('operationalBags')

  if (!bag) return null

  const systemLabel =
    bag.systemStatus === OperationalBagSystemStatus.Active
      ? t('systemActive')
      : t('systemInactive')

  const operationalLabels: Record<OperationalBagStatus, string> = {
    [OperationalBagStatus.Ready]: t('opReady'),
    [OperationalBagStatus.Processing]: t('opProcessing'),
    [OperationalBagStatus.OnTheWay]: t('opOnTheWay'),
    [OperationalBagStatus.Assigned]: t('opAssigned'),
    [OperationalBagStatus.InTransit]: t('opInTransit'),
    [OperationalBagStatus.Missing]: t('opMissing'),
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('detailsTitle')}
      description={t('detailsDesc', { bagId: bag.bagId })}
      size="md"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('close')}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false)
              onEdit(bag)
            }}
          >
            {t('edit')}
          </Button>
        </>
      }
    >
      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-1">
        <DetailRow label={t('colBagId')}>
          <span className="font-mono font-semibold">{bag.bagId}</span>
        </DetailRow>
        <DetailRow label={t('colSystemStatus')}>
          <BagSystemStatusBadge status={bag.systemStatus} label={systemLabel} />
        </DetailRow>
        <DetailRow label={t('colOperationalStatus')}>
          <BagOperationalStatusBadge
            status={bag.operationalStatus}
            label={operationalLabels[bag.operationalStatus]}
          />
        </DetailRow>
        <DetailRow label={t('colCurrentOrder')}>
          {bag.currentOrderNumber ? (
            <Link to={ROUTES.ORDERS.INDEX} className="font-medium text-primary hover:underline">
              {bag.currentOrderNumber}
            </Link>
          ) : (
            <span className="text-muted-foreground">{t('noOrder')}</span>
          )}
        </DetailRow>
        <DetailRow label={t('colCustomer')}>
          {bag.customerName && bag.customerSlug ? (
            <Link
              to={ROUTES.COMPANIES.DETAILS.replace(':companySlug', bag.customerSlug)}
              className="font-medium text-primary hover:underline"
            >
              {bag.customerName}
            </Link>
          ) : (
            <span className="text-muted-foreground">{t('noCustomer')}</span>
          )}
        </DetailRow>
        <DetailRow label={t('colLastUpdated')}>
          <div className="space-y-0.5">
            <p>{formatDistanceToNow(new Date(bag.updatedAt), { addSuffix: true })}</p>
            <p className="text-[10px] text-muted-foreground">
              {format(new Date(bag.updatedAt), 'MMM d, yyyy · h:mm a')}
            </p>
          </div>
        </DetailRow>
      </div>
    </AppDialog>
  )
}
