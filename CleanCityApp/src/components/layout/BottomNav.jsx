import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { path: '/trang-chu', label: 'Home', icon: 'home' },
  { path: '/ban-do', label: 'Map', icon: 'location_on' },
  { path: '/nguoi-dan', label: 'Report', icon: 'add_circle' },
  { path: '/can-bo', label: 'Profile', icon: 'person' },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-[#f5fced]/80 dark:bg-emerald-950/90 backdrop-blur-2xl rounded-t-[2rem] shadow-[0_-12px_32px_rgba(23,29,20,0.06)] border-t border-[#bfcaba]/15">
      {navLinks.map(({ path, label, icon }) => (
        <Link
          key={path}
          to={path}
          className={
            pathname === path
              ? 'flex flex-col items-center justify-center bg-[#acf4a4] dark:bg-[#206223] text-[#206223] dark:text-[#acf4a4] rounded-2xl px-6 py-2 transition-transform active:scale-90'
              : 'flex flex-col items-center justify-center text-[#6b4f45] dark:text-emerald-200/50 hover:opacity-80 transition-transform active:scale-90'
          }
        >
          <span className="material-symbols-outlined">{icon}</span>
          <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest mt-1">
            {label}
          </span>
        </Link>
      ))}
    </nav>
  )
}
