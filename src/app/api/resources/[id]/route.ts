import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { upsertTags } from '@/lib/utils-server'
import { requireAdminWithCsrf, enforceRateLimit } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'
import { unlink } from 'fs/promises'
import { join } from 'path'

/** GET /api/resources/[id] — Obtiene un recurso */
export async function GET(_request: Request, { params: p }: { params: { id: string } }) {
  const params = await p
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      select: {
        id: true, title: true, description: true, previewPath: true,
        resourceType: true, isFree: true, priceClp: true, promoFreeUntil: true,
        courseId: true, areaId: true, subareaId: true, downloadsCount: true,
        isActive: true, createdAt: true, updatedAt: true,
        course: { select: { name: true, slug: true } },
        area: { select: { name: true, slug: true, isActive: true } },
        subarea: { select: { name: true, slug: true } },
        tags: { select: { tag: { select: { name: true, slug: true } } } },
      },
    })
    if (!resource) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    let isOwned = false
    try {
      const session = await getSession()
      if (session) {
        const haPagado = await prisma.orderItem.findFirst({
          where: { resourceId: resource.id, order: { userId: session.id, status: 'completed' } },
        })
        isOwned = !!haPagado
      }
    } catch (err: unknown) {
      logger.warn('Error al verificar propiedad del recurso', { error: err instanceof Error ? err.message : err })
    }

    return NextResponse.json({ resource: { ...resource, isOwned, areaIsActive: resource.area?.isActive ?? true } })
  } catch (err: unknown) {
    logger.error('Error al obtener recurso', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al obtener recurso' }, { status: 500 })
  }
}

/** PATCH /api/resources/[id] — Actualiza solo el estado (activo/inactivo) */
export async function PATCH(request: NextRequest, { params: p }: { params: { id: string } }) {
  const params = await p
  const authError = await requireAdminWithCsrf(request)
  if (authError) return authError

  const rateLimited = await enforceRateLimit(request, 'resource-patch', 30)
  if (rateLimited) return rateLimited

  try {
    const { isActive } = await request.json()
    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive debe ser un valor booleano' }, { status: 400 })
    }
    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: { isActive },
    })
    return NextResponse.json({ resource })
  } catch (err: unknown) {
    logger.error('Error al actualizar estado del recurso', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

/** PUT /api/resources/[id] — Actualiza todos los campos de un recurso */
export async function PUT(request: NextRequest, { params: p }: { params: { id: string } }) {
  const params = await p
  const authError = await requireAdminWithCsrf(request)
  if (authError) return authError

  const rateLimited = await enforceRateLimit(request, 'resource-put', 20)
  if (rateLimited) return rateLimited

  try {
    const body = await request.json()
    const { title, description, resourceType, courseId, areaId, subareaId, isFree, priceClp, tags, filePath, editablePath, previewPath, promoFreeUntil } = body

    if (!title || !courseId || !areaId) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    if (title.length > 200) {
      return NextResponse.json({ error: 'El título es demasiado largo (máximo 200 caracteres)' }, { status: 400 })
    }
    if (description && description.length > 5000) {
      return NextResponse.json({ error: 'La descripción es demasiado larga (máximo 5000 caracteres)' }, { status: 400 })
    }

    const existing = await prisma.resource.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const data: Record<string, unknown> = {
      title, description: description || '',
      resourceType: resourceType || 'evaluation',
      isFree: isFree ?? true,
      priceClp: isFree ? null : (priceClp ? parseInt(priceClp) : existing.priceClp),
      courseId: parseInt(courseId), areaId: parseInt(areaId),
      subareaId: subareaId ? parseInt(subareaId) : null,
    }
    if (filePath) data.filePath = filePath.startsWith('uploads/') ? filePath : `uploads/pdfs/${filePath}`
    if (editablePath !== undefined) data.editablePath = editablePath ? (editablePath.startsWith('uploads/') ? editablePath : `uploads/pdfs/${editablePath}`) : null
    if (previewPath) data.previewPath = previewPath
    if (promoFreeUntil !== undefined) data.promoFreeUntil = promoFreeUntil

    const resource = await prisma.resource.update({ where: { id: params.id }, data })

    if (tags !== undefined) {
      await prisma.resourceTag.deleteMany({ where: { resourceId: resource.id } })
      await upsertTags(tags, resource.id, prisma)
    }

    const updated = await prisma.resource.findUnique({
      where: { id: resource.id },
      include: { course: true, area: true, subarea: true, tags: { include: { tag: true } } },
    })
    return NextResponse.json({ resource: updated })
  } catch (err: unknown) {
    logger.error('Error al actualizar recurso', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

/** DELETE /api/resources/[id] — Elimina un recurso */
export async function DELETE(request: NextRequest, { params: p }: { params: { id: string } }) {
  const params = await p
  const authError = await requireAdminWithCsrf(request)
  if (authError) return authError

  const rateLimited = await enforceRateLimit(request, 'resource-delete', 10)
  if (rateLimited) return rateLimited

  try {
    const resource = await prisma.resource.findUnique({ where: { id: params.id } })
    if (!resource) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    await prisma.resourceTag.deleteMany({ where: { resourceId: params.id } })
    await Promise.all([
      prisma.orderItem.deleteMany({ where: { resourceId: params.id } }),
      prisma.download.deleteMany({ where: { resourceId: params.id } }),
    ])
    await prisma.resource.delete({ where: { id: params.id } })

    const deleteFile = async (filePath: string | null) => {
      if (!filePath) return
      try {
        const fullPath = join(process.cwd(), filePath)
        await unlink(fullPath)
      } catch (err: unknown) {
        logger.warn('Error al eliminar archivo', { error: err instanceof Error ? err.message : err })
      }
    }

    await Promise.all([
      deleteFile(resource.filePath),
      deleteFile(resource.editablePath),
      deleteFile(resource.previewPath?.startsWith('/previews/') ? `public${resource.previewPath}` : resource.previewPath),
    ])

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    logger.error('Error al eliminar recurso', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
