'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Download, BookOpen, Lock, ShoppingCart, Clock, Loader2, Shield, Check, Sparkles, Edit3, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { formatClp, hasActivePromo, downloadFile } from '@/lib/utils'

/** Interfaz para el recurso detallado (respuesta de /api/resources/[id]) */
interface ResourceDetail {
  id: string
  title: string
  description: string
  previewPath: string
  filePath: string
  editablePath: string | null
  priceClp: number | null
  resourceType: string
  courseId: number
  promoFreeUntil: string | null
  isFree: boolean
  isOwned: boolean
  isActive: boolean
  course?: { name: string; slug: string }
  area?: { name: string; slug: string }
  tags?: Array<{ tag?: { name: string }; name?: string }>
}

/** Página de detalle de un recurso individual */
export default function ResourceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addItem, items: cartItems } = useCart()
  const [resource, setResource] = useState<ResourceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/resources/${params.id}`)
        const data = await res.json()
        setResource(data.resource)
      } catch (err) {
        console.error('Error al cargar recurso:', err)
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
      courseName: resource.course?.name || '',
    })
    if (err) { toast.error(err); return }
    setAddedToCart(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={resource.course ? `/cursos/${resource.course.slug}` : '/'} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft size={14} /> Volver a {resource.course?.name || 'recursos'}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="aspect-[3/4] bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border border-gray-100">
            {previewPath !== '/previews/placeholder.svg' && !imgError ? (
              <img src={previewPath} alt={title} className="w-full h-full object-cover" onError={() => setImgError(true)} />
            ) : (
              <div className="text-center p-6">
                <BookOpen size={56} className="mx-auto text-primary-400 mb-3" />
                <p className="text-sm text-gray-500 font-medium">{resourceType === 'educational' ? 'Material Educativo' : 'Evaluación'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div>
            {resource.course && (
              <p className="text-sm text-primary-600 font-medium mb-1">{resource.course.name}</p>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-2 leading-relaxed break-words">{description}</p>
          </div>

          {resource.tags && Array.isArray(resource.tags) && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((t, i) => {
                const tagName = t.tag?.name || t.name || ''
                return tagName ? <span key={i} className="badge bg-gray-100 text-gray-600 text-xs">{tagName}</span> : null
              })}
            </div>
          )}



          <div className="border-t border-gray-200 pt-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200">
              {resource.isActive === false ? (
                <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/50 p-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
                      <AlertTriangle size={22} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-amber-900">Recurso en revisión</p>
                      <p className="text-sm text-amber-700 mt-1.5 leading-relaxed">
                        {resource.isOwned
                          ? 'Ya tienes acceso a este recurso. Volverá a estar disponible pronto.'
                          : 'Este recurso se está actualizando. Vuelve a revisar más adelante.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {promoActive ? (
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Precio</p>
                        <p className="text-xl font-bold text-amber-600 flex items-center gap-2">
                          <Clock size={20} /> Gratis por tiempo limitado
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Promoción válida hasta {promoFreeUntil ? new Date(promoFreeUntil).toLocaleDateString('es-CL') : ''}
                        </p>
                      </div>
                    </div>
                  ) : isFree ? (
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Precio</p>
                        <p className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                          <Sparkles size={20} /> Gratuito
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-sm"><Sparkles size={14} /> Gratuito</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Precio</p>
                        <p className="text-2xl font-bold text-indigo-600">{formatClp(price)}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-indigo-700 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 text-sm">
                        ${Number(price).toLocaleString('es-CL')} CLP
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    {isFree || promoActive || resource.isOwned ? (
                      <>
                        <button
                          onClick={() => handleDownload()}
                          disabled={downloading}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 active:scale-[0.97] transition-all shadow-lg shadow-primary-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex-1"
                        >
                          {downloading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Download size={18} />
                          )}
                          {downloading ? 'Descargando...' : 'Descargar PDF'}
                        </button>
                        {editablePath && (
                          <button
                            onClick={() => handleDownload('editable')}
                            disabled={downloading}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-amber-700 bg-amber-50 border-2 border-amber-200 rounded-2xl hover:bg-amber-100 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-1"
                          >
                            <Edit3 size={18} />
                            Descargar {editableExt || 'Editable'}
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {addedToCart ? (
                          <Link
                            href="/carrito"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 active:scale-[0.97] transition-all shadow-lg shadow-primary-200 flex-1"
                          >
                            <ShoppingCart size={18} /> Ir al carrito
                          </Link>
                        ) : (
                          <button
                            onClick={handleAddToCart}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 active:scale-[0.97] transition-all shadow-lg shadow-primary-200 flex-1"
                          >
                            <ShoppingCart size={18} /> Agregar al carrito
                          </button>
                        )}
                        {addedToCart && (
                          <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-200 flex-1">
                            <Check size={16} /> Agregado al carrito
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {resource.isOwned && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-xl px-4 py-2.5 border border-emerald-200">
                      <Check size={12} />
                      <span>Ya comprado. Acceso vitalicio a este recurso.</span>
                    </div>
                  )}

                  {!isFree && !promoActive && !resource.isOwned && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 bg-white/60 rounded-xl px-4 py-2.5">
                      <Lock size={12} />
                      <span>Recurso premium. Pago único, acceso vitalicio.</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {!user && !resource.isOwned && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200 text-sm text-blue-700">
              <p>Inicia sesión para {isFree || promoActive ? 'descargar' : 'comprar'} este recurso.</p>
              <Link href="/login" className="font-semibold underline mt-1.5 inline-block">Iniciar sesión</Link>
            </div>
          )}


        </div>
      </div>
    </div>
  )
}
