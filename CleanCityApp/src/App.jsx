import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import CitizenPage from './pages/Citizen'
import StaffLayout from './pages/Staff'
import DashboardPage from './pages/Staff/DashboardPage'
import CategoriesPage from './pages/Staff/CategoriesPage'
import TeamsPage from './pages/Staff/TeamsPage'
import ReportsPage from './pages/Staff/ReportsPage'
import RolesPage from './pages/Staff/RolesPage'
import MapPage from './pages/Map'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import RequireAuth from './components/common/RequireAuth'
import RequirePermission from './components/common/RequirePermission'
import { ROUTES } from './utils/constants'
import ProfilePage from './pages/Profile/ProfilePage'
import EditProfilePage from './pages/Profile/EditProfilePage'
import AccountsPage from './pages/Staff/AccountsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.MAP} replace />} />
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.MAP} replace />} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/profile/edit" element={<RequireAuth><EditProfilePage /></RequireAuth>} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route
          path={ROUTES.CITIZEN}
          element={
            <RequireAuth>
              <CitizenPage />
            </RequireAuth>
          }
        />
        <Route
          path={ROUTES.STAFF}
          element={
            <RequireAuth>
              <StaffLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="roles" element={<RequirePermission permission="Roles.View"><RolesPage /></RequirePermission>} />
          <Route path="reports" element={<RequirePermission permission="Reports.View"><ReportsPage /></RequirePermission>} />
          <Route path="categories" element={<RequirePermission permission="Categories.View"><CategoriesPage /></RequirePermission>} />
          <Route path="teams" element={<RequirePermission permission="Teams.View"><TeamsPage /></RequirePermission>} />
          <Route path="accounts" element={<RequirePermission permission="Users.View"><AccountsPage /></RequirePermission>} />
        </Route>
        <Route path={ROUTES.MAP} element={<MapPage />} />
      </Routes>
    </BrowserRouter>
  )
}
