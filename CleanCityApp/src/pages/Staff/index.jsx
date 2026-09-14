import { NavLink, Outlet } from 'react-router-dom'
import SideNav from '../../components/layout/SideNav'
import BottomNav from '../../components/layout/BottomNav'
import { ROUTES } from '../../utils/constants'
import { useAuth } from '../../contexts/AuthContext'
import { swalWarning } from '../../utils/swal'

const mobileAdminLinks = [
  { path: ROUTES.STAFF, label: 'Dashboard' },
  { path: ROUTES.STAFF_REPORTS, label: 'Reports', permission: 'Reports.View' },
  { path: ROUTES.STAFF_CATEGORIES, label: 'Category', permission: 'Categories.View' },
  { path: ROUTES.STAFF_TEAMS, label: 'Teams', permission: 'Teams.View' },
]

export default function StaffLayout() {
  const { hasPermission, user } = useAuth()

  const handleMobileLinkClick = (e, permission) => {
    if (permission && !hasPermission(permission)) {
      e.preventDefault()
      swalWarning('Không có quyền truy cập', 'Bạn không có quyền sử dụng chức năng này.')
    }
  }

  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <SideNav />

      <main className="md:ml-16 lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-40 flex flex-col gap-3 px-6 md:px-8 py-3 bg-surface/95 backdrop-blur-xl border-b border-outline-variant/15">
          <div className="flex justify-between items-center gap-6">
            <div className="flex flex-col">
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button className="p-2 text-primary hover:bg-surface-variant rounded-lg transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
              </button>
              <div className="h-10 w-10 rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img
                    alt={user.fullName || 'Admin'}
                    className="w-full h-full object-cover"
                    src={user.avatarUrl}
                    onError={e => { e.target.onerror = null; e.target.style.display = 'none' }}
                  />
                ) : (
                  <span className="text-on-surface-variant text-sm font-bold select-none">
                    {user?.fullName?.[0]?.toUpperCase() ?? 'A'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-3 overflow-x-auto">
            {mobileAdminLinks.map(({ path, label, permission }) => {
              const allowed = !permission || hasPermission(permission)
              return (
                <NavLink
                  key={path}
                  to={path}
                  end={path === ROUTES.STAFF}
                  onClick={(e) => handleMobileLinkClick(e, permission)}
                  className={({ isActive }) =>
                    isActive
                      ? 'shrink-0 px-4 py-2 rounded-full bg-primary text-on-primary font-bold text-sm'
                      : `shrink-0 px-4 py-2 rounded-full font-semibold text-sm border ${allowed ? 'bg-surface-container-lowest text-primary border-outline-variant/30' : 'bg-surface-container-lowest text-on-surface-variant/50 border-outline-variant/20'}`
                  }
                >
                  {label}
                </NavLink>
              )
            })}
          </div>
        </header>

        <div className="px-6 md:px-8 py-8 pb-28 md:pb-12">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
