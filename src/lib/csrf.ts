import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const CSRF_COOKIE = 'csrf_token'
const CSRF_HEADER = 'x-csrf-token'
const CSRF_TTL_MS = 3600_000 // 1 hora

const ORIGENES_PERMITIDOS = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)

/** Compara dos orígenes ignorando trailing slash y mayúsculas */
function mismoOrigen(permitido: string, actual: string): boolean {
  if (!permitido || !actual) return false
  return permitido.replace(/\/+$/, '').toLowerCase() === actual.replace(/\/+$/, '').toLowerCase()
}

/**
 * Genera un token CSRF y lo guarda en cookie.
 * El cliente debe enviarlo como header `X-CSRF-Token`.
 */
export function generateCsrfToken(): string {
  const token = crypto.randomBytes(32).toString('hex')
  const cookieStore = cookies()
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CSRF_TTL_MS / 1000,
  })
  return token
}

/**
 * Protección CSRF con doble capa:
 * 1. Verificación de Origin/Referer (como antes)
 * 2. Token CSRF (double-submit cookie): cookie + header deben coincidir
 *
 * Se salta GET y HEAD. Devuelve una Response 403 si no pasa.
 */
export function csrfCheck(request: NextRequest): Response | null {
  if (request.method === 'GET' || request.method === 'HEAD') return null

  // Capa 1: Origin/Referer check
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const origenReal = origin || (referer ? new URL(referer).origin : null)

  if (!origenReal) {
    return Response.json({ error: 'Origen no válido' }, { status: 403 })
  }

  if (ORIGENES_PERMITIDOS.length > 0) {
    if (!ORIGENES_PERMITIDOS.some(o => mismoOrigen(o, origenReal))) {
      return Response.json({ error: 'Origen no permitido' }, { status: 403 })
    }
  } else {
    const host = request.headers.get('host') || ''
    const origenEsperado = `${request.nextUrl.protocol}//${host}`
    if (!mismoOrigen(origenEsperado, origenReal)) {
      return Response.json({ error: 'Origen no permitido' }, { status: 403 })
    }
  }

  // Capa 2: Double-submit cookie check
  const cookieStore = cookies()
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value
  const headerToken = request.headers.get(CSRF_HEADER)

  if (!cookieToken || !headerToken) {
    return Response.json({ error: 'CSRF token inválido' }, { status: 403 })
  }
  const a = Buffer.from(cookieToken)
  const b = Buffer.from(headerToken)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return Response.json({ error: 'CSRF token inválido' }, { status: 403 })
  }

  return null
}
