import { NextResponse } from 'next/server'
import { createUser, signToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
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
