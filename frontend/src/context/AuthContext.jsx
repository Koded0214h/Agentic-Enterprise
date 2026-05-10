import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import { auth } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (api.getAccess()) {
      auth.me()
        .then(setUser)
        .catch(() => api.clearTokens())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const tokens = await auth.login(email, password)
    api.setTokens(tokens)
    const me = await auth.me()
    setUser(me)
    return me
  }, [])

  const loginWithTokens = useCallback(async (tokens) => {
    api.setTokens(tokens)
    const me = await auth.me()
    setUser(me)
    return me
  }, [])

  const logout = useCallback(() => {
    api.clearTokens()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithTokens, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
