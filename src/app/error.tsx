'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error del servidor</h2>
        <p className="text-gray-500 mb-8">Algo salió mal. Por favor, intenta de nuevo.</p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
