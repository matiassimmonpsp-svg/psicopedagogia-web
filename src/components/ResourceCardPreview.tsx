'use client'

import Image from 'next/image'
import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import type { Resource } from '@/lib/data'

interface ResourceCardPreviewProps {
  resource: Resource
  isPaused: boolean
  isPriority?: boolean
  children?: React.ReactNode
}

/** Vista previa de imagen de la tarjeta */
export function ResourceCardPreview({ resource, isPaused, isPriority, children }: ResourceCardPreviewProps) {
  const [imgError, setImgError] = useState(false)

  const hasCustomPreview = resource.previewPath && resource.previewPath !== '/previews/placeholder.svg' && !imgError

  return (
    <div className="aspect-[3/4] relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100">
      {hasCustomPreview ? (
        <Image
          src={resource.previewPath}
          alt={resource.title}
          fill
          className="object-cover"
          priority={isPriority}
          onError={() => setImgError(true)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="text-center p-4">
          <BookOpen size={40} className="mx-auto text-primary-400 mb-2" />
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            {resource.resourceType === 'educational' ? 'Material' : 'Evaluación'}
          </p>
        </div>
      )}

      {isPaused && <div className="absolute inset-0 bg-black/50 z-[1]" />}

      {children}
    </div>
  )
}