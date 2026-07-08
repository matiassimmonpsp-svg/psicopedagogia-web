import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { upsertTags } from '@/lib/utils'
import { csrfCheck } from '@/lib/csrf'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const resource = await prisma.resource.findUnique({
    where: { id: params.id },
    include: { course: true, area: true, subarea: true, tags: { include: { tag: true } } },
  })

  if (!resource) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  return NextResponse.json({ resource })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: { isActive: body.isActive },
    })
    return NextResponse.json({ resource })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al actualizar' }, { status: 500 })
  }
}

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
    if (!existing) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 })
    }

    const updateData: any = {
      title,
      description: description || '',
      resourceType: resourceType || 'evaluation',
      isFree: isFree ?? true,
      priceClp: isFree ? null : (priceClp ? parseInt(priceClp) : existing.priceClp),
      courseId: parseInt(courseId),
      areaId: parseInt(areaId),
      subareaId: subareaId ? parseInt(subareaId) : null,
    }

    if (filePath) updateData.filePath = filePath
    if (editablePath !== undefined) updateData.editablePath = editablePath
    if (previewPath) updateData.previewPath = previewPath
    if (promoFreeUntil !== undefined) updateData.promoFreeUntil = promoFreeUntil

    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: updateData,
    })

    if (tags !== undefined) {
      await prisma.resourceTag.deleteMany({ where: { resourceId: resource.id } })
      await upsertTags(tags, resource.id, prisma)
    }

    const updated = await prisma.resource.findUnique({
      where: { id: resource.id },
      include: { course: true, area: true, subarea: true, tags: { include: { tag: true } } },
    })

    return NextResponse.json({ resource: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al actualizar' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    await prisma.resourceTag.deleteMany({ where: { resourceId: params.id } })
    await prisma.resource.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al eliminar' }, { status: 500 })
  }
}
