import { NextRequest, NextResponse } from 'next/server'
import { createUser, signToken, SESSION_COOKIE } from '@/lib/auth'
import { enforceRateLimit } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'
import { cookies } from 'next/headers'

/** POST /api/auth/register — Crea una cuenta nueva */
export async function POST(request: NextRequest) {
  const rateLimited = await enforceRateLimit(request, 'register', 3)
  if (rateLimited) return rateLimited

  try {
    const { name, email, password } = await request.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 })
    }
    if (name.length > 200) {
      return NextResponse.json({ error: 'El nombre es demasiado largo (máximo 200 caracteres)' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Formato de correo inválido' }, { status: 400 })
    }

    const user = await createUser(name, email, password)
    const token = await signToken(user)

    ;(await cookies()).set(SESSION_COOKIE, token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', path: '/', maxAge: 7 * 24 * 60 * 60,
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (err: unknown) {
    const isDuplicateEmail = err instanceof Error && err.message === 'El correo ya está registrado'
    logger.error('Error al registrar usuario', { error: err instanceof Error ? err.message : err })
    return NextResponse.json(
      { error: isDuplicateEmail ? 'El correo ya está registrado' : 'Error al registrar' },
      { status: isDuplicateEmail ? 409 : 500 },
    )
  }
}
