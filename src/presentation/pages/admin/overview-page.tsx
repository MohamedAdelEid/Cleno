import {
  DashboardStats,
  DashboardWelcomeCard,
  RecentOrdersCard,
} from '@/presentation/components/admin/overview'

export const OverviewPage = () => (
  <div className="space-y-6">
    <DashboardWelcomeCard />
    <DashboardStats />
    <RecentOrdersCard />
  </div>
)
