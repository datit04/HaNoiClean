import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const navLinks = [
  { path: '/ban-do', label: 'Bản đồ' },
  { path: '/nguoi-dan', label: 'Báo cáo' },
  { path: '/can-bo', label: 'Quản lý' },
]

export default function TopNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const { isAuthenticated, logout, user } = useAuth();
  const [message, setMessage] = useState("");

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

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    setMessage('Đăng xuất thành công!');
    setTimeout(() => setMessage(""), 3000);
    navigate('/ban-do');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#f5fced] dark:bg-emerald-950/80 backdrop-blur-xl">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-8xl mx-auto">
        <div className="flex items-center gap-8">
          <Link
            to="/ban-do"
            className="text-2xl font-black text-[#206223] dark:text-[#acf4a4] tracking-tighter font-headline"
          >
            Hà Nội Xanh
          </Link>
          <div className="hidden md:flex items-center gap-6 font-headline font-bold tracking-tight">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={
                  pathname === path
                    ? 'text-[#206223] dark:text-[#acf4a4] border-b-2 border-[#206223] dark:border-[#acf4a4] pb-1'
                    : 'text-[#171d14] dark:text-emerald-100/70 hover:text-[#206223] transition-colors'
                }
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 relative">
          {message && (
            <div className="absolute right-0 top-full mt-2 bg-green-100 text-green-800 px-4 py-2 rounded shadow z-[70] animate-fadeIn">
              {message}
            </div>
          )}
          {isAuthenticated ? (
            <>
              <button
                aria-label="Thông báo"
                className="p-2 hover:bg-[#dee5d6] dark:hover:bg-emerald-800/50 rounded-lg transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-[#206223] dark:text-[#acf4a4]">
                  notifications
                </span>
              </button>
              <button
                className="p-2 hover:bg-[#dee5d6] dark:hover:bg-emerald-800/50 rounded-lg transition-colors active:scale-95"
                onClick={() => setOpen((v) => !v)}
                aria-label="Tài khoản"
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
                  >Thông tin tài khoản</button>
                  <button
                    className="block w-full text-left px-4 py-3 hover:bg-[#f5fced] text-on-surface-variant font-medium"
                    onClick={() => { setOpen(false); }}
                  >Đổi mật khẩu</button>
                  <button
                    className="block w-full text-left px-4 py-3 hover:bg-[#f5fced] text-error font-medium"
                    onClick={handleLogout}
                  >Đăng xuất</button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link
                to="/dang-nhap"
                className="px-4 py-2 rounded-xl font-bold text-primary border-2 border-primary hover:bg-primary hover:text-white transition-colors mr-2"
              >
                Đăng nhập
              </Link>
              <Link
                to="/dang-ky"
                className="px-4 py-2 rounded-xl font-bold text-white bg-primary hover:bg-primary-container transition-colors"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
