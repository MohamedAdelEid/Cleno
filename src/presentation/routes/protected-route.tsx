import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/presentation/store'
import { ROUTES } from './routes.constants'

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />
  }

  return <Outlet />
}
