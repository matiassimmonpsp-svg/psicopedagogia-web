'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function RegistroError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error al crear cuenta"
      message="Hubo un problema con el formulario de registro. Intenta de nuevo."
      context="Error en registro"
      reset={reset}
      linkHref="/"
      linkLabel="Volver al inicio"
    />
  )
}
