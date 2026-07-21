'use client'

import Link from 'next/link'
import { memo } from 'react'
import type { Resource } from '@/lib/data'
import { useAuth } from '@/context/AuthContext'
import { hasActivePromo } from '@/lib/utils'
import { ResourceCardPreview } from './ResourceCardPreview'
import { ResourceCardBadges } from './ResourceCardBadges'
import { ResourceCardAdminActions } from './ResourceCardAdminActions'
import { ResourceCardContent } from './ResourceCardContent'

/** Tarjeta de recurso reutilizada en catálogo, admin y detalle */
interface ResourceCardProps {
  resource: Resource
  onUpdate?: () => void
  onUpdateResource?: (id: string, updates: Partial<Resource>) => void
  isPriority?: boolean
}

export const ResourceCard = memo(function ResourceCard({ resource, onUpdate, onUpdateResource, isPriority }: ResourceCardProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const promoActive = hasActivePromo(resource)

  const isPaused = resource.isActive === false

  return (
    <Link
      href={`/recurso/${resource.id}`}
      className="card overflow-hidden group cursor-pointer block focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl"
    >
      <ResourceCardPreview resource={resource} isPaused={isPaused} isPriority={isPriority}>
        <ResourceCardAdminActions
          resource={resource}
          isPaused={isPaused}
          onUpdate={onUpdate}
          onUpdateResource={onUpdateResource}
        />
      </ResourceCardPreview>
      <ResourceCardBadges
        resource={resource}
        isPaused={isPaused}
        promoActive={promoActive}
        isAdmin={isAdmin}
      />
      <ResourceCardContent resource={resource} promoActive={promoActive} isPaused={isPaused} />
    </Link>
  )
})
