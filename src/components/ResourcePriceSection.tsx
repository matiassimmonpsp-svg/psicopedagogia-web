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
  areaIsActive?: boolean
}

export function ResourcePriceSection({ resource, downloading, onDownload, onAddToCart, addedToCart, areaIsActive = true }: ResourcePriceSectionProps) {
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
        <div data-testid="price-section" className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200">
          {isActive === false ? (
            <ResourcePausedBanner resource={resource} reason="resource" />
          ) : areaIsActive === false ? (
            <ResourcePausedBanner resource={resource} reason="area" />
          ) : (
            <>
              {promoActive ? (
                <div className="mb-5">
                  <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    <Clock size={12} /> Promoción
                  </div>
                  <p className="text-3xl font-extrabold text-amber-600">Gratis</p>
                  {promoFreeUntil && (
                    <p className="text-sm text-gray-500 mt-1">
                      Hasta el {new Date(promoFreeUntil).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              ) : isFree ? (
                <div className="mb-5">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    <Sparkles size={12} /> Gratis
                  </div>
                  <p className="text-3xl font-extrabold text-emerald-600">Sin costo</p>
                  <p className="text-sm text-gray-500 mt-1">Descarga libre sin registro</p>
                </div>
              ) : (
                <div className="mb-5">
                  <p className="text-sm text-gray-500 mb-1">Precio</p>
                  <p className="text-3xl font-extrabold text-indigo-600">{formatClp(price)} <span className="text-lg font-bold text-indigo-400">CLP</span></p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {isFree || promoActive || isOwned ? (
                  <>
                    <button
                      data-testid="download-pdf"
                      onClick={() => onDownload()}
                      disabled={downloading}
                      aria-busy={downloading}
                      aria-label={downloading ? 'Descargando PDF...' : 'Descargar PDF'}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-700 hover:to-primary-600 active:scale-[0.98] transition-all shadow-lg shadow-primary-200/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
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
                        data-testid="download-editable"
                        onClick={() => onDownload('editable')}
                        disabled={downloading}
                        aria-busy={downloading}
                        aria-label={downloading ? 'Descargando archivo editable...' : `Descargar editable (${editableExt || 'Word'})`}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-amber-700 bg-amber-50 border-2 border-amber-200 rounded-xl hover:bg-amber-100 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                        Descargar editable ({editableExt || 'Word'})
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {addedToCart ? (
                      <Link
                        href="/carrito"
                        data-testid="go-to-cart"
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl hover:from-emerald-700 hover:to-emerald-600 active:scale-[0.98] transition-all shadow-lg shadow-emerald-200/50"
                      >
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                        Ir al carrito
                      </Link>
                    ) : (
                      <button
                        data-testid="add-to-cart"
                        onClick={onAddToCart}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-700 hover:to-primary-600 active:scale-[0.98] transition-all shadow-lg shadow-primary-200/50"
                      >
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                        Agregar al carrito
                      </button>
                    )}
                    {addedToCart && (
                      <div className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                        Agregado al carrito
                      </div>
                    )}
                  </>
                )}
              </div>

              {isOwned ? (
                <div className="mt-4 flex items-center gap-2.5 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span className="font-medium">Ya tienes acceso vitalicio a este recurso</span>
                </div>
              ) : !isFree && !promoActive && (
                <div className="mt-4 flex items-center gap-2.5 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </div>
                  <span>Pago único, acceso de por vida</span>
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
