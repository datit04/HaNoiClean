import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationsDropdown from '../common/NotificationsDropdown';
import { useTranslation } from 'react-i18next';
import { swalSuccess, swalError } from '../../utils/swal';
import { ROUTES } from '../../utils/constants';

const FLAG_VN = (
  <svg viewBox="0 0 30 20" className="w-6 h-4 rounded-sm shadow-sm flex-shrink-0" aria-hidden>
    <rect width="30" height="20" fill="#DA251D"/>
    <polygon points="15,4 16.8,9.5 22.5,9.5 17.9,12.9 19.7,18.4 15,15 10.3,18.4 12.1,12.9 7.5,9.5 13.2,9.5" fill="#FFFF00"/>
  </svg>
)
const FLAG_EN = (
  <svg viewBox="0 0 60 30" className="w-6 h-4 rounded-sm shadow-sm flex-shrink-0" aria-hidden>
    <rect width="60" height="30" fill="#012169"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
    <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10"/>
    <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6"/>
  </svg>
)

const NAV_PATHS = [
  { path: ROUTES.MAP, key: 'nav.map' },
  { path: ROUTES.COMMUNITY, key: 'nav.community' },
  { path: ROUTES.CITIZEN, key: 'nav.reports' },
  { path: ROUTES.STAFF, key: 'nav.manage' },
]

export default function TopNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef();
  const mobileMenuRef = useRef();
  const { isAuthenticated, logout, hasPermission } = useAuth();
  const isStaff = hasPermission(['Reports.View', 'Users.View', 'Categories.View', 'Teams.View', 'Roles.View']);
  const [message, setMessage] = useState("");
  const { t, i18n } = useTranslation();
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef();
  const { notifications, unreadCount, markRead } = useNotifications();

  React.useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleClick(e) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
      setMobileMenuOpen(false);
      swalSuccess(t('nav.logout_success'));
      navigate('/ban-do');
    } catch (error) {
      swalError(t('nav.logout_error') || 'Đăng xuất thất bại.');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#f5fced] dark:bg-emerald-950/80 backdrop-blur-xl">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-8xl mx-auto">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link
            to="/ban-do"
            className="text-xl lg:text-2xl font-black text-[#206223] dark:text-[#acf4a4] tracking-tighter font-headline"
          >
            Ha Noi Xanh
          </Link>
          <div className="hidden md:flex items-center md:gap-3 lg:gap-6 font-headline font-bold tracking-tight">
            {NAV_PATHS.filter(({ path }) => path !== '/can-bo' || isStaff).map(({ path, key }) => (
              <Link
                key={path}
                to={path}
                className={
                  pathname === path
                    ? 'text-[#206223] dark:text-[#acf4a4] border-b-2 border-[#206223] dark:border-[#acf4a4] pb-1'
                    : 'text-[#171d14] dark:text-emerald-100/70 hover:text-[#206223] transition-colors'
                }
              >
                {t(key)}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 relative">
          {message && (
            <div className="absolute right-0 top-full mt-2 bg-green-100 text-green-800 px-4 py-2 rounded shadow z-[70] animate-fadeIn">
              {message}
            </div>
          )}
          <button
            onClick={toggleLang}
            title={i18n.language === 'vi' ? 'Switch to English' : 'Chuyen sang Tieng Viet'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#dee5d6] dark:hover:bg-emerald-800/50 transition-colors active:scale-95"
          >
            {i18n.language === 'vi' ? FLAG_VN : FLAG_EN}
            <span className="text-xs font-bold text-[#206223] dark:text-[#acf4a4] hidden sm:inline">
              {i18n.language === 'vi' ? 'VI' : 'EN'}
            </span>
          </button>

          {isAuthenticated ? (
            <>
              <div className="relative" ref={notifRef}>
                <button
                  aria-label={t('nav.notifications')}
                  onClick={() => setNotifOpen((v) => !v)}
                  className="p-2 hover:bg-[#dee5d6] dark:hover:bg-emerald-800/50 rounded-lg transition-colors active:scale-95 relative"
                >
                  <span className="material-symbols-outlined text-[#206223] dark:text-[#acf4a4]">
                    notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-error text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <NotificationsDropdown
                    notifications={notifications}
                    onClose={() => setNotifOpen(false)}
                    markRead={markRead}
                  />
                )}
              </div>
              <button
                className="hidden md:block p-2 hover:bg-[#dee5d6] dark:hover:bg-emerald-800/50 rounded-lg transition-colors active:scale-95"
                onClick={() => setOpen((v) => !v)}
                aria-label={t('nav.account')}
              >
                <span className="material-symbols-outlined text-[#206223] dark:text-[#acf4a4]">
                  account_circle
                </span>
              </button>
              {open && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full w-56 bg-white rounded-xl shadow-xl border border-outline-variant/20 py-2 z-[60] overflow-hidden animate-fadeIn"
                  style={{ marginTop: 8 }}
                >
                  <button
                    className="block w-full text-left px-4 py-3 hover:bg-[#f5fced] text-on-surface-variant font-medium"
                    onClick={() => { setOpen(false); navigate('/profile'); }}
                  >{t('nav.account_info')}</button>
                  <button
                    className="block w-full text-left px-4 py-3 hover:bg-[#f5fced] text-on-surface-variant font-medium"
                    onClick={() => { setOpen(false); }}
                  >{t('nav.change_password')}</button>
                  <button
                    className="block w-full text-left px-4 py-3 hover:bg-[#f5fced] text-error font-medium"
                    onClick={handleLogout}
                  >{t('nav.logout')}</button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link
                to="/dang-nhap"
                className="hidden md:inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-bold leading-none text-primary border-2 border-primary hover:bg-primary hover:text-white transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/dang-ky"
                className="hidden md:inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-bold leading-none text-white bg-primary hover:bg-primary-container transition-colors"
              >
                {t('nav.register')}
              </Link>
            </>
          )}

          {/* Hamburger - mobile only */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#dee5d6] dark:hover:bg-emerald-800/50 transition-colors active:scale-95"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-[#206223] dark:text-[#acf4a4]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden absolute left-0 right-0 top-full bg-[#f5fced] dark:bg-emerald-950/95 backdrop-blur-xl border-t border-[#bfcaba]/20 shadow-xl z-[55] animate-fadeIn"
        >
          <div className="px-6 py-4 space-y-1">
            {NAV_PATHS.filter(({ path }) => path !== '/can-bo' || isStaff).map(({ path, key }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                  pathname === path
                    ? 'bg-[#206223] text-white'
                    : 'text-[#171d14] dark:text-emerald-100 hover:bg-[#dee5d6] dark:hover:bg-emerald-800/50'
                }`}
              >
                {t(key)}
              </Link>
            ))}
            <div className="border-t border-[#bfcaba]/20 pt-3 mt-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <button
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-[#171d14] dark:text-emerald-100 hover:bg-[#dee5d6] dark:hover:bg-emerald-800/50 transition-colors"
                    onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }}
                  >
                    <span className="material-symbols-outlined text-base">account_circle</span>
                    {t('nav.account_info')}
                  </button>
                  <button
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-error hover:bg-error-container transition-colors"
                    onClick={handleLogout}
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/dang-nhap"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-primary border border-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/dang-ky"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary-container transition-colors"
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}