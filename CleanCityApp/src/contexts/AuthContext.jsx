import { createContext, useContext, useState, useEffect } from 'react'
import {
  getProfile,
  login as loginApi,
  logout as logoutApi,
  normalizeProfileResponse,
  register as registerApi,
  normalizeAuthResponse,
} from '../services/authService'
import { clearAuthSession, persistAuthToken, readAuthToken } from '../services/authStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = readAuthToken()
    if (token) {
      getProfile()
        .then((res) => {
          setUser(normalizeProfileResponse(res.data))
          setIsAuthenticated(true)
        })
        .catch(() => {
          clearAuthSession()
          setUser(null)
          setIsAuthenticated(false)
        })
        .finally(() => setLoading(false))
    } else {
      setIsAuthenticated(false)
      setUser(null)
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const res = await loginApi(credentials)
    const auth = normalizeAuthResponse(res.data)

    if (!auth.accessToken) {
      throw new Error('Phan hoi dang nhap khong chua access token')
    }

    persistAuthToken(auth.accessToken)
    setUser(auth.user || null)
    setIsAuthenticated(true)

    if (!auth.user) {
      try {
        const profileRes = await getProfile()
        setUser(normalizeProfileResponse(profileRes.data))
      } catch {
        // Keep authenticated state if backend does not expose profile endpoint
      }
    }

    return auth
  }

  const register = async (data) => {
    return registerApi(data)
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch {
      // Some backends do not implement an explicit logout endpoint.
    }
    clearAuthSession()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
