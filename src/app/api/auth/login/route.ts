import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, signToken, SESSION_COOKIE } from '@/lib/auth'
import { enforceRateLimit } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'
import { cookies } from 'next/headers'

/** POST /api/auth/login — Inicia sesión y crea cookie de sesión */
export async function POST(request: NextRequest) {
  const rateLimited = await enforceRateLimit(request, 'login', 5)
  if (rateLimited) return rateLimited

  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Correo y contraseña requeridos' }, { status: 400 })
    }

    const user = await authenticateUser(email, password)
    const token = await signToken(user)

    ;(await cookies()).set(SESSION_COOKIE, token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', path: '/', maxAge: 30 * 24 * 60 * 60,
    })

    return NextResponse.json({ user })
  } catch (err: unknown) {
    logger.error('Error al iniciar sesión', { error: err instanceof Error ? err.message : err })
    const isAuthError = err instanceof Error && (
      err.message === 'Correo o contraseña incorrectos' ||
      err.message.includes('credenciales')
    )
    return NextResponse.json(
      { error: isAuthError ? 'Correo o contraseña incorrectos' : 'Error al iniciar sesión' },
      { status: isAuthError ? 401 : 500 },
    )
  }
}
