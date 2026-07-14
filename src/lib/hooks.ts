import useSWR from 'swr'
import { useCallback, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import type { Resource } from '@/lib/data'
import { useAuth } from '@/context/AuthContext'

/** Fetcher que incluye cookies de sesión para autenticación */
const fetcher = (url: string) => fetch(url, { credentials: 'include', cache: 'no-store' }).then(r => r.json())

/** Hook para obtener datos del catálogo con caché SWR y refresh manual */
export function useCatalog() {
  const { user } = useAuth()
  const swrKey = user ? `/api/catalog?u=${user.id}` : '/api/catalog'
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  const updateResource = useCallback((id: string, updates: Partial<Resource>) => {
    mutate((current: any) => {
      if (!current?.resources) return current
      return {
        ...current,
        resources: current.resources.map((r: Resource) =>
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
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return
    try {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al eliminar')
      refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }, [refresh])

  const handleToggleActive = useCallback(async (id: string, current: boolean | undefined) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

interface Course {
  id: number
  name: string
  slug: string
  sortOrder: number
}

interface Area {
  id: number
  name: string
  slug: string
  sortOrder: number
}

interface Subarea {
  id: number
  name: string
  slug: string
  areaId: number
}

/** Hook para obtener cursos, áreas y subáreas desde la base de datos */
export function useCoursesData() {
  const [courses, setCourses] = useState<Course[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [subareas, setSubareas] = useState<Subarea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/courses')
        if (!res.ok) throw new Error('Error al cargar datos')
        const data = await res.json()
        setCourses(data.courses || [])
        setAreas(data.areas || [])
        setSubareas(data.subareas || [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { courses, areas, subareas, loading, error }
}
