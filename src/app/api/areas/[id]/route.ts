import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminWithCsrf, enforceRateLimit } from '@/lib/api-helpers'
import { generateSlug } from '@/lib/utils'
import { logger } from '@/lib/logger'

type Props = { params: { id: string } }

/** PATCH /api/areas/[id] — Actualiza nombre, slug, sortOrder o isActive */
export async function PATCH(request: NextRequest, { params: p }: Props) {
  const params = await p
  const authError = await requireAdminWithCsrf(request)
  if (authError) return authError

  const rateLimited = await enforceRateLimit(request, 'area-patch', 20)
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

    const area = await prisma.area.update({ where: { id }, data })
    return NextResponse.json({ area })
  } catch (err: unknown) {
    logger.error('Error al actualizar área', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al actualizar área' }, { status: 500 })
  }
}

/** DELETE /api/areas/[id] — Elimina un área (solo si no tiene recursos) */
export async function DELETE(request: NextRequest, { params: p }: Props) {
  const params = await p
  const authError = await requireAdminWithCsrf(request)
  if (authError) return authError

  const rateLimited = await enforceRateLimit(request, 'area-delete', 10)
  if (rateLimited) return rateLimited

  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const area = await prisma.area.findUnique({
      where: { id },
      include: { _count: { select: { resources: true } } },
    })

    if (!area) {
      return NextResponse.json({ error: 'Área no encontrada' }, { status: 404 })
    }

    if (area._count.resources > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: tiene ${area._count.resources} recursos asociados` },
        { status: 409 },
      )
    }

    await prisma.subarea.deleteMany({ where: { areaId: id } })
    await prisma.area.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    logger.error('Error al eliminar área', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al eliminar área' }, { status: 500 })
  }
}
