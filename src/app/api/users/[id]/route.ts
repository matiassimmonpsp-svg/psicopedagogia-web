import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { validatePassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireAdminWithCsrf, enforceRateLimit } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'

const VALID_ROLES = ['user', 'admin'] as const

/** PUT /api/users/[id] — Actualiza rol de un usuario (admin) */
export async function PUT(request: NextRequest, { params: p }: { params: { id: string } }) {
  const params = await p
  const authError = await requireAdminWithCsrf(request)
  if (authError) return authError

  const rateLimited = await enforceRateLimit(request, 'user-put', 20)
  if (rateLimited) return rateLimited

  try {
    const { role } = await request.json()
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    })
    return NextResponse.json({ user })
  } catch (err: unknown) {
    logger.error('Error al actualizar rol de usuario', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

/** PATCH /api/users/[id] — Actualiza datos de perfil de un usuario (admin) */
export async function PATCH(request: NextRequest, { params: p }: { params: { id: string } }) {
  const params = await p
  const authError = await requireAdminWithCsrf(request)
  if (authError) return authError

  const rateLimited = await enforceRateLimit(request, 'user-patch', 20)
  if (rateLimited) return rateLimited

  try {
    const body = await request.json()

    // Si solo envía role, actualizar directamente
    if (body.role && Object.keys(body).length === 1) {
      if (!VALID_ROLES.includes(body.role)) {
        return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
      }
      const user = await prisma.user.update({
        where: { id: params.id },
        data: { role: body.role },
        select: { id: true, name: true, email: true, role: true },
      })
      return NextResponse.json({ user })
    }

    // Validar rol si se envía junto con otros campos
    if (body.role && !VALID_ROLES.includes(body.role)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }

    const data: { name?: string; email?: string; passwordHash?: string } = {}
    if (body.name) data.name = body.name
    if (body.email) data.email = body.email
    if (body.password) {
      const passwordError = validatePassword(body.password)
      if (passwordError) {
        return NextResponse.json({ error: passwordError }, { status: 400 })
      }
      data.passwordHash = await bcrypt.hash(body.password, 10)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true },
    })
    return NextResponse.json({ user })
  } catch (err: unknown) {
    logger.error('Error al actualizar usuario', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

/** DELETE /api/users/[id] — Elimina un usuario (admin) */
export async function DELETE(request: NextRequest, { params: p }: { params: { id: string } }) {
  const params = await p
  const authError = await requireAdminWithCsrf(request)
  if (authError) return authError

  const rateLimited = await enforceRateLimit(request, 'user-delete', 10)
  if (rateLimited) return rateLimited

  try {
    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    logger.error('Error al eliminar usuario', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
