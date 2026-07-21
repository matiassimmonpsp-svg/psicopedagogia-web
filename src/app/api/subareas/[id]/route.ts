import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminWithCsrf, enforceRateLimit } from '@/lib/api-helpers'
import { generateSlug } from '@/lib/utils'
import { logger } from '@/lib/logger'

type Props = { params: { id: string } }

/** PATCH /api/subareas/[id] — Actualiza nombre, sortOrder o isActive */
export async function PATCH(request: NextRequest, { params: p }: Props) {
  const params = await p
  const authError = await requireAdminWithCsrf(request)
  if (authError) return authError

  const rateLimited = await enforceRateLimit(request, 'subarea-patch', 20)
  if (rateLimited) return rateLimited

  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (body.name !== undefined) {
      data.name = body.name.trim()
      data.slug = generateSlug(body.name)
    }
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder
    if (body.isActive !== undefined) data.isActive = body.isActive

    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const subarea = await prisma.subarea.update({ where: { id }, data })
    return NextResponse.json({ subarea })
  } catch (err: unknown) {
    logger.error('Error al actualizar subárea', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al actualizar subárea' }, { status: 500 })
  }
}

/** DELETE /api/subareas/[id] — Elimina una subárea (solo si no tiene recursos) */
export async function DELETE(request: NextRequest, { params: p }: Props) {
  const params = await p
  const authError = await requireAdminWithCsrf(request)
  if (authError) return authError

  const rateLimited = await enforceRateLimit(request, 'subarea-delete', 10)
  if (rateLimited) return rateLimited

  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const subarea = await prisma.subarea.findUnique({
      where: { id },
      include: { _count: { select: { resources: true } } },
    })

    if (!subarea) {
      return NextResponse.json({ error: 'Subárea no encontrada' }, { status: 404 })
    }

    if (subarea._count.resources > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: tiene ${subarea._count.resources} recursos asociados` },
        { status: 409 },
      )
    }

    await prisma.subarea.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    logger.error('Error al eliminar subárea', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al eliminar subárea' }, { status: 500 })
  }
}
