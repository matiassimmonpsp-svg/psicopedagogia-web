'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function LoginError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error al iniciar sesión"
      message="Hubo un problema con el formulario de inicio de sesión. Intenta de nuevo."
      context="Error en login"
      reset={reset}
      linkHref="/"
      linkLabel="Volver al inicio"
    />
  )
}
