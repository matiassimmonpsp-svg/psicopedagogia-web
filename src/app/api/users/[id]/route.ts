import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'

/** PUT /api/users/[id] — Actualiza rol de un usuario (admin) */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { role } = await request.json()
    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    })
    return NextResponse.json({ user })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/** PATCH /api/users/[id] — Actualiza datos de perfil de un usuario (admin) */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await request.json()

    // Si solo envía role, delegar a PUT
    if (body.role && Object.keys(body).length === 1) {
      return PUT(request, { params })
    }

    const data: { name?: string; email?: string; passwordHash?: string } = {}
    if (body.name) data.name = body.name
    if (body.email) data.email = body.email
    if (body.password) data.passwordHash = await bcrypt.hash(body.password, 10)

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true },
    })
    return NextResponse.json({ user })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/** DELETE /api/users/[id] — Elimina un usuario (admin) */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al eliminar'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
