'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { Edit, Pause, Play, Trash2 } from 'lucide-react'
import type { Resource } from '@/lib/data'
import { logger } from '@/lib/logger'

interface ResourceCardAdminActionsProps {
  resource: Resource
  isPaused: boolean
  onUpdate?: () => void
  onUpdateResource?: (id: string, updates: Partial<Resource>) => void
}

/** Acciones de admin (editar, pausar/reanudar, eliminar) - visible solo en hover del padre */
export function ResourceCardAdminActions({ resource, isPaused, onUpdate, onUpdateResource }: ResourceCardAdminActionsProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const router = useRouter()

  if (!isAdmin) return null

  async function handleToggleActive(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    try {
      const res = await fetch(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !resource.isActive }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cambiar estado')
      if (!data.resource) throw new Error('Respuesta inválida del servidor')
      toast.success(!resource.isActive ? 'Recurso reanudado' : 'Recurso pausado')
      if (onUpdateResource) {
        onUpdateResource(resource.id, { isActive: !resource.isActive } as Partial<Resource>)
      } else {
        onUpdate?.()
      }
    } catch (err) {
      logger.error('Error al cambiar estado del recurso', { error: err, resourceId: resource.id })
      toast.error(err instanceof Error ? err.message : 'Error al cambiar estado')
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`¿Eliminar "${resource.title}"?`)) return
    try {
      const res = await fetch(`/api/resources/${resource.id}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al eliminar')
      onUpdate?.()
    } catch (err) {
      logger.error('Error al eliminar recurso', { error: err, resourceId: resource.id })
      toast.error(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  return (
    <div data-admin-action className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[3]">
      <button
        type="button"
        data-admin-action
        onClick={e => { e.preventDefault(); e.stopPropagation(); router.push(`/admin/editar-recurso/${resource.id}`) }}
        className="flex-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium py-1.5 rounded flex items-center justify-center gap-1 hover:bg-blue-50 hover:text-blue-700 transition-colors"
      >
        <Edit size={12} /> Editar
      </button>
      <button type="button" data-admin-action onClick={handleToggleActive} className="flex-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium py-1.5 rounded flex items-center justify-center gap-1 hover:bg-amber-50 hover:text-amber-700 transition-colors">
        {isPaused ? <Play size={12} /> : <Pause size={12} />} {isPaused ? 'Reanudar' : 'Pausar'}
      </button>
      <button type="button" data-admin-action onClick={handleDelete} className="flex-1 bg-white/90 backdrop-blur-sm text-red-600 text-xs font-medium py-1.5 rounded flex items-center justify-center gap-1 hover:bg-red-50 hover:text-red-700 transition-colors">
        <Trash2 size={12} /> Eliminar
      </button>
    </div>
  )
}