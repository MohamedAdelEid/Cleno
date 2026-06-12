import { Outlet } from 'react-router-dom'

export const AuthLayout = () => (
  <main className="h-dvh max-h-dvh overflow-y-auto">
    <Outlet />
  </main>
)
