import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, signToken } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { csrfCheck } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '127.0.0.1'

    const { allowed } = checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json({ error: 'Demasiados intentos. Intenta de nuevo en 1 minuto' }, { status: 429 })
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 })
    }

    const user = await authenticateUser(email, password)
    const token = signToken(user)

    const response = NextResponse.json({ user })
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (err: any) {
    const message = err.message || 'Error al iniciar sesión'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
