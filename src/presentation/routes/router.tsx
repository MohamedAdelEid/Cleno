import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/presentation/layouts/dashboard-layout'
import { NotFoundPage } from '@/presentation/pages/not-found-page'
import { adminRoutes } from './admin/admin.routes'
import { authRoutes } from './auth/auth.routes'
import { ROUTES } from './routes.constants'

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <Navigate to={ROUTES.AUTH.LOGIN} replace />,
  },
  authRoutes,
  {
    // element: <ProtectedRoute />,
    // children: [
    //   {
    element: <DashboardLayout />,
    children: adminRoutes,
    // },
    // ],
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFoundPage />,
  },
])
