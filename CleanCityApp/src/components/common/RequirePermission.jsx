import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ROUTES } from '../../utils/constants'

export default function RequirePermission({ permission, children }) {
  const { hasPermission, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant">
        Đang kiểm tra quyền...
      </div>
    )
  }

  if (!hasPermission(permission)) {
    return <Navigate to={ROUTES.STAFF} replace />
  }

  return children
}
