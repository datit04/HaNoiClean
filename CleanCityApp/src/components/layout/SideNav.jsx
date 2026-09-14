import { Link, NavLink } from 'react-router-dom'
import { ROUTES } from '../../utils/constants'
import { useAuth } from '../../contexts/AuthContext'
import { swalWarning } from '../../utils/swal'

const topLinks = [
  { path: ROUTES.STAFF, label: 'Dashboard', icon: 'dashboard' },
  { path: ROUTES.STAFF_ROLES, label: 'Quyền', icon: 'admin_panel_settings', permission: 'Roles.View' },
  { path: ROUTES.STAFF_REPORTS, label: 'Báo cáo', icon: 'description', permission: 'Reports.View' },
  { path: ROUTES.STAFF_CATEGORIES, label: 'Danh mục', icon: 'category', permission: 'Categories.View' },
  { path: ROUTES.STAFF_TEAMS, label: 'Nhóm', icon: 'group', permission: 'Teams.View' },
  { path: ROUTES.STAFF_ACCOUNTS, label: 'Tài khoản', icon: 'person', permission: 'Users.View' },
]

const bottomLinks = [
  { path: ROUTES.MAP, label: 'Map', icon: 'map' },
]

export default function SideNav() {
  const { hasPermission } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-screen flex flex-col gap-2 z-50 hidden md:flex
      md:w-16 lg:w-64
      md:p-2 lg:p-4
      bg-[#eff6e7] dark:bg-emerald-900/10
      transition-[width,padding] duration-300 ease-in-out">

      {/* Brand – visible only on lg+ */}
      <div className="mb-6 px-2 hidden lg:block">
        <h1 className="text-xl font-bold text-[#206223] dark:text-[#acf4a4] font-headline">
          Ha Noi Xanh
        </h1>
      </div>

      {/* Logo icon – visible only on md (icon-only mode) */}
      <div className="mb-6 flex items-center justify-center lg:hidden">
        <span className="material-symbols-outlined text-[#206223] text-2xl" aria-hidden="true">eco</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {topLinks.map(({ path, label, icon, permission }) => {
          const allowed = !permission || hasPermission(permission)
          const handleClick = (e) => {
            if (!allowed) {
              e.preventDefault()
              swalWarning('Không có quyền truy cập', 'Bạn không có quyền sử dụng chức năng này.')
            }
          }
          return (
            <NavLink
              key={label}
              to={path}
              end={path === ROUTES.STAFF}
              title={label}
              onClick={handleClick}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center justify-center lg:justify-start gap-3 md:px-3 lg:px-4 py-3 bg-[#206223] text-white rounded-xl shadow-lg shadow-[#206223]/10 transition-colors duration-200 ease-out'
                  : `flex items-center justify-center lg:justify-start gap-3 md:px-3 lg:px-4 py-3 transition-colors duration-200 ease-out rounded-xl ${allowed ? 'text-[#6b4f45] hover:bg-[#dee5d6]' : 'text-[#6b4f45]/50 hover:bg-[#dee5d6]/50 cursor-not-allowed'}`
              }
            >
              <span className="material-symbols-outlined flex-shrink-0" aria-hidden="true">{icon}</span>
              <span className="font-medium text-sm hidden lg:inline">{label}</span>
              {!allowed && (
                <span className="material-symbols-outlined text-xs hidden lg:inline ml-auto opacity-50" title="Không có quyền">lock</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-[#bfcaba]/15">
        {bottomLinks.map(({ path, label, icon }) => (
          <Link
            key={label}
            to={path}
            title={label}
            className="flex items-center justify-center lg:justify-start gap-3 md:px-3 lg:px-4 py-2 text-[#6b4f45] hover:bg-[#dee5d6] rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined flex-shrink-0" aria-hidden="true">{icon}</span>
            <span className="font-medium text-sm hidden lg:inline">{label}</span>
          </Link>
        ))}
      </div>
    </aside>
  )
}
