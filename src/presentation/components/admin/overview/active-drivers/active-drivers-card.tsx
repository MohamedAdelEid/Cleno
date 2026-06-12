import { Truck } from 'lucide-react'

import { ROUTES } from '@/presentation/routes/routes.constants'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, smoothScrollClass } from '@/presentation/utils'
import { DashboardPanelCard, PanelCardActionLink } from '@/presentation/components/dashboard/widgets/panel-card'
import { ActiveDriverItem } from './active-driver-item'
import { activeDriversDummyData } from './active-drivers.data'

interface ActiveDriversCardProps {
  index?: number
  className?: string
}

export const ActiveDriversCard = ({ index = 10, className }: ActiveDriversCardProps) => {
  const { t } = useTranslation('dashboard')

  return (
    <DashboardPanelCard
      title={t('activeDrivers')}
      icon={Truck}
      index={index}
      className={cn('flex min-h-0 min-w-0 flex-col', className)}
      innerClassName="flex min-h-0 flex-1 flex-col overflow-hidden px-1.5 py-1"
      action={
        <PanelCardActionLink
          to={ROUTES.ORDERS.INDEX}
          label={t('activeDriversViewAll')}
        />
      }
    >
      <ul className={cn('min-h-0 flex-1 divide-y divide-border/50', smoothScrollClass)}>
        {activeDriversDummyData.map((driver, driverIndex) => (
          <ActiveDriverItem
            key={driver.id}
            driver={driver}
            index={driverIndex}
            idleLabel={t('activeDriversIdle')}
            onTaskLabel={t('activeDriversOnTask')}
            tasksCountLabel={
              driver.taskCount && driver.taskCount > 1
                ? t('activeDriversTasksCount', { count: driver.taskCount })
                : undefined
            }
            onClick={(item) => console.info('View driver:', item.id)}
          />
        ))}
      </ul>
    </DashboardPanelCard>
  )
}
