import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { DashboardAlert } from '@/domain/entities'
import { AlertCategory } from '@/domain/enums'
import { ROUTES } from '@/presentation/routes/routes.constants'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, smoothScrollClass } from '@/presentation/utils'
import { DashboardPanelCard, PanelCardActionLink } from '@/presentation/components/dashboard/widgets/panel-card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { AlertItem } from './alert-item'

interface AlertsCardProps {
  index?: number
  className?: string
  alerts: DashboardAlert[]
  isLoading?: boolean
}

export const AlertsCard = ({
  index = 11,
  className,
  alerts,
  isLoading = false,
}: AlertsCardProps) => {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()

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
        <PanelCardActionLink to={ROUTES.LAUNDRY.INDEX} label={t('alertsViewAll')} />
      }
    >
      <ul className={cn('min-h-0 flex-1 space-y-0.5', smoothScrollClass)}>
        {isLoading ? (
          Array.from({ length: 4 }, (_, index) => (
            <li key={index} className="px-2 py-2.5">
              <div className="flex gap-2.5">
                <Skeleton className="size-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </li>
          ))
        ) : alerts.length === 0 ? (
          <li className="px-2 py-6 text-center text-sm text-muted-foreground">
            {t('alertsEmpty')}
          </li>
        ) : (
          alerts.map((alert, alertIndex) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              index={alertIndex}
              categoryLabel={categoryLabels[alert.category]}
              onOrderClick={() => navigate(ROUTES.LAUNDRY.INDEX)}
            />
          ))
        )}
      </ul>
    </DashboardPanelCard>
  )
}
