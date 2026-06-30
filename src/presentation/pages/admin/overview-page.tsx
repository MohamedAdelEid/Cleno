import {
  DashboardStats,
  DashboardWelcomeCard,
  RecentOrdersCard,
} from '@/presentation/components/admin/overview'
import { useAdminDashboard } from '@/presentation/components/admin/overview/hooks/use-admin-dashboard'

export const OverviewPage = () => {
  const dashboard = useAdminDashboard()

  return (
    <div className="space-y-6">
      <DashboardWelcomeCard />
      <DashboardStats
        kpis={dashboard.kpis}
        isKpisLoading={dashboard.isKpisLoading}
        orderVolume={dashboard.orderVolume}
        orderVolumePeriod={dashboard.orderVolumePeriod}
        onOrderVolumePeriodChange={dashboard.setOrderVolumePeriod}
        isOrderVolumeLoading={dashboard.isOrderVolumeLoading}
        activeDrivers={dashboard.activeDrivers}
        isActiveDriversLoading={dashboard.isActiveDriversLoading}
        alerts={dashboard.alerts}
        isAlertsLoading={dashboard.isAlertsLoading}
        activityItems={dashboard.activityItems}
        activityTotalCount={dashboard.activityTotalCount}
        activityFilter={dashboard.activityFilter}
        onActivityFilterChange={dashboard.setActivityFilter}
        activityCustomDate={dashboard.activityCustomDate}
        onActivityCustomDateChange={dashboard.setActivityCustomDate}
        activitySearch={dashboard.activitySearch}
        onActivitySearchChange={dashboard.setActivitySearch}
        isActivityLoading={dashboard.isActivityLoading}
      />
      <RecentOrdersCard
        orders={dashboard.recentOrders}
        isLoading={dashboard.isRecentOrdersLoading}
      />
    </div>
  )
}
