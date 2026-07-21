import { NextRequest, NextResponse } from 'next/server'
import { getSession, requireAdmin } from '@/lib/auth'
import { csrfCheck } from '@/lib/csrf'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import type { AuthUser } from '@/lib/auth'

/**
 * Verifica rate limiting para una ruta API.
 * Devuelve una Response 429 si se excede el límite, o null si está permitido.
 */
export async function enforceRateLimit(
  request: Request,
  key: string,
  max: number,
  windowMs: number = 60_000
): Promise<Response | null> {
  if (process.env.NODE_ENV !== 'production') return null
  const ip = getClientIp(request.headers)
  const { allowed } = await checkRateLimit(`${key}:${ip}`, max, windowMs)
  if (!allowed) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, { status: 429 })
  }
  return null
}

/**
 * Obtiene la sesión autenticada. Devuelve una Response 401 si no hay sesión.
 * Elimina el boilerplate `const user = await getSession(); if (!user) return ...`
 */
export async function requireSession(): Promise<AuthUser | NextResponse> {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return user
}

/**
 * Requiere rol admin (sin CSRF). Devuelve una Response 401 si no cumple.
 * Para rutas GET de admin que no modifican datos.
 */
export async function requireAdminSession(): Promise<AuthUser | NextResponse> {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return user
}

/**
 * Verifica CSRF + rol admin para rutas de administración.
 * Devuelve una Response de error si no pasa, o null si está autorizado.
 */
export async function requireAdminWithCsrf(request: NextRequest): Promise<Response | null> {
  const csrf = csrfCheck(request)
  if (csrf) return csrf
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
}
