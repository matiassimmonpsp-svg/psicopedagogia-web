import useSWR from 'swr'
import { useCallback } from 'react'
import toast from 'react-hot-toast'

/** Fetcher que incluye cookies de sesión para autenticación */
const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(r => r.json())

/** Hook para obtener datos del catálogo con caché SWR y refresh manual */
export function useCatalog() {
  const { data, error, isLoading, mutate } = useSWR('/api/catalog', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })
  return {
    resources: data?.resources || [],
    loading: isLoading,
    error,
    refresh: () => mutate(),
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
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
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
        body: JSON.stringify({ isActive: !(current ?? true) }),
      })
      if (!res.ok) throw new Error('Error al cambiar estado')
      refresh()
    } catch {
      toast.error('Error al cambiar estado')
    }
  }, [refresh])

  return { handleDelete, handleToggleActive }
}
