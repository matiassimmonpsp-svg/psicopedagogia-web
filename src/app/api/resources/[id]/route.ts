import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, resourceType, courseId, areaId, subareaId, isFree, priceClp, tags, filePath, previewPath, promoFreeUntil } = body

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
    if (previewPath) updateData.previewPath = previewPath
    if (promoFreeUntil !== undefined) updateData.promoFreeUntil = promoFreeUntil

    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: updateData,
    })

    if (tags !== undefined) {
      await prisma.resourceTag.deleteMany({ where: { resourceId: resource.id } })
      const tagNames = tags.split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean)
      for (const name of tagNames) {
        const slug = name.replace(/\s+/g, '-')
        let tag = await prisma.tag.findUnique({ where: { slug } })
        if (!tag) {
          tag = await prisma.tag.create({ data: { name, slug } })
        }
        await prisma.resourceTag.create({
          data: { resourceId: resource.id, tagId: tag.id },
        }).catch(() => {})
      }
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

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getSession()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    await prisma.resourceTag.deleteMany({ where: { resourceId: params.id } })
    await prisma.resource.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al eliminar' }, { status: 500 })
  }
}
