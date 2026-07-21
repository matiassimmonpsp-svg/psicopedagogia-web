'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function CursoError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error al cargar curso"
      message="No pudimos cargar la información del curso. Por favor, intenta de nuevo."
      context="Error en curso"
      reset={reset}
      linkHref="/cursos"
      linkLabel="Ver todos los cursos"
    />
  )
}
