import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AuthUser, AuthResponse } from '../types'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  saveAuth: (res: AuthResponse) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,  setUser]  = useState<AuthUser | null>(loadUser)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

  const saveAuth = useCallback((res: AuthResponse) => {
    const authUser: AuthUser = { userId: res.userId, name: res.name, email: res.email }
    localStorage.setItem('token', res.token)
    localStorage.setItem('user',  JSON.stringify(authUser))
    setToken(res.token)
    setUser(authUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, saveAuth, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
