'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function ComunidadError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error al cargar comunidad"
      message="No pudimos cargar la comunidad. Por favor, intenta de nuevo."
      context="Error en comunidad"
      reset={reset}
      linkHref="/"
      linkLabel="Volver al inicio"
    />
  )
}
