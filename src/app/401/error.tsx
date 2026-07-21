'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function UnauthorizedError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error de autenticación"
      message="Hubo un problema al verificar tu sesión. Intenta iniciar sesión de nuevo."
      context="Error 401"
      reset={reset}
      linkHref="/login"
      linkLabel="Iniciar sesión"
    />
  )
}
