'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { Edit, Pause, Play, Trash2 } from 'lucide-react'
import type { Resource } from '@/lib/data'
import { csrfFetch } from '@/lib/csrf-client'
import { logger } from '@/lib/logger'
import { ConfirmDialog } from '@/components/ConfirmDialog'

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!isAdmin) return null

  async function handleToggleActive(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    try {
      const res = await csrfFetch(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
    setShowDeleteConfirm(true)
  }

  async function confirmDelete() {
    setShowDeleteConfirm(false)
    if (!resource) return
    try {
      const res = await csrfFetch(`/api/resources/${resource.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al eliminar')
      onUpdate?.()
    } catch (err) {
      logger.error('Error al eliminar recurso', { error: err, resourceId: resource.id })
      toast.error(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  return (
    <>
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Eliminar recurso"
        message={`¿Estás seguro de que deseas eliminar "${resource.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      <div className="absolute bottom-0 left-0 right-0 flex gap-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-[3]">
        <button
          type="button"
          data-admin-action
          aria-label={`Editar ${resource.title}`}
          onClick={e => { e.preventDefault(); e.stopPropagation(); router.push(`/admin/editar-recurso/${resource.id}`) }}
          className="flex-1 bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-medium py-2 rounded-bl flex items-center justify-center gap-1 hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors border-r border-gray-200"
        >
          <Edit size={12} /> Editar
        </button>
        <button type="button" data-admin-action data-testid="toggle-active" aria-label={isPaused ? `Reanudar ${resource.title}` : `Pausar ${resource.title}`} onClick={handleToggleActive} className="flex-1 bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-medium py-2 flex items-center justify-center gap-1 hover:bg-amber-50 hover:text-amber-700 focus:bg-amber-50 focus:text-amber-700 transition-colors border-r border-gray-200">
          {isPaused ? <Play size={12} /> : <Pause size={12} />} {isPaused ? 'Reanudar' : 'Pausar'}
        </button>
        <button type="button" data-admin-action data-testid="delete-resource" aria-label={`Eliminar ${resource.title}`} onClick={handleDelete} className="flex-1 bg-white/95 backdrop-blur-sm text-red-600 text-xs font-medium py-2 rounded-br flex items-center justify-center gap-1 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 transition-colors">
          <Trash2 size={12} /> Eliminar
        </button>
      </div>
    </>
  )
}