import type { RouteObject } from 'react-router-dom'
import { AuthLayout } from '@/presentation/layouts/auth-layout'
import { LoginPage } from '@/presentation/pages/auth/login-page'
import { RegisterPage } from '@/presentation/pages/auth/register-page'
import { PublicRoute } from '../guards/public-route'
import { ROUTES } from '../routes.constants'

export const authRoutes: RouteObject = {
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
}
