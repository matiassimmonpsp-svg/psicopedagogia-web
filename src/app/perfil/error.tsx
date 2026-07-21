'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function PerfilError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error al cargar perfil"
      message="No pudimos cargar tu perfil. Por favor, intenta de nuevo."
      context="Error en perfil"
      reset={reset}
      linkHref="/"
      linkLabel="Volver al inicio"
    />
  )
}
