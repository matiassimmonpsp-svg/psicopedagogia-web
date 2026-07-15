'use client'

import Image from 'next/image'
import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import type { Resource } from '@/lib/data'

interface ResourcePreviewProps {
  resource: Resource
  imgError: boolean
  setImgError: (error: boolean) => void
}

export function ResourcePreview({ resource, imgError, setImgError }: ResourcePreviewProps) {
  const { previewPath, title, resourceType } = resource
  const hasCustomPreview = previewPath !== '/previews/placeholder.svg' && !imgError

  return (
    <div className="aspect-[3/4] bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border border-gray-100">
      {hasCustomPreview ? (
        <Image
          src={previewPath}
          alt={title}
          fill
          className="object-cover"
          onError={() => setImgError(true)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="text-center p-6">
          <BookOpen size={56} className="mx-auto text-primary-400 mb-3" />
          <p className="text-sm text-gray-500 font-medium">
            {resource.resourceType === 'educational' ? 'Material Educativo' : 'Evaluación'}
          </p>
        </div>
      )}
    </div>
  )
}