'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error en el panel de administración"
      message={error.message || 'Ocurrió un error inesperado. Intenta de nuevo.'}
      context="admin"
      reset={reset}
      linkHref="/"
      linkLabel="Volver al inicio"
    />
  )
}