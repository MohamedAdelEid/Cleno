import { Bell } from 'lucide-react'

import { AlertCategory } from '@/domain/enums'
import { ROUTES } from '@/presentation/routes/routes.constants'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, smoothScrollClass } from '@/presentation/utils'
import { DashboardPanelCard, PanelCardActionLink } from '@/presentation/components/dashboard/widgets/panel-card'
import { AlertItem } from './alert-item'
import { dashboardAlertsDummyData } from './alerts.data'

interface AlertsCardProps {
  index?: number
  className?: string
}

export const AlertsCard = ({ index = 11, className }: AlertsCardProps) => {
  const { t } = useTranslation('dashboard')

  const categoryLabels: Record<AlertCategory, string> = {
    [AlertCategory.DelayedOrder]: t('alertDelayedOrder'),
    [AlertCategory.IssueReported]: t('alertIssueReported'),
    [AlertCategory.OpenIncident]: t('alertOpenIncident'),
  }

  return (
    <DashboardPanelCard
      title={t('alerts')}
      icon={Bell}
      index={index}
      className={cn('min-w-0', className)}
      innerClassName={cn(
        'flex min-h-0 flex-col overflow-hidden px-1.5 py-1',
        'max-h-[min(300px,36dvh)] xl:max-h-[min(260px,28dvh)]',
      )}
      action={
        <PanelCardActionLink to={ROUTES.ORDERS.INDEX} label={t('alertsViewAll')} />
      }
    >
      <ul className={cn('min-h-0 flex-1 space-y-0.5', smoothScrollClass)}>
        {dashboardAlertsDummyData.map((alert, alertIndex) => (
          <AlertItem
            key={alert.id}
            alert={alert}
            index={alertIndex}
            categoryLabel={categoryLabels[alert.category]}
            onOrderClick={(item) => console.info('View order:', item.orderId)}
          />
        ))}
      </ul>
    </DashboardPanelCard>
  )
}
