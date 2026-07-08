import { NextRequest } from 'next/server'

const ORIGENES_PERMITIDOS = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)

/** Compara dos orígenes ignorando trailing slash y mayúsculas */
function mismoOrigen(permitido: string, actual: string): boolean {
  if (!permitido || !actual) return false
  return permitido.replace(/\/+$/, '').toLowerCase() === actual.replace(/\/+$/, '').toLowerCase()
}

/**
 * Protección CSRF: verifica que Origin/Referer coincida con el host.
 * Se salta GET y HEAD. Devuelve una Response 403 si no pasa.
 */
export function csrfCheck(request: NextRequest): Response | null {
  if (request.method === 'GET' || request.method === 'HEAD') return null

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const origenReal = origin || (referer ? new URL(referer).origin : null)

  if (!origenReal) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (ORIGENES_PERMITIDOS.length > 0) {
    if (!ORIGENES_PERMITIDOS.some(o => mismoOrigen(o, origenReal))) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
    return null
  }

  const host = request.headers.get('host') || ''
  const origenEsperado = `${request.nextUrl.protocol}//${host}`
  if (!mismoOrigen(origenEsperado, origenReal)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}
