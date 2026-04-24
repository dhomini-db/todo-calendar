import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { AuthUser, AuthResponse } from '../types'
import { getProfile } from '../api/tasks'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  saveAuth: (res: AuthResponse) => void
  updateUser: (partial: Partial<AuthUser>) => void
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
    const authUser: AuthUser = {
      userId: res.userId,
      name: res.name,
      email: res.email,
      profileImageUrl: res.profileImageUrl ?? null,
    }
    localStorage.setItem('token', res.token)
    localStorage.setItem('user',  JSON.stringify(authUser))
    setToken(res.token)
    setUser(authUser)
  }, [])

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...partial }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  // ── Sync: refresh profile from server on every app load ──────
  // Ensures that a photo updated on another device/browser is picked up
  // immediately without needing to re-login.
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) return
    getProfile()
      .then(profile => {
        setUser(prev => {
          if (!prev) return prev
          const updated: AuthUser = {
            ...prev,
            name:            profile.name,
            email:           profile.email,
            profileImageUrl: profile.profileImageUrl ?? null,
          }
          localStorage.setItem('user', JSON.stringify(updated))
          return updated
        })
      })
      .catch(() => { /* silently ignore — offline or token expired */ })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])   // run once on mount

  return (
    <AuthContext.Provider value={{ user, token, saveAuth, updateUser, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
