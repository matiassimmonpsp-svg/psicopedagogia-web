'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useSWRConfig } from 'swr'
import type { AuthUser } from '@/lib/auth'

/** Tipo del contexto de autenticación */
interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  register: (name: string, email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Proveedor de contexto de autenticación.
 *
 * Gestiona el estado del usuario actual, proporciona funciones para
 * login, registro, logout y refrescar la sesión. Al montarse, verifica
 * si hay una sesión activa consultando /api/auth/me. Envuelve la
 * aplicación y pone el contexto a disposición de todos los componentes hijos.
 *
 * @param children - Componentes hijos que tendrán acceso al contexto de autenticación.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { cache } = useSWRConfig()

  /**
   * Refresca el estado del usuario consultando /api/auth/me.
   * Actualiza el estado local con los datos del usuario o null si no hay sesión.
   */
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

  /**
   * Inicia sesión con email y contraseña.
   * @returns null si el login fue exitoso, o un string con el mensaje de error.
   */
  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return data.error || 'Error al iniciar sesión'
      // Limpiar caché SWR del catálogo antes de refresh para que no sirva datos del usuario anterior
      Array.from(cache.keys()).forEach(key => {
        if (typeof key === 'string' && key.startsWith('/api/catalog')) cache.delete(key)
      })
      await refresh()
      return null
    } catch {
      return 'Error de conexión'
    }
  }

  /**
   * Registra un nuevo usuario con nombre, email y contraseña.
   * @returns null si el registro fue exitoso, o un string con el mensaje de error.
   */
  const register = async (name: string, email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) return data.error || 'Error al registrarse'
      Array.from(cache.keys()).forEach(key => {
        if (typeof key === 'string' && key.startsWith('/api/catalog')) cache.delete(key)
      })
      await refresh()
      return null
    } catch {
      return 'Error de conexión'
    }
  }

  /**
   * Cierra la sesión del usuario actual.
   * Verifica que la sesión se cerró realmente antes de limpiar el estado.
   * Muestra notificaciones toast con el resultado de la operación.
   */
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
      Array.from(cache.keys()).forEach(key => {
        if (typeof key === 'string' && key.startsWith('/api/catalog')) cache.delete(key)
      })
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

/**
 * Hook para acceder al contexto de autenticación.
 * Debe usarse dentro de un AuthProvider. Lanza error si se usa fuera.
 * @returns El contexto de autenticación con usuario, estado de carga y funciones.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
