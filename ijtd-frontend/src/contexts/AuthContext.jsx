// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      fetchMe(token)
        .then(setUser)
        .catch(() => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token') })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const fetchMe = async (token) => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Invalid token')
    return res.json()
  }

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Login failed')
    }
    const data = await res.json()
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    setUser(data.user)
    return data.user
  }

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }, [])

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token')
    if (!refresh) { logout(); return null }
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${refresh}` },
      })
      if (!res.ok) throw new Error('Refresh failed')
      const data = await res.json()
      localStorage.setItem('access_token', data.access_token)
      return data.access_token
    } catch {
      logout()
      return null
    }
  }

  const isAdmin    = user?.role === 'admin'
  const isEditor   = user?.role === 'admin' || user?.role === 'editor'
  const isReviewer = ['admin', 'editor', 'reviewer'].includes(user?.role)

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, refreshToken,
      isAdmin, isEditor, isReviewer,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}