'use client'

import { useRouter } from 'next/navigation'
import { memo } from 'react'
import type { Resource } from '@/lib/data'
import { useAuth } from '@/context/AuthContext'
import { formatClp, hasActivePromo } from '@/lib/utils'
import { ResourceCardPreview } from './ResourceCardPreview'
import { ResourceCardBadges } from './ResourceCardBadges'
import { ResourceCardAdminActions } from './ResourceCardAdminActions'
import { ResourceCardContent } from './ResourceCardContent'

/** Tarjeta de recurso reutilizada en catálogo, admin y detalle */
interface ResourceCardProps {
  resource: Resource
  onUpdate?: () => void
  onUpdateResource?: (id: string, updates: Partial<Resource>) => void
}

export const ResourceCard = memo(function ResourceCard({ resource, onUpdate, onUpdateResource }: ResourceCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const isAdmin = user?.role === 'admin'
  const promoActive = hasActivePromo(resource)

  const isPaused = resource.isActive === false

  function handleCardClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest('[data-admin-action]')) return
    router.push(`/recurso/${resource.id}`)
  }

  return (
    <div
      className="card overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') router.push(`/recurso/${resource.id}`) }}
    >
      <ResourceCardPreview resource={resource} isPaused={isPaused} />
      <ResourceCardBadges
        resource={resource}
        isPaused={isPaused}
        promoActive={promoActive}
        isAdmin={isAdmin}
      />
      <ResourceCardAdminActions
        resource={resource}
        isPaused={isPaused}
        onUpdate={onUpdate}
        onUpdateResource={onUpdateResource}
      />
      <ResourceCardContent resource={resource} promoActive={promoActive} isPaused={isPaused} />
    </div>
  )
})