import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireAdmin } from '@/lib/auth'
import { upsertTags } from '@/lib/utils'
import { csrfCheck } from '@/lib/csrf'
import { unlink } from 'fs/promises'
import { join } from 'path'

/** GET /api/resources/[id] — Obtiene un recurso */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const resource = await prisma.resource.findUnique({
    where: { id: params.id },
    select: {
      id: true, title: true, description: true, previewPath: true,
      resourceType: true, isFree: true, priceClp: true, promoFreeUntil: true,
      courseId: true, areaId: true, subareaId: true, downloadsCount: true,
      isActive: true, createdAt: true, updatedAt: true, editablePath: true,
      course: { select: { name: true, slug: true } },
      area: { select: { name: true, slug: true } },
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
  } catch {}

  return NextResponse.json({ resource: { ...resource, isOwned } })
}

/** PATCH /api/resources/[id] — Actualiza solo el estado (activo/inactivo) */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { isActive } = await request.json()
    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: { isActive },
    })
    return NextResponse.json({ resource })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/** PUT /api/resources/[id] — Actualiza todos los campos de un recurso */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const { title, description, resourceType, courseId, areaId, subareaId, isFree, priceClp, tags, filePath, editablePath, previewPath, promoFreeUntil } = body

    if (!title || !courseId || !areaId) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
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
    if (filePath) data.filePath = filePath
    if (editablePath !== undefined) data.editablePath = editablePath
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
    const message = err instanceof Error ? err.message : 'Error al actualizar'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/** DELETE /api/resources/[id] — Elimina un recurso */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const resource = await prisma.resource.findUnique({ where: { id: params.id } })
    if (!resource) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    await prisma.resourceTag.deleteMany({ where: { resourceId: params.id } })
    await prisma.orderItem.deleteMany({ where: { resourceId: params.id } })
    await prisma.download.deleteMany({ where: { resourceId: params.id } })
    await prisma.resource.delete({ where: { id: params.id } })

    const deleteFile = async (filePath: string | null) => {
      if (!filePath) return
      try {
        const fullPath = join(process.cwd(), 'public', filePath)
        await unlink(fullPath)
      } catch {}
    }

    await Promise.all([
      deleteFile(resource.filePath),
      deleteFile(resource.editablePath),
      deleteFile(resource.previewPath),
    ])

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al eliminar'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
