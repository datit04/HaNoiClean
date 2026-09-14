import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ROUTES } from '../../utils/constants'
import { swalWarning } from '../../utils/swal'

export default function RequirePermission({ permission, children }) {
  const { hasPermission, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !hasPermission(permission)) {
      swalWarning('Không có quyền truy cập', 'Bạn không có quyền sử dụng chức năng này.')
      navigate(ROUTES.STAFF, { replace: true })
    }
  }, [loading, hasPermission, permission, navigate])

  if (loading || !hasPermission(permission)) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant">
        Đang kiểm tra quyền...
      </div>
    )
  }

  return children
}
