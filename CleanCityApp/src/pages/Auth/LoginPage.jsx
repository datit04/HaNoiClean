import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from './AuthShell'
import { ROUTES } from '../../utils/constants'
import { useAuth } from '../../contexts/AuthContext'
import { parseApiError } from '../../utils/apiError'

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({ username: '', password: '' })
  const [rememberMe, setRememberMe] = useState(false)

  const returnPath = useMemo(() => location.state?.from || ROUTES.CITIZEN, [location.state])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(returnPath, { replace: true })
    }
  }, [isAuthenticated, loading, navigate, returnPath])

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!form.username.trim() || !form.password) {
      setErrorMessage('Vui lòng nhập đầy đủ tài khoản và mật khẩu.')
      return
    }

    setSubmitting(true)
    try {
      await login({ username: form.username.trim(), password: form.password, rememberMe })
      navigate(returnPath, { replace: true })
    } catch (error) {
      setErrorMessage(parseApiError(error, 'Đăng nhập thất bại, vui lòng thử lại.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Chào mừng bạn trở lại với hệ thống Hanoi CleanCity"
      heroTitle="Bảo tồn vẻ đẹp Hà Nội, bắt đầu từ hành động nhỏ"
      heroDescription="Hệ thống tiếp nhận và điều phối báo cáo môi trường cho cộng đồng dân cư và cán bộ quản lý."
      footerText="Chưa có tài khoản?"
      footerActionLabel="Đăng ký ngay"
      footerActionTo={ROUTES.REGISTER}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {errorMessage && (
          <div className="rounded-xl px-4 py-3 bg-error-container text-on-error-container text-sm font-medium flex items-start gap-2">
            <span className="material-symbols-outlined text-error text-base mt-0.5">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-semibold text-on-surface-variant">Tên đăng nhập</label>
          <input
            id="username"
            type="text"
            name="username"
            value={form.username}
            onChange={(e) => updateField('username', e.target.value)}
            placeholder="nguyenvana"
            autoComplete="username"
            spellCheck={false}
            className="w-full px-5 py-4 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-on-surface-variant">Mật khẩu</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-5 py-4 pr-12 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="rounded border-outline-variant text-primary focus:ring-primary/30"
            />
            Ghi nhớ tôi
          </label>
          <Link to={ROUTES.REGISTER} className="text-sm font-bold text-secondary hover:underline underline-offset-4">
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-4 text-base shadow-primary/20 hover:opacity-95"
        >
          {submitting ? 'Đang xử lý…' : 'Đăng nhập'}
        </button>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            type="button"
            aria-label="Đăng nhập với Google"
            className="py-3 rounded-xl border border-outline-variant/40 text-sm font-semibold hover:bg-surface-container-low"
          >
            Google
          </button>
          <button
            type="button"
            aria-label="Đăng nhập với Facebook"
            className="py-3 rounded-xl border border-outline-variant/40 text-sm font-semibold hover:bg-surface-container-low"
          >
            Facebook
          </button>
        </div>
      </form>
    </AuthShell>
  )
}
