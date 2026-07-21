'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function RecursoError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error al cargar recurso"
      message="No pudimos cargar la información del recurso. Por favor, intenta de nuevo."
      context="Error en recurso"
      reset={reset}
      linkHref="/catalogo"
      linkLabel="Volver al catálogo"
    />
  )
}
