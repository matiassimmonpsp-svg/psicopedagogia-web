import { NextResponse } from 'next/server'
import { getSession, hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { role, name, email, password } = body

    if (role && !['admin', 'user'].includes(role)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing && existing.id !== params.id) {
        return NextResponse.json({ error: 'El correo ya está en uso' }, { status: 400 })
      }
    }

    const data: Record<string, any> = {}
    if (role) data.role = role
    if (name) data.name = name
    if (email) data.email = email
    if (password) data.passwordHash = await hashPassword(password)

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json({ user: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al actualizar usuario' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getSession()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (user.id === params.id) {
    return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })
  }

  try {
    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al eliminar usuario' }, { status: 500 })
  }
}
