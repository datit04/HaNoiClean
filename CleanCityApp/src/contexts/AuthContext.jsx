import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getProfile,
  login as loginApi,
  logout as logoutApi,
  normalizeProfileResponse,
  register as registerApi,
  normalizeAuthResponse,
} from '../services/authService'
import { clearAuthSession, persistAuthToken, readAuthToken } from '../services/authStorage'
import permissionApi from '../services/permissionApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [permissions, setPermissions] = useState([])

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await permissionApi.getMyPermissions()
      const raw = res.data
      // Unwrap: backend có thể trả về mảng trực tiếp hoặc { data: [] } / { result: [] }
      const perms = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.result)
            ? raw.result
            : []
      setPermissions(perms)
    } catch (err) {
      console.error('[AuthContext] fetchPermissions failed:', err)
      setPermissions([])
    }
  }, [])

  useEffect(() => {
    const token = readAuthToken()
    if (token) {
      getProfile()
        .then(async (res) => {
          setUser(normalizeProfileResponse(res.data))
          setIsAuthenticated(true)
          await fetchPermissions()
        })
        .catch(() => {
          clearAuthSession()
          setUser(null)
          setIsAuthenticated(false)
          setPermissions([])
        })
        .finally(() => setLoading(false))
    } else {
      setIsAuthenticated(false)
      setUser(null)
      setPermissions([])
      setLoading(false)
    }
  }, [])

  const matchesPerm = useCallback(
    (p) => {
      if (permissions.includes(p)) return true
      // Group wildcard: 'Categories.*' matches any 'Categories.xxx'
      if (p.endsWith('.*')) {
        const group = p.slice(0, -1) // 'Categories.'
        return permissions.some((pp) => pp.startsWith(group))
      }
      return false
    },
    [permissions],
  )

  const hasPermission = useCallback(
    (perm) => {
      if (!perm) return true
      if (Array.isArray(perm)) return perm.some((p) => matchesPerm(p))
      return matchesPerm(perm)
    },
    [matchesPerm],
  )

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

    await fetchPermissions()

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
    setPermissions([])
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated, permissions, hasPermission, refreshPermissions: fetchPermissions }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
