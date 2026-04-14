import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthShell from './AuthShell'
import { ROUTES } from '../../utils/constants'
import { useAuth } from '../../contexts/AuthContext'

function parseApiError(err, fallback = 'Đăng ký thất bại, vui lòng thử lại.') {
  const data = err?.response?.data
  if (!data) return err?.message || fallback
  if (typeof data === 'string') return data
  if (typeof data?.message === 'string') return data.message
  if (typeof data?.title === 'string') return data.title

  if (data?.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors).flat().filter(Boolean)
    if (messages.length > 0) return messages.join(' | ')
  }

  return fallback
}

function passwordStrength(password) {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1
  return Math.min(score, 3)
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  })
  const [successMessage, setSuccessMessage] = useState('')

  const strength = useMemo(() => passwordStrength(form.password), [form.password])

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    // Validate phía client
    if (!form.fullName.trim() || !form.userName.trim() || !form.email.trim() || !form.password) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin bắt buộc.')
      return
    }

    // Validate email
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setErrorMessage('Email không hợp lệ.')
      return
    }

    // Validate số điện thoại (tùy chọn, nếu nhập thì phải đúng định dạng)
    if (form.phoneNumber && !/^0\d{9,10}$/.test(form.phoneNumber.trim())) {
      setErrorMessage('Số điện thoại không hợp lệ.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.')
      return
    }

    if (!form.acceptedTerms) {
      setErrorMessage('Bạn cần đồng ý với điều khoản để tiếp tục.')
      return
    }

    setSubmitting(true)
    try {
      await register({
        fullName: form.fullName.trim(),
        userName: form.userName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
      })

      setSuccessMessage('Đăng ký thành công! Bạn sẽ được chuyển sang trang đăng nhập...')
      setTimeout(() => {
        navigate(ROUTES.LOGIN, {
          replace: true,
          state: { justRegistered: true, username: form.userName.trim() },
        })
      }, 1800)
    } catch (error) {
      // Hiển thị lỗi chi tiết từ API nếu có
      setErrorMessage(parseApiError(error, 'Đăng ký thất bại, vui lòng thử lại.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Đăng ký"
      subtitle="Tạo tài khoản mới để gửi báo cáo và theo dõi xử lý theo thời gian thực"
      heroTitle="Tham gia cộng đồng vì một Hà Nội xanh"
      heroDescription="Mỗi báo cáo của bạn giúp đội vận hành phản ứng nhanh hơn và cải thiện chất lượng sống đô thị."
      footerText="Đã có tài khoản?"
      footerActionLabel="Đăng nhập ngay"
      footerActionTo={ROUTES.LOGIN}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">Họ tên</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-3.5 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">Tên đăng nhập</label>
            <input
              type="text"
              value={form.userName}
              onChange={(e) => updateField('userName', e.target.value)}
              placeholder="nguyenvana"
              className="w-full px-4 py-3.5 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="example@hanoi.vn"
              className="w-full px-4 py-3.5 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">Số điện thoại</label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => updateField('phoneNumber', e.target.value)}
              placeholder="09xx xxx xxx"
              className="w-full px-4 py-3.5 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">Mật khẩu</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 px-1">
          <div className={`h-1 flex-grow rounded-full ${strength >= 1 ? 'bg-primary-fixed' : 'bg-surface-container-highest'}`} />
          <div className={`h-1 flex-grow rounded-full ${strength >= 2 ? 'bg-primary-fixed' : 'bg-surface-container-highest'}`} />
          <div className={`h-1 flex-grow rounded-full ${strength >= 3 ? 'bg-primary-fixed' : 'bg-surface-container-highest'}`} />
          <span className="text-[10px] font-bold text-primary ml-2 uppercase tracking-widest">
            {strength === 3 ? 'Mật khẩu tốt' : strength === 2 ? 'Trung bình' : 'Yếu'}
          </span>
        </div>

        <label className="flex items-start gap-3 py-1 text-sm text-on-surface-variant">
          <input
            type="checkbox"
            checked={form.acceptedTerms}
            onChange={(e) => updateField('acceptedTerms', e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/30"
          />
         Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật của Hanoi CleanCity.
        </label>

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
