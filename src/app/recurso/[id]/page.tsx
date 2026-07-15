'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Download, BookOpen, Lock, ShoppingCart, Loader2, Shield, Check, Sparkles, Edit3, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { formatClp, hasActivePromo, downloadFile } from '@/lib/utils'
import { logger } from '@/lib/logger'
import type { Resource } from '@/lib/data'
import { ResourcePreview } from '@/components/ResourceDetailPreview'
import { ResourcePausedBanner } from '@/components/ResourcePausedBanner'
import { ResourcePriceSection } from '@/components/ResourcePriceSection'

/** Página de detalle de un recurso individual */
export default function ResourceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addItem, items: cartItems } = useCart()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/resources/${params.id}`)
        const data = await res.json()
        // Transforma la respuesta anidada de la API a Resource plano
        const api = data.resource
        if (api) {
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

  const handleDownload = async (type?: string) => {
    if (!user) { router.push('/login'); return }
    setDownloading(true)
    try {
      const url = type ? `/api/download/${resource.id}?type=${type}` : `/api/download/${resource.id}`
      const ext = type === 'editable' && editablePath ? '.' + editablePath.split('.').pop() : '.pdf'
      await downloadFile(url, `${title.replace(/[^a-z0-9]+/gi, '-')}${ext}`)
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={resource.courseSlug ? `/cursos/${resource.courseSlug}` : '/'} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft size={14} /> Volver a {resource.courseName || 'recursos'}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <ResourcePreview
            resource={resource}
            imgError={imgError}
            setImgError={setImgError}
          />
        </div>

        <ResourcePriceSection
          resource={resource}
          downloading={downloading}
          onDownload={handleDownload}
          onAddToCart={handleAddToCart}
          addedToCart={addedToCart}
        />
      </div>
    </div>
  )
}