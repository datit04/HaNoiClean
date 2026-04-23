import axios from 'axios'
import { clearAuthSession, readAuthToken } from './authStorage'
import Swal from 'sweetalert2'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = readAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401/403 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const shouldSkipAuthRedirect = error.config?.skipAuthRedirect

    if (error.response?.status === 401 && !shouldSkipAuthRedirect) {
      clearAuthSession()
      window.location.href = '/ban-do'
    }

    if (error.response?.status === 403) {
      Swal.fire({
        icon: 'error',
        title: 'Không có quyền truy cập',
        text: 'Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ quản trị viên.',
        confirmButtonText: 'Đã hiểu',
        confirmButtonColor: '#206223',
      })
    }

    return Promise.reject(error)
  }
)

export default api
