import { Download, Clock } from 'lucide-react'
import type { Resource } from '@/lib/data'

interface ResourceCardBadgesProps {
  resource: Resource
  isPaused: boolean
  promoActive: boolean
  isAdmin: boolean
}

/** Badges de estado (propio, promo, gratis, premium, en pausa) */
export function ResourceCardBadges({ resource, isPaused, promoActive, isAdmin }: ResourceCardBadgesProps) {
  return (
    <>
      {resource.isOwned ? (
        <span className="absolute top-2 right-2 bg-emerald-500 text-white badge text-xs flex items-center gap-1 z-[2]">
          <Download size={12} /> Ya comprado
        </span>
      ) : promoActive ? (
        <span className="absolute top-2 right-2 bg-amber-600 text-white badge text-xs flex items-center gap-1 z-[2]">
          <Clock size={12} /> Promo
        </span>
      ) : resource.isFree ? (
        <span className="absolute top-2 right-2 badge-green text-xs z-[2]">Gratis</span>
      ) : (
        <span className="absolute top-2 right-2 badge-orange text-xs z-[2]">Premium</span>
      )}

      {isAdmin && isPaused && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full z-[3] shadow-lg">
          En pausa
        </span>
      )}
    </>
  )
}