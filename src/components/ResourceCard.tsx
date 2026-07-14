'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, memo } from 'react'
import toast from 'react-hot-toast'
import { Download, Coffee, BookOpen, Clock, Edit, Pause, Play, Trash2 } from 'lucide-react'
import type { Resource } from '@/lib/data'
import { formatClp, hasActivePromo } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

/** Tarjeta de recurso reutilizada en catálogo, admin y detalle */
interface ResourceCardProps {
  resource: Resource
  onUpdate?: () => void
  onUpdateResource?: (id: string, updates: Partial<Resource>) => void
}

export const ResourceCard = memo(function ResourceCard({ resource, onUpdate, onUpdateResource }: ResourceCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const isAdmin = user?.role === 'admin'
  const promoActive = hasActivePromo(resource)
  const [imgError, setImgError] = useState(false)

  const isPaused = resource.isActive === false
  const hasCustomPreview = resource.previewPath && resource.previewPath !== '/previews/placeholder.svg' && !imgError

  function handleCardClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest('[data-admin-action]')) return
    router.push(`/recurso/${resource.id}`)
  }

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
      console.error('Error al cambiar estado del recurso:', err)
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
      console.error('Error al eliminar recurso:', err)
      toast.error(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  return (
    <div
      className="card overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') router.push(`/recurso/${resource.id}`) }}
    >
      <div className="aspect-[3/4] relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100">
        {hasCustomPreview ? (
          <Image src={resource.previewPath} alt={resource.title} fill className="object-cover" onError={() => setImgError(true)} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
        ) : (
          <div className="text-center p-4">
            <BookOpen size={40} className="mx-auto text-primary-400 mb-2" />
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{resource.resourceType === 'educational' ? 'Material' : 'Evaluación'}</p>
          </div>
        )}

        {isPaused && <div className="absolute inset-0 bg-black/50 z-[1]" />}

        {resource.isOwned ? (
          <span className="absolute top-2 right-2 bg-emerald-500 text-white badge text-xs flex items-center gap-1 z-[2]">
            <Download size={12} /> Ya comprado
          </span>
        ) : promoActive ? (
          <span className="absolute top-2 right-2 bg-amber-500 text-white badge text-xs flex items-center gap-1 z-[2]">
            <Clock size={12} /> Promo
          </span>
        ) : resource.isFree ? (
          <span className="absolute top-2 right-2 badge-green text-xs z-[2]">Gratis</span>
        ) : (
          <span className="absolute top-2 right-2 badge-orange text-xs z-[2]">Premium</span>
        )}

        {isAdmin && isPaused && (
          <span className="absolute top-2 left-2 bg-red-500 text-white badge text-xs z-[2]">En pausa</span>
        )}

        {isAdmin && (
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
        )}
      </div>
      <div className={`p-4 ${isPaused ? 'opacity-40' : ''}`}>
        <p className="text-xs text-primary-600 font-medium mb-1">{resource.courseName}</p>
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{resource.title}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{resource.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {resource.tags?.slice(0, 3).map(t => (
            <span key={t} className="badge bg-gray-100 text-gray-600 text-[10px]">{t}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Download size={12} />
            {resource.downloadsCount}
          </div>
          <span className="font-bold text-sm">
            {resource.isOwned ? (
              <span className="text-emerald-600 flex items-center gap-1"><Download size={14} /> Ya comprado</span>
            ) : promoActive ? (
              <span className="text-amber-600 flex items-center gap-1"><Clock size={14} /> Promo</span>
            ) : resource.isFree ? (
              <span className="text-green-600 flex items-center gap-1"><Coffee size={14} /> Gratuito</span>
            ) : (
              <span className="text-primary-600">{formatClp(resource.priceClp!)}</span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
})
