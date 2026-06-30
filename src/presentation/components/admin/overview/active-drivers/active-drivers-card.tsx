import { Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { ActiveDriver } from '@/domain/entities'
import { ROUTES } from '@/presentation/routes/routes.constants'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn, smoothScrollClass } from '@/presentation/utils'
import { DashboardPanelCard, PanelCardActionLink } from '@/presentation/components/dashboard/widgets/panel-card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { ActiveDriverItem } from './active-driver-item'

interface ActiveDriversCardProps {
  index?: number
  className?: string
  drivers: ActiveDriver[]
  isLoading?: boolean
}

const driverSearchKeyword = (driver: ActiveDriver) => driver.fullName.trim()

export const ActiveDriversCard = ({
  index = 10,
  className,
  drivers,
  isLoading = false,
}: ActiveDriversCardProps) => {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()

  const handleDriverClick = (driver: ActiveDriver) => {
    navigate(ROUTES.DRIVERS.withSearch(driverSearchKeyword(driver)))
  }

  return (
    <DashboardPanelCard
      title={t('activeDrivers')}
      icon={Truck}
      index={index}
      className={cn('flex min-h-0 min-w-0 flex-col', className)}
      innerClassName={cn(
        'flex min-h-0 flex-col overflow-hidden px-1.5 py-1',
        'max-h-[min(340px,47dvh)]',
      )}
      action={
        <PanelCardActionLink
          to={ROUTES.DRIVERS.INDEX}
          label={t('activeDriversViewAll')}
        />
      }
    >
      <ul
        className={cn(
          'min-h-0 flex-1 divide-y divide-border/50 overflow-y-auto',
          smoothScrollClass,
        )}
      >
        {isLoading ? (
          Array.from({ length: 4 }, (_, index) => (
            <li key={index} className="flex items-center gap-3 px-2 py-2.5">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </li>
          ))
        ) : drivers.length === 0 ? (
          <li className="px-2 py-6 text-center text-sm text-muted-foreground">
            {t('activeDriversEmpty')}
          </li>
        ) : (
          drivers.map((driver, driverIndex) => (
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
              onClick={handleDriverClick}
            />
          ))
        )}
      </ul>
    </DashboardPanelCard>
  )
}
