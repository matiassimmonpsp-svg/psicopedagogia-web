import useSWR from 'swr'
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { csrfFetch } from '@/lib/csrf-client'
import { useAuth } from '@/context/AuthContext'
import type { Resource, Course, Area, Subarea } from '@/lib/interfaces'

/** Fetcher que incluye cookies de sesión para autenticación y verifica res.ok */
const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error || `Error ${res.status}`)
  }
  return res.json()
}

interface CatalogData {
  resources: Resource[]
}

/** Hook para obtener datos del catálogo con caché SWR y refresh manual */
export function useCatalog() {
  const { user } = useAuth()
  const swrKey = user ? `/api/catalog?limit=200&u=${user.id}` : '/api/catalog?limit=200'
  const { data, error, isLoading, mutate } = useSWR<CatalogData>(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  const updateResource = useCallback((id: string, updates: Partial<Resource>) => {
    mutate((current) => {
      if (!current?.resources) return current
      return {
        ...current,
        resources: current.resources.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        ),
      }
    }, { revalidate: false })
  }, [mutate])

  return {
    resources: data?.resources || [],
    loading: isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
    updateResource,
  }
}

/**
 * Hook compartido para acciones de admin sobre recursos.
 * Elimina la duplicación de handleDelete y handleToggleActive
 * entre admin/page.tsx, admin/recursos/page.tsx y ResourceCard.tsx
 */
export function useResourceActions(refresh: () => void) {
  const handleDelete = useCallback(async (id: string, title: string) => {
    try {
      const res = await csrfFetch(`/api/resources/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al eliminar')
      refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }, [refresh])

  const handleToggleActive = useCallback(async (id: string, current: boolean | undefined) => {
    try {
      const res = await csrfFetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !(current ?? true) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cambiar estado')
      if (!data.resource) throw new Error('Respuesta inválida del servidor')
      toast.success(current ? 'Recurso pausado' : 'Recurso reanudado')
      refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar estado')
    }
  }, [refresh])

  return { handleDelete, handleToggleActive }
}

interface CoursesData {
  courses: Course[]
  areas: Area[]
  subareas: Subarea[]
}

/** Hook para obtener cursos, áreas y subáreas desde la base de datos */
export function useCoursesData() {
  const { data, error, isLoading } = useSWR<CoursesData>('/api/courses', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300_000,
  })

  return {
    courses: data?.courses || [],
    areas: data?.areas || [],
    subareas: data?.subareas || [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Error desconocido') : null,
  }
}
