'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function SearchError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error en la búsqueda"
      message="No pudimos realizar la búsqueda. Por favor, intenta de nuevo."
      context="Error en búsqueda"
      reset={reset}
      linkHref="/"
      linkLabel="Volver al inicio"
    />
  )
}
