'use client'

import Link from 'next/link'
import { Clock, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { formatClp, hasActivePromo } from '@/lib/utils'
import type { Resource } from '@/lib/data'
import { ResourcePausedBanner } from '@/components/ResourcePausedBanner'

interface ResourcePriceSectionProps {
  resource: Resource
  downloading: boolean
  onDownload: (type?: string) => Promise<void>
  onAddToCart: () => Promise<void>
  addedToCart: boolean
}

export function ResourcePriceSection({ resource, downloading, onDownload, onAddToCart, addedToCart }: ResourcePriceSectionProps) {
  const { user } = useAuth()

  const { title, description, editablePath, priceClp, promoFreeUntil, isFree, isOwned, isActive, courseName, tags } = resource
  const promoActive = hasActivePromo(resource)
  const price = priceClp ?? 0
  const editableExt = editablePath ? editablePath.split('.').pop()?.toUpperCase() : null

  return (
    <div className="md:col-span-2 space-y-6">
      <div>
        {courseName && (
          <p className="text-sm text-primary-600 font-medium mb-1">{courseName}</p>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-2 leading-relaxed break-words">{description}</p>
      </div>

      {tags && Array.isArray(tags) && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tagName: string, i: number) => {
            return tagName ? <span key={i} className="badge bg-gray-100 text-gray-600 text-xs">{tagName}</span> : null
          })}
        </div>
      )}

      <div className="border-t border-gray-200 pt-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200">
          {isActive === false ? (
            <ResourcePausedBanner resource={resource} />
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
                {isFree || promoActive || isOwned ? (
                  <>
                    <button
                      onClick={() => onDownload()}
                      disabled={downloading}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 active:scale-[0.97] transition-all shadow-lg shadow-primary-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex-1"
                    >
                      {downloading ? (
                        <svg className="animate-spin" width={18} height={18} viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      ) : (
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                      )}
                      {downloading ? 'Descargando...' : 'Descargar PDF'}
                    </button>
                    {editablePath && (
                      <button
                        onClick={() => onDownload('editable')}
                        disabled={downloading}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-amber-700 bg-amber-50 border-2 border-amber-200 rounded-2xl hover:bg-amber-100 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-1"
                      >
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
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
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                        Ir al carrito
                      </Link>
                    ) : (
                      <button
                        onClick={onAddToCart}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 active:scale-[0.97] transition-all shadow-lg shadow-primary-200 flex-1"
                      >
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                        Agregar al carrito
                      </button>
                    )}
                    {addedToCart && (
                      <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-200 flex-1">
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                        Agregado al carrito
                      </div>
                    )}
                  </>
                )}
              </div>

              {isOwned && (
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-xl px-4 py-2.5 border border-emerald-200">
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  <span>Ya comprado. Acceso vitalicio a este recurso.</span>
                </div>
              )}

              {!isFree && !promoActive && !isOwned && (
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 bg-white/60 rounded-xl px-4 py-2.5">
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <span>Recurso premium. Pago único, acceso vitalicio.</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!user && !isOwned && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200 text-sm text-blue-700">
          <p>Inicia sesión para {isFree || promoActive ? 'descargar' : 'comprar'} este recurso.</p>
          <Link href="/login" className="font-semibold underline mt-1.5 inline-block">Iniciar sesión</Link>
        </div>
      )}
    </div>
  )
}
