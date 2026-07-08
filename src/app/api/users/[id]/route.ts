import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

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
