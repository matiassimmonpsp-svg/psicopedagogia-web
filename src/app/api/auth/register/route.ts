import { NextRequest, NextResponse } from 'next/server'
import { createUser, signToken } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { cookies } from 'next/headers'

/** POST /api/auth/register — Crea una cuenta nueva */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
  if (!checkRateLimit(`register:${ip}`, 3, 60_000).allowed) {
    return NextResponse.json({ error: 'Demasiados intentos. Espera 1 minuto.' }, { status: 429 })
  }

  try {
    const { name, email, password } = await request.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 })
    }

    const user = await createUser(name, email, password)
    const token = await signToken(user)

    ;(await cookies()).set('session', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', path: '/', maxAge: 7 * 24 * 60 * 60,
    })

    return NextResponse.json({ user, token }, { status: 201 })
  } catch (err: any) {
    const status = err.message === 'El correo ya está registrado' ? 409 : 500
    return NextResponse.json({ error: err.message }, { status })
  }
}
