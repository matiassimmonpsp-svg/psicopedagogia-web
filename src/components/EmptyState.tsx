'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

/**
 * Componente reutilizable para mostrar estados vacíos.
 * Se usa cuando no hay datos que mostrar (carrito vacío, sin resultados, etc.)
 */
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <Icon size={64} className="mx-auto text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 mb-6">{description}</p>
      {action && (
        action.href ? (
          <Link href={action.href} className="btn-primary inline-flex items-center gap-2">
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="btn-primary inline-flex items-center gap-2">
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
