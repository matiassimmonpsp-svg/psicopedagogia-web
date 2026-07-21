'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { logger } from '@/lib/logger'

interface ErrorFallbackProps {
  title: string
  message: string
  context: string
  reset: () => void
  linkHref?: string
  linkLabel?: string
}

export function ErrorFallback({ title, message, context, reset, linkHref, linkLabel }: ErrorFallbackProps) {
  useEffect(() => {
    logger.error(context, { error: title })
  }, [context, title])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 mb-8">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Intentar de nuevo
          </button>
          {linkHref && (
            <Link href={linkHref} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              {linkLabel || 'Volver al inicio'}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
