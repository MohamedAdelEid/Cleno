import type { RouteObject } from 'react-router-dom'
import { OverviewPage } from '@/presentation/pages/admin/overview-page'
import { OrdersPage } from '@/presentation/pages/admin/orders'
import { AddRolePage, EditRolePage, RolesPage } from '@/presentation/pages/admin/roles'
import {
  AddCompanyPage,
  CompaniesPage,
  CompanyDetailsPage,
  EditCompanyPage,
} from '@/presentation/pages/admin/companies'
import { LaundryOperationsPage } from '@/presentation/pages/admin/laundry'
import { IncidentsPage } from '@/presentation/pages/admin/incidents'
import { OperationalBagsPage } from '@/presentation/pages/admin/operational-bags'
import { DriversPage } from '@/presentation/pages/admin/drivers'
import { UsersPage } from '@/presentation/pages/admin/users'
import { TimeSlotsPage } from '@/presentation/pages/admin/time-slots'
import { LaundryItemsPage } from '@/presentation/pages/admin/laundry-items'
import { ProfilePage } from '@/presentation/pages/admin/profile'
import { SettingsPage } from '@/presentation/pages/admin/settings'
import { DashboardPlaceholderPage } from '@/presentation/pages/dashboard/dashboard-placeholder-page'
import { ROUTES } from '../routes.constants'

export const adminRoutes: RouteObject[] = [
  { path: ROUTES.DASHBOARD.HOME, element: <OverviewPage /> },
  { path: ROUTES.USERS.INDEX, element: <UsersPage /> },
  { path: ROUTES.ROLES.INDEX, element: <RolesPage /> },
  { path: ROUTES.ROLES.NEW, element: <AddRolePage /> },
  { path: ROUTES.ROLES.EDIT, element: <EditRolePage /> },
  { path: ROUTES.BRANCHES.INDEX, element: <DashboardPlaceholderPage title="Branches" /> },
  { path: ROUTES.ORDERS.INDEX, element: <OrdersPage /> },
  { path: ROUTES.LAUNDRY.INDEX, element: <LaundryOperationsPage /> },
  { path: ROUTES.INCIDENTS.INDEX, element: <IncidentsPage /> },
  { path: ROUTES.OPERATIONAL_BAGS.INDEX, element: <OperationalBagsPage /> },
  { path: ROUTES.DRIVERS.INDEX, element: <DriversPage /> },
  { path: ROUTES.COMPANIES.INDEX, element: <CompaniesPage /> },
  { path: ROUTES.COMPANIES.NEW, element: <AddCompanyPage /> },
  { path: ROUTES.COMPANIES.EDIT, element: <EditCompanyPage /> },
  { path: ROUTES.COMPANIES.DETAILS, element: <CompanyDetailsPage /> },
  { path: ROUTES.CUSTOMERS.INDEX, element: <DashboardPlaceholderPage title="Customers" /> },
  { path: ROUTES.TIME_SLOTS.INDEX, element: <TimeSlotsPage /> },
  { path: ROUTES.LAUNDRY_ITEMS.INDEX, element: <LaundryItemsPage /> },
  { path: ROUTES.PROFILE.INDEX, element: <ProfilePage /> },
  { path: ROUTES.SETTINGS.INDEX, element: <SettingsPage /> },
]
