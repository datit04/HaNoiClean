import { Link, NavLink } from 'react-router-dom'
import { ROUTES } from '../../utils/constants'

const topLinks = [
  { path: ROUTES.STAFF, label: 'Dashboard', icon: 'dashboard' },
  { path: ROUTES.STAFF_ROLES, label: 'Quyền', icon: 'admin_panel_settings' },
  { path: ROUTES.STAFF_REPORTS, label: 'Báo cáo', icon: 'description' },
  { path: ROUTES.STAFF_CATEGORIES, label: 'Danh mục', icon: 'category' },
  { path: ROUTES.STAFF_TEAMS, label: 'Nhóm', icon: 'group' },
  { path: ROUTES.STAFF_ACCOUNTS, label: 'Tài khoản', icon: 'person' },
]

const bottomLinks = [
  { path: ROUTES.MAP, label: 'Bản đồ', icon: 'map' },
  { path: ROUTES.HOME, label: 'Trang chủ', icon: 'home' },
]

export default function SideNav() {
  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col p-4 gap-2 h-screen w-64 border-r-0 bg-[#eff6e7] dark:bg-emerald-900/10 z-50 hidden md:flex">
      <div className="mb-8 px-4">
        <h1 className="text-xl font-bold text-[#206223] dark:text-[#acf4a4] font-headline">
          CleanCity Admin
        </h1>
        <p className="text-xs text-[#6b4f45] font-medium">Quản trị vận hành đô thị</p>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {topLinks.map(({ path, label, icon }) => (
          <NavLink
            key={label}
            to={path}
            end={path === ROUTES.STAFF}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-4 py-3 bg-[#206223] text-white rounded-xl shadow-lg shadow-[#206223]/10 transition-all duration-200 ease-out'
                : 'flex items-center gap-3 px-4 py-3 text-[#6b4f45] hover:bg-[#dee5d6] transition-all duration-200 ease-out rounded-xl'
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="font-medium text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-[#bfcaba]/15">
        {bottomLinks.map(({ path, label, icon }) => (
          <Link
            key={label}
            to={path}
            className="flex items-center gap-3 px-4 py-2 text-[#6b4f45] hover:bg-[#dee5d6] rounded-xl transition-all"
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="font-medium text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </aside>
  )
}
