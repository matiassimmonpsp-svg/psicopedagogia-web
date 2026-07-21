'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Edit3, Pause, Play, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useCatalog } from '@/lib/hooks'
import { hasActivePromo, downloadFile, generateSlug } from '@/lib/utils'
import { logger } from '@/lib/logger'
import type { Resource } from '@/lib/data'
import { ResourcePreview } from '@/components/ResourceDetailPreview'
import { ResourcePriceSection } from '@/components/ResourcePriceSection'
import { csrfFetch } from '@/lib/csrf-client'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export default function ResourceDetailPageClient() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addItem, items: cartItems } = useCart()
  const { refresh } = useCatalog()
  const [resource, setResource] = useState<Resource | null>(null)
  const [areaIsActive, setAreaIsActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/resources/${params.id}`)
        const data = await res.json()
        // Transforma la respuesta anidada de la API a Resource plano
        const api = data.resource
        if (api) {
          setAreaIsActive(api.areaIsActive ?? true)
          setResource({
            id: api.id,
            title: api.title,
            description: api.description,
            previewPath: api.previewPath,
            filePath: api.filePath,
            editablePath: api.editablePath ?? null,
            priceClp: api.priceClp,
            resourceType: api.resourceType,
            courseId: api.courseId,
            areaId: api.areaId ?? 0,
            subareaId: api.subareaId ?? null,
            downloadsCount: api.downloadsCount ?? 0,
            promoFreeUntil: api.promoFreeUntil ?? null,
            isFree: api.isFree,
            isOwned: api.isOwned ?? false,
            isActive: api.isActive ?? true,
            courseName: api.course?.name || '',
            courseSlug: api.course?.slug || '',
            areaName: api.area?.name || '',
            areaSlug: api.area?.slug || '',
            tags: Array.isArray(api.tags) ? api.tags.map((t: { tag?: { name: string }; name?: string }) => t.tag?.name || t.name || '') : [],
            source: 'db',
          })
        }
      } catch (err) {
        logger.error('Error al cargar recurso', { error: err })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  useEffect(() => {
    if (resource && cartItems.some(i => i.id === resource.id)) {
      setAddedToCart(true)
    }
  }, [resource, cartItems])


  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
  if (!resource) return <div className="max-w-5xl mx-auto px-4 py-8"><p className="text-gray-500">Recurso no encontrado</p></div>

  const { title, description, previewPath, filePath, editablePath, priceClp, resourceType, courseId, promoFreeUntil, isFree } = resource
  const promoActive = hasActivePromo(resource)
  const price = priceClp ?? 0
  const isAdmin = user?.role === 'admin'
  const isPaused = resource.isActive === false
  const isAreaPaused = areaIsActive === false

  const handleDownload = async (type?: string) => {
    if (!user) { router.push('/login'); return }
    setDownloading(true)
    try {
      const url = type ? `/api/download/${resource.id}?type=${type}` : `/api/download/${resource.id}`
      const ext = type === 'editable' && editablePath ? '.' + editablePath.split('.').pop() : '.pdf'
      await downloadFile(url, `${generateSlug(title)}${ext}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('Debes comprar')) { toast.error(message); return }
      if (message) { toast.error(message); return }
      toast.error('Error de conexión al descargar')
    } finally { setDownloading(false) }
  }

  const editableExt = editablePath ? editablePath.split('.').pop()?.toUpperCase() : null

  async function handleAddToCart() {
    if (!user) { router.push('/login'); return }
    if (!resource) return
    const err = await addItem({
      id: resource.id,
      title: resource.title,
      priceClp: price ?? 0,
      courseName: resource.courseName,
    })
    if (err) { toast.error(err); return }
    setAddedToCart(true)
  }

  async function handleToggleActive() {
    if (!resource) return
    try {
      const res = await csrfFetch(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !resource.isActive }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cambiar estado')
      setResource({ ...resource, isActive: !resource.isActive })
      refresh()
      toast.success(!resource.isActive ? 'Recurso reanudado' : 'Recurso pausado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar estado')
    }
  }

  async function handleDelete() {
    if (!resource) return
    setShowDeleteConfirm(true)
  }

  async function confirmDelete() {
    if (!resource) return
    setShowDeleteConfirm(false)
    try {
      const res = await csrfFetch(`/api/resources/${resource.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      toast.success('Recurso eliminado')
      router.push('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  return (
    <div data-testid="resource-detail" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Eliminar recurso"
        message={`¿Estás seguro de que deseas eliminar "${resource.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      <Link href={resource.courseSlug ? `/cursos/${resource.courseSlug}` : '/'} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft size={14} /> Volver a {resource.courseName || 'recursos'}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <ResourcePreview
            resource={resource}
            imgError={imgError}
            setImgError={setImgError}
            isAdmin={isAdmin}
          >
            {isAdmin && (
              <div className="absolute bottom-0 left-0 right-0 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[3]">
                <button
                  onClick={() => router.push(`/admin/editar-recurso/${resource.id}`)}
                  className="flex-1 bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-medium py-2.5 flex items-center justify-center gap-1 hover:bg-blue-50 hover:text-blue-700 transition-colors border-r border-gray-200"
                >
                  <Edit3 size={14} /> Editar
                </button>
                <button
                  onClick={handleToggleActive}
                  className={`flex-1 backdrop-blur-sm text-xs font-medium py-2.5 flex items-center justify-center gap-1 transition-colors border-r border-gray-200 ${
                    isPaused
                      ? 'bg-white/95 text-green-700 hover:bg-green-50 hover:text-green-700'
                      : 'bg-white/95 text-amber-700 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />} {isPaused ? 'Reanudar' : 'Pausar'}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-white/95 backdrop-blur-sm text-red-600 text-xs font-medium py-2.5 flex items-center justify-center gap-1 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            )}
          </ResourcePreview>
        </div>

        <ResourcePriceSection
          resource={resource}
          downloading={downloading}
          onDownload={handleDownload}
          onAddToCart={handleAddToCart}
          addedToCart={addedToCart}
          areaIsActive={areaIsActive}
        />
      </div>
    </div>
  )
}