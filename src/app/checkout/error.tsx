'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function CheckoutError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      title="Error en el pago"
      message="Hubo un problema al procesar tu pago. Tu carrito está a salvo."
      context="Error en checkout"
      reset={reset}
      linkHref="/carrito"
      linkLabel="Volver al carrito"
    />
  )
}
