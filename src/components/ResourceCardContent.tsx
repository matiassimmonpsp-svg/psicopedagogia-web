'use client'

import { Download, Coffee, BookOpen, Clock } from 'lucide-react'
import type { Resource } from '@/lib/data'
import { formatClp } from '@/lib/utils'

interface ResourceCardContentProps {
  resource: Resource
  promoActive: boolean
  isPaused: boolean
}

/** Contenido inferior de la tarjeta (curso, título, desc, tags, descargas, precio) */
export function ResourceCardContent({ resource, promoActive, isPaused }: ResourceCardContentProps) {
  return (
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
  )
}