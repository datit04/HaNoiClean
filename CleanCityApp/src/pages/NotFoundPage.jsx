import { Link } from 'react-router-dom'
import { ROUTES } from '../utils/constants'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center p-8 bg-surface">
      <span className="material-symbols-outlined text-7xl text-outline">search_off</span>
      <div>
        <h1 className="text-5xl font-extrabold text-on-surface mb-2">404</h1>
        <p className="text-xl font-bold text-on-surface mb-1">Trang không tồn tại</p>
        <p className="text-on-surface-variant text-sm">Đường dẫn bạn truy cập không hợp lệ hoặc đã bị xóa.</p>
      </div>
      <Link
        to={ROUTES.MAP}
        className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-colors"
      >
        Về trang chủ
      </Link>
    </div>
  )
}
