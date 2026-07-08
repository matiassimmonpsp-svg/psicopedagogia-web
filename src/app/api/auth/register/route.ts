import { NextRequest, NextResponse } from 'next/server'
import { createUser, signToken } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { csrfCheck } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '127.0.0.1'

    const { allowed } = checkRateLimit(ip, 3, 60_000)
    if (!allowed) {
      return NextResponse.json({ error: 'Demasiados intentos. Intenta de nuevo en 1 minuto' }, { status: 429 })
    }

    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    const user = await createUser(name, email, password)
    const token = signToken(user)

    const response = NextResponse.json({ user }, { status: 201 })
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (err: any) {
    const message = err.message || 'Error al registrar'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
