'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function DownloadsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error al cargar descargas"
      message="No pudimos cargar tus descargas. Por favor, intenta de nuevo."
      context="Error en descargas"
      reset={reset}
      linkHref="/"
      linkLabel="Volver al inicio"
    />
  )
}
