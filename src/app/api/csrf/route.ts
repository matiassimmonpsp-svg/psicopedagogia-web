import { NextResponse } from 'next/server'
import { generateCsrfToken } from '@/lib/csrf'
import { logger } from '@/lib/logger'

/** GET /api/csrf — Genera y devuelve un token CSRF (el cliente lo envía como X-CSRF-Token) */
export function GET() {
  try {
    const token = generateCsrfToken()
    return NextResponse.json({ csrfToken: token })
  } catch (err: unknown) {
    logger.error('Error al generar token CSRF', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
