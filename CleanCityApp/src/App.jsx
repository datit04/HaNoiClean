import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TrangChu from './pages/TrangChu'
import NguoiDan from './pages/NguoiDan'
import CanBo from './pages/CanBo'
import CanBoDashboardPage from './pages/CanBo/DashboardPage'
import CanBoCategoriesPage from './pages/CanBo/CategoriesPage'
import CanBoTeamsPage from './pages/CanBo/TeamsPage'
import CanBoReportsPage from './pages/CanBo/ReportsPage'
import RolesPage from './pages/CanBo/RolesPage'
import BanDo from './pages/BanDo'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import RequireAuth from './components/common/RequireAuth'
import { ROUTES } from './utils/constants'
import ProfilePage from './pages/Profile/ProfilePage'
import EditProfilePage from './pages/Profile/EditProfilePage'
import AccountsPage from './pages/CanBo/AccountsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.HOME} replace />} />
        <Route path={ROUTES.HOME} element={<TrangChu />} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/profile/edit" element={<RequireAuth><EditProfilePage /></RequireAuth>} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route
          path={ROUTES.CITIZEN}
          element={
            <RequireAuth>
              <NguoiDan />
            </RequireAuth>
          }
        />
        <Route
          path={ROUTES.STAFF}
          element={
            <RequireAuth>
              <CanBo />
            </RequireAuth>
          }
        >
          <Route index element={<CanBoDashboardPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="reports" element={<CanBoReportsPage />} />
          <Route path="categories" element={<CanBoCategoriesPage />} />
          <Route path="teams" element={<CanBoTeamsPage />} />
          <Route path="accounts" element={<AccountsPage />} />
        </Route>
        <Route path={ROUTES.MAP} element={<BanDo />} />
      </Routes>
    </BrowserRouter>
  )
}
