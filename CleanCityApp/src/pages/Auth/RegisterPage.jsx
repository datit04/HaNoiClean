import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthShell from './AuthShell'
import { ROUTES } from '../../utils/constants'
import { useAuth } from '../../contexts/AuthContext'
import { parseApiError } from '../../utils/apiError'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({ userName: '', email: '', password: '' })
  const [successMessage, setSuccessMessage] = useState('')

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!form.userName.trim() || !form.email.trim() || !form.password) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin.')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setErrorMessage('Email không hợp lệ.')
      return
    }

    setSubmitting(true)
    try {
      await register({
        fullName: '',
        userName: form.userName.trim(),
        email: form.email.trim(),
        password: form.password,
      })

      setSuccessMessage('Đăng ký thành công! Đang chuyển sang trang đăng nhập...')
      setTimeout(() => {
        navigate(ROUTES.LOGIN, {
          replace: true,
          state: { justRegistered: true, username: form.userName.trim() },
        })
      }, 1800)
    } catch (error) {
      setErrorMessage(parseApiError(error, 'Đăng ký thất bại, vui lòng thử lại.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Đăng ký"
      subtitle="Tạo tài khoản để gửi báo cáo và theo dõi xử lý"
      footerText="Đã có tài khoản?"
      footerActionLabel="Đăng nhập ngay"
      footerActionTo={ROUTES.LOGIN}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {errorMessage && (
          <div className="rounded-xl px-4 py-3 bg-error-container text-on-error-container text-sm font-medium flex items-start gap-2">
            <span className="material-symbols-outlined text-error text-base mt-0.5">error</span>
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="rounded-xl px-4 py-3 bg-success-container text-on-success-container text-sm font-medium flex items-start gap-2">
            <span className="material-symbols-outlined text-success text-base mt-0.5">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">Tên đăng nhập</label>
          <input
            type="text"
            value={form.userName}
            onChange={(e) => updateField('userName', e.target.value)}
            placeholder="nguyenvana"
            autoComplete="username"
            className="w-full px-4 py-3.5 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="example@hanoi.vn"
            autoComplete="off"
            className="w-full px-4 py-3.5 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">Mật khẩu</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full px-4 py-3.5 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-4 px-6 shadow-primary/20 hover:opacity-95"
        >
          {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
      </form>
    </AuthShell>
  )
}
