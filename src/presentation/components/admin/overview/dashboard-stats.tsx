import {
  AlertTriangle,
  ClipboardList,
  Clock,
  Package,
  PackageCheck,
  Shirt,
  Truck,
  Users,
  Wallet,
} from 'lucide-react'
import { ActiveDriversCard } from './active-drivers'
import { AlertsCard } from './alerts'
import { LatestUpdatesCard } from './latest-updates'
import { OrderVolumeCard } from './order-volume'
import { DashboardStatCard, type DashboardStatCardProps } from '@/presentation/components/dashboard/widgets/stat-card'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'

export const DashboardStats = () => {
  const { t } = useTranslation('dashboard')

  const Stats: DashboardStatCardProps[] = [
    {
      title: t('statsActiveOrders'),
      value: 128,
      description: t('statsActiveOrdersDesc'),
      trend: { value: '+12.4%', label: t('statsVsLastWeek'), direction: 'up' },
      icon: ClipboardList,
      sparklineData: [22, 28, 25, 34, 30, 38, 42, 48, 44, 52],
      sparklineTrend: 'positive',
    },
    {
      title: t('statsInLaundry'),
      value: 43,
      description: t('statsInLaundryDesc'),
      trend: { value: '+3.8%', label: t('statsVsLastWeek'), direction: 'up' },
      icon: Shirt,
      sparklineData: [40, 36, 38, 35, 33, 37, 34, 39, 41, 43],
      sparklineTrend: 'positive',
    },
    {
      title: t('statsOutstanding'),
      value: 6,
      description: t('statsOutstandingDesc'),
      highlight: t('statsOverdue', { count: 2 }),
      trend: { value: '-4.2%', label: t('statsVsLastWeek'), direction: 'down' },
      icon: Wallet,
      sparklineData: [18, 16, 14, 15, 12, 13, 10, 9, 8, 6],
      sparklineTrend: 'negative',
    },
    {
      title: t('statsActiveCustomers'),
      value: 284,
      description: t('statsActiveCustomersDesc'),
      trend: { value: '+5.2%', label: t('statsVsLastWeek'), direction: 'up' },
      icon: Users,
      sparklineData: [210, 225, 218, 240, 252, 248, 265, 272, 278, 284],
      sparklineTrend: 'positive',
    },
    {
      title: t('statsBagsCirculating'),
      value: '1,420',
      description: t('statsBagsCirculatingDesc'),
      trend: { value: '+2.1%', label: t('statsVsLastWeek'), direction: 'up' },
      icon: Package,
      sparklineData: [1280, 1310, 1295, 1340, 1365, 1350, 1388, 1395, 1410, 1420],
      sparklineTrend: 'positive',
    },
    {
      title: t('statsReadyForPickup'),
      value: 18,
      description: t('statsReadyForPickupDesc'),
      trend: { value: '+6.1%', label: t('statsVsLastWeek'), direction: 'up' },
      icon: PackageCheck,
      sparklineData: [10, 12, 11, 14, 13, 15, 16, 14, 17, 18],
      sparklineTrend: 'positive',
    },
    {
      title: t('statsOutForDelivery'),
      value: 26,
      description: t('statsOutForDeliveryDesc'),
      trend: { value: '+4.3%', label: t('statsVsLastWeek'), direction: 'up' },
      icon: Truck,
      sparklineData: [18, 20, 19, 22, 21, 24, 23, 25, 24, 26],
      sparklineTrend: 'positive',
    },
    {
      title: t('statsDelayedOrders'),
      value: 7,
      description: t('statsDelayedOrdersDesc'),
      highlight: t('statsDelayedCritical', { count: 2 }),
      trend: { value: '+1.8%', label: t('statsVsLastWeek'), direction: 'up' },
      icon: Clock,
      sparklineData: [4, 5, 4, 6, 5, 7, 6, 8, 7, 7],
      sparklineTrend: 'negative',
    },
    {
      title: t('statsOpenIncidents'),
      value: 3,
      description: t('statsOpenIncidentsDesc'),
      highlight: t('statsIncidentsEscalated', { count: 1 }),
      trend: { value: '-25%', label: t('statsVsLastWeek'), direction: 'down' },
      icon: AlertTriangle,
      sparklineData: [8, 7, 6, 6, 5, 4, 4, 3, 3, 3],
      sparklineTrend: 'negative',
    },
  ]

  return (
    <div
      className={cn(
        'grid items-start gap-5 xl:items-stretch',
        'grid-cols-1',
        'xl:grid-cols-[minmax(0,1fr)_clamp(280px,28vw,420px)]',
        '2xl:grid-cols-[minmax(0,1fr)_450px]',
      )}
    >
      <div className="flex min-w-0 flex-col gap-5">
        <div
          className={cn(
            'grid min-w-0 grid-cols-1 gap-4',
            'min-[520px]:grid-cols-2',
            'xl:grid-cols-3',
          )}
        >
          {Stats.map((stat, index) => (
            <DashboardStatCard
              key={stat.title}
              {...stat}
              index={index}
              className="min-w-0 self-start"
            />
          ))}
        </div>

        <div
          className={cn(
            'grid min-w-0 gap-4',
            'grid-cols-1',
            'min-[900px]:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]',
            'xl:grid-cols-[minmax(0,1fr)_260px]',
            '2xl:grid-cols-[minmax(0,1fr)_280px]',
          )}
        >
          <OrderVolumeCard className="min-w-0" />
          <ActiveDriversCard className="min-w-0 self-stretch" />
        </div>
      </div>

      <div
        className={cn(
          'flex min-w-0 flex-col gap-4',
          'w-full self-start',
          'xl:h-full xl:min-h-0 xl:self-stretch',
        )}
      >
        <LatestUpdatesCard
          index={9}
          className="min-h-0 min-w-0 flex-1"
        />
        <AlertsCard className="min-w-0 shrink-0" />
      </div>
    </div>
  )
}
