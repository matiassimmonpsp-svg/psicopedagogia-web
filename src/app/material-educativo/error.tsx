'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function MaterialEducativoError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error al cargar material educativo"
      message="No pudimos cargar el material educativo. Por favor, intenta de nuevo."
      context="Error en material-educativo"
      reset={reset}
      linkHref="/"
      linkLabel="Volver al inicio"
    />
  )
}
