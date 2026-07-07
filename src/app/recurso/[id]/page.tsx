'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, BookOpen, Lock, ShoppingCart, Coffee, Clock, AlertTriangle, Loader2, Shield, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { formatClp, hasActivePromo } from '@/lib/utils'

export default function ResourceDetail() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [resource, setResource] = useState<any>(null)
  const [dbResource, setDbResource] = useState<any>(null)
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
        console.error('Error loading resource:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  useEffect(() => {
    if (!resource) return
    const fetchDbResource = async () => {
      try {
        const res = await fetch(`/api/resources/${resource.id}/db`)
        if (res.ok) {
          const dbData = await res.json()
          setDbResource(dbData)
        }
      } catch {}
    }
    fetchDbResource()
  }, [resource])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
  if (!resource) return <div className="max-w-5xl mx-auto px-4 py-8"><p className="text-gray-500">Recurso no encontrado</p></div>

  const { title, description, previewPath, filePath, priceClp, resourceType, courseId, promoFreeUntil, isFree } = resource
  const promoActive = hasActivePromo(resource)
  const price = priceClp

  const handleDownload = async () => {
    if (!user) { router.push('/login'); return }
    setDownloading(true)
    try {
      const res = await fetch(`/api/download/${resource.id}`)
      if (res.status === 401) { router.push('/login'); return }
      if (res.status === 403) { alert('Debes comprar este recurso para descargarlo'); return }
      if (!res.ok) { const err = await res.json(); alert(err.error || 'Error al descargar'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.replace(/[^a-z0-9]+/gi, '-')}.pdf`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch { alert('Error de conexión al descargar') }
    finally { setDownloading(false) }
  }

  function handleAddToCart() {
    if (!user) { router.push('/login'); return }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const alreadyInCart = cart.some((i: any) => i.id === resource.id)
    if (!alreadyInCart) {
      cart.push({
        id: resource.id,
        title: resource.title,
        priceClp: price,
        courseName: resource.course?.name || '',
      })
      localStorage.setItem('cart', JSON.stringify(cart))
    }
    setAddedToCart(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={resource.course ? `/cursos/${resource.course.slug}` : '/'} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft size={14} /> Volver a {resource.course?.name || 'recursos'}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="aspect-[3/4] bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 rounded-xl flex items-center justify-center overflow-hidden">
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
            <p className="text-gray-600 mt-2 leading-relaxed">{description}</p>
          </div>

          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((t: any) => {
                const tagName = typeof t === 'string' ? t : t.tag?.name || t.name
                return <span key={tagName} className="badge bg-gray-100 text-gray-600 text-xs">{tagName}</span>
              })}
            </div>
          )}

          {dbResource && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Descargas</p>
                <p className="text-lg font-semibold text-gray-900">{dbResource.downloadsCount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Páginas</p>
                <p className="text-lg font-semibold text-gray-900">{dbResource.pages || '-'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Formato</p>
                <p className="text-lg font-semibold text-gray-900">{dbResource.format || 'PDF'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Nivel</p>
                <p className="text-lg font-semibold text-gray-900">{dbResource.level || '-'}</p>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {promoActive ? (
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Precio</p>
                    <p className="text-xl font-bold text-amber-600 flex items-center gap-2">
                      <Clock size={20} /> Gratis por tiempo limitado
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Promoción válida hasta {new Date(promoFreeUntil).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                </div>
              ) : isFree ? (
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Precio</p>
                    <p className="text-xl font-bold text-green-600 flex items-center gap-2">
                      <Coffee size={20} /> Gratuito
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Precio</p>
                    <p className="text-2xl font-bold text-primary-600">{formatClp(price)}</p>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Shield size={12} /> Pago seguro
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {isFree || promoActive ? (
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                  >
                    {downloading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                    {downloading ? 'Descargando...' : 'Descargar PDF'}
                  </button>
                ) : (
                  <>
                    {addedToCart ? (
                      <Link
                        href="/carrito"
                        className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={18} /> Ir al carrito
                      </Link>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={18} /> Agregar al carrito
                      </button>
                    )}
                    {addedToCart && (
                      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                        <Check size={16} /> Agregado
                      </div>
                    )}
                  </>
                )}
              </div>

              {!isFree && !promoActive && (
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <Lock size={12} />
                  <span>Recurso premium. Compra única, acceso vitalicio.</span>
                </div>
              )}
            </div>
          </div>

          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p>Inicia sesión para {isFree || promoActive ? 'descargar' : 'comprar'} este recurso.</p>
              <Link href="/login" className="font-medium underline mt-1 inline-block">Iniciar sesión</Link>
            </div>
          )}

          {promoFreeUntil && new Date(promoFreeUntil) > new Date() && (
            <div className="flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertTriangle size={16} className="text-amber-500" />
              <span className="text-amber-700 font-medium">Promoción: gratis hasta {new Date(promoFreeUntil).toLocaleDateString('es-CL')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
