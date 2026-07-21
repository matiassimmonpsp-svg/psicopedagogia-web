import { NextRequest, NextResponse } from 'next/server'
import { getSession, signToken, SESSION_COOKIE } from '@/lib/auth'
import { csrfCheck } from '@/lib/csrf'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'
import { enforceRateLimit } from '@/lib/api-helpers'

/** POST /api/auth/refresh — Renueva el JWT si la sesión actual es válida */
export async function POST(request: NextRequest) {
  try {
    const csrf = csrfCheck(request)
    if (csrf) return csrf

    const rateLimited = await enforceRateLimit(request, 'refresh', 10)
    if (rateLimited) return rateLimited

    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Sesión expirada' }, { status: 401 })
    }

    const newToken = await signToken(user)
    ;(await cookies()).set(SESSION_COOKIE, newToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', path: '/', maxAge: 30 * 24 * 60 * 60,
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    logger.error('Error al renovar sesión', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al renovar sesión' }, { status: 500 })
  }
}
