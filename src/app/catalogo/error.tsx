'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function CatalogError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error al cargar el catálogo"
      message="No pudimos cargar los recursos. Por favor, intenta de nuevo."
      context="Error en catálogo"
      reset={reset}
      linkHref="/"
      linkLabel="Volver al inicio"
    />
  )
}
