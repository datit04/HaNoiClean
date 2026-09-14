import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ROUTES } from '../../utils/constants'
import { swalWarning } from '../../utils/swal'

/**
 * Chỉ cho phép vào khu vực quản trị nếu tài khoản có ít nhất một quyền.
 * User thường (công dân) không có quyền nào → bị chặn và thông báo ngay.
 */
export default function RequireStaff({ children }) {
  const { permissions, loading } = useAuth()
  const navigate = useNavigate()

  const isStaff = permissions.length > 0

  useEffect(() => {
    if (!loading && !isStaff) {
      swalWarning('Không có quyền truy cập', 'Tài khoản của bạn không có quyền vào khu vực quản trị.')
      navigate(ROUTES.MAP, { replace: true })
    }
  }, [loading, isStaff, navigate])

  if (loading || !isStaff) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant">
        Đang kiểm tra quyền...
      </div>
    )
  }

  return children
}
