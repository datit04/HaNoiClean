import axios from 'axios'
import { clearAuthSession, readAuthToken } from './authStorage'

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

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const shouldSkipAuthRedirect = error.config?.skipAuthRedirect

    if (error.response?.status === 401 && !shouldSkipAuthRedirect) {
      clearAuthSession()
      window.location.href = '/trang-chu'
    }
    return Promise.reject(error)
  }
)

export default api
