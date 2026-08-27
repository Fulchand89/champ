import { createBrowserRouter } from 'react-router-dom'
import AdminRoutes from './AdminRoutes'
import PublicRoutes from './PublicRoutes'
import NotFound from '../pages/NotFound'

const router = createBrowserRouter([
  ...PublicRoutes,
  AdminRoutes,
  {
    path: '*',
    element: <NotFound />
  }
])

export default router