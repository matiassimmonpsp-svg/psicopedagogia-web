import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, signToken } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { cookies } from 'next/headers'

/** POST /api/auth/login — Inicia sesión y crea cookie */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
  if (!checkRateLimit(`login:${ip}`, 5, 60_000).allowed) {
    return NextResponse.json({ error: 'Demasiados intentos. Espera 1 minuto.' }, { status: 429 })
  }

  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Correo y contraseña requeridos' }, { status: 400 })
    }

    const user = await authenticateUser(email, password)
    const token = await signToken(user)

    ;(await cookies()).set('session', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', path: '/', maxAge: 7 * 24 * 60 * 60,
    })

    return NextResponse.json({ user })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al iniciar sesión'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
