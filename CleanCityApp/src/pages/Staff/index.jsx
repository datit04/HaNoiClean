import { NavLink, Outlet } from 'react-router-dom'
import SideNav from '../../components/layout/SideNav'
import BottomNav from '../../components/layout/BottomNav'
import { ROUTES } from '../../utils/constants'
import { useAuth } from '../../contexts/AuthContext'

const mobileAdminLinks = [
  { path: ROUTES.STAFF, label: 'Dashboard' },
  { path: ROUTES.STAFF_REPORTS, label: 'Reports', permission: 'Reports.View' },
  { path: ROUTES.STAFF_CATEGORIES, label: 'Category', permission: 'Categories.View' },
  { path: ROUTES.STAFF_TEAMS, label: 'Teams', permission: 'Teams.View' },
]

export default function StaffLayout() {
  const { hasPermission } = useAuth()

  const visibleMobileLinks = mobileAdminLinks.filter(({ permission }) => hasPermission(permission))

  return (
    <div className="text-on-surface bg-[#f5fced] min-h-screen">
      <SideNav />

      <main className="md:ml-64 min-h-screen">
        <header className="sticky top-0 z-40 flex flex-col gap-5 px-6 md:px-8 py-6 bg-[#f5fced]/95 backdrop-blur-xl border-b border-[#bfcaba]/15">
          <div className="flex justify-between items-center gap-6">
            <div className="flex flex-col">
              <p className="text-xs font-bold text-tertiary uppercase tracking-[0.3em]">Admin Workspace</p>
              <h2 className="text-2xl md:text-3xl font-black text-[#206223] tracking-tighter font-headline uppercase">
                Hanoi CleanCity
              </h2>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button className="p-2 text-[#206223] hover:bg-[#dee5d6] rounded-lg transition-all relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
              </button>
              <div className="h-10 w-10 rounded-full overflow-hidden bg-surface-container-highest">
                <img
                  alt="Admin"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDE9a40ugoy0PggwkCKoV2BHHemecWMK7HBJmzX561-o9gTSRXiayAprPBl4P3p7LMepuo04wWI1TSuUrd4PF6oUTzQBn2zTK87gtuOOTZPU6T5LWTgiAbq-rO6ND9SCozNsmBkfGa1_WwqYyURhYGCTJLx_weCqU0vlf1BRscnb4HQJQRlwdQDtRLwgIyEGNwMr9FC6_9GGgj-kCPilj1mlIozVr2k2sP0_coU2d91N8sHEshC4iT9FY4TiF_8cnGfhOsmhWmnCxal"
                />
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-3 overflow-x-auto">
            {visibleMobileLinks.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                end={path === ROUTES.STAFF}
                className={({ isActive }) =>
                  isActive
                    ? 'shrink-0 px-4 py-2 rounded-full bg-[#206223] text-white font-bold text-sm'
                    : 'shrink-0 px-4 py-2 rounded-full bg-white text-[#206223] font-semibold border border-[#bfcaba]/30'
                }
              >
                {label}
              </NavLink>
            ))}
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
