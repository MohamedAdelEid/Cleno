import { RouterProvider } from 'react-router-dom'
import { AppProvider } from '@/presentation/providers'
import { router } from '@/presentation/routes/router'

export const App = () => (
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>
)
