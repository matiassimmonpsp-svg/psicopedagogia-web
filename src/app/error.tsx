'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error del servidor"
      message="Algo salió mal. Por favor, intenta de nuevo."
      context="Error del servidor"
      reset={reset}
    />
  )
}
