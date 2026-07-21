'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function CartError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error al cargar carrito"
      message="No pudimos cargar tu carrito. Tus productos están a salvo."
      context="Error en carrito"
      reset={reset}
      linkHref="/catalogo"
      linkLabel="Ir al catálogo"
    />
  )
}
