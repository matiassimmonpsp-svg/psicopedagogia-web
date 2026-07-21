import { AlertTriangle } from 'lucide-react'
import type { Resource } from '@/lib/data'

interface ResourcePausedBannerProps {
  resource: Resource
  reason?: 'resource' | 'area'
}

export function ResourcePausedBanner({ resource, reason = 'resource' }: ResourcePausedBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/50 p-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
          <AlertTriangle size={22} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-base font-bold text-amber-900">
            {reason === 'area' ? 'Área en mantención' : 'Recurso en revisión'}
          </p>
          <p className="text-sm text-amber-700 mt-1.5 leading-relaxed">
            {reason === 'area'
              ? resource.isOwned
                ? 'El área de este recurso está temporalmente no disponible. Ya tienes acceso, volverá a estar disponible pronto.'
                : 'El área de este recurso está temporalmente en mantención. Vuelve a revisar más adelante.'
              : resource.isOwned
                ? 'Ya tienes acceso a este recurso. Volverá a estar disponible pronto.'
                : 'Este recurso se está actualizando. Vuelve a revisar más adelante.'}
          </p>
        </div>
      </div>
    </div>
  )
}