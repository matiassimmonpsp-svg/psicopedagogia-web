'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { AuthUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  register: (name: string, email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user || null)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return data.error || 'Error al iniciar sesión'
      await refresh()
      return null
    } catch {
      return 'Error de conexión'
    }
  }

  const register = async (name: string, email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) return data.error || 'Error al registrarse'
      await refresh()
      return null
    } catch {
      return 'Error de conexión'
    }
  }

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (!res.ok) {
        toast.error('Error al cerrar sesión')
        return
      }

      // Verificar que la sesión se cerró realmente
      const meRes = await fetch('/api/auth/me')
      const meData = await meRes.json()

      if (meData.user) {
        // Si aún devuelve usuario, algo falló
        toast.error('No se pudo cerrar la sesión completamente')
        return
      }

      setUser(null)
      toast.success('Sesión cerrada')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Error de conexión al cerrar sesión')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
