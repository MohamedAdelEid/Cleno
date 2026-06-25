import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/presentation/layouts/dashboard-layout'
import { AuthLayout } from '@/presentation/layouts/auth-layout'
import { LoginPage } from '@/presentation/pages/auth/login-page'
import { RegisterPage } from '@/presentation/pages/auth/register-page'
import { OverviewPage } from '@/presentation/pages/admin/overview-page'
import { OrdersPage } from '@/presentation/pages/admin/orders'
import { AddRolePage, EditRolePage, RolesPage } from '@/presentation/pages/admin/roles'
import {
  AddCompanyPage,
  CompaniesPage,
  CompanyDetailsPage,
  EditCompanyPage,
} from '@/presentation/pages/admin/companies'
import { LaundryOperationsPage, LaundryIncidentsPage } from '@/presentation/pages/admin/laundry'
import { OperationalBagsPage } from '@/presentation/pages/admin/operational-bags'
import { DashboardPlaceholderPage } from '@/presentation/pages/dashboard/dashboard-placeholder-page'
import { NotFoundPage } from '@/presentation/pages/not-found-page'
import { PublicRoute } from './public-route'
import { ROUTES } from './routes.constants'

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <Navigate to={ROUTES.AUTH.LOGIN} replace />,
  },
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.AUTH.LOGIN, element: <LoginPage /> },
          { path: ROUTES.AUTH.REGISTER, element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    // element: <ProtectedRoute />,
    // children: [
    //   {
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.DASHBOARD.HOME, element: <OverviewPage /> },
      {
        path: ROUTES.USERS.INDEX,
        element: <DashboardPlaceholderPage title="Users" />,
      },
      {
        path: ROUTES.ROLES.INDEX,
        element: <RolesPage />,
      },
      {
        path: ROUTES.ROLES.NEW,
        element: <AddRolePage />,
      },
      {
        path: ROUTES.ROLES.EDIT,
        element: <EditRolePage />,
      },
      {
        path: ROUTES.BRANCHES.INDEX,
        element: <DashboardPlaceholderPage title="Branches" />,
      },
      {
        path: ROUTES.ORDERS.INDEX,
        element: <OrdersPage />,
      },
      {
        path: ROUTES.LAUNDRY.INDEX,
        element: <LaundryOperationsPage />,
      },
      {
        path: ROUTES.LAUNDRY.INCIDENTS,
        element: <LaundryIncidentsPage />,
      },
      {
        path: ROUTES.OPERATIONAL_BAGS.INDEX,
        element: <OperationalBagsPage />,
      },
      {
        path: ROUTES.COMPANIES.INDEX,
        element: <CompaniesPage />,
      },
      {
        path: ROUTES.COMPANIES.NEW,
        element: <AddCompanyPage />,
      },
      {
        path: ROUTES.COMPANIES.EDIT,
        element: <EditCompanyPage />,
      },
      {
        path: ROUTES.COMPANIES.DETAILS,
        element: <CompanyDetailsPage />,
      },
      {
        path: ROUTES.CUSTOMERS.INDEX,
        element: <DashboardPlaceholderPage title="Customers" />,
      },
      {
        path: ROUTES.SETTINGS.INDEX,
        element: <DashboardPlaceholderPage title="Settings" />,
      },
    ],
    // },
    // ],
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFoundPage />,
  },
])
