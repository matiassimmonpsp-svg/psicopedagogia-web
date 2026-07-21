'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function ForbiddenError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error de permisos"
      message="Hubo un problema al verificar tus permisos. Intenta de nuevo."
      context="Error 403"
      reset={reset}
      linkHref="/"
      linkLabel="Volver al inicio"
    />
  )
}
