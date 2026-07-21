import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { upsertTags } from '@/lib/utils-server'
import { requireAdminWithCsrf, enforceRateLimit, requireAdminSession } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'

/** POST /api/resources — Crea un nuevo recurso (solo admin) */
export async function POST(request: NextRequest) {
  const authError = await requireAdminWithCsrf(request)
  if (authError) return authError

  const rateLimited = await enforceRateLimit(request, 'resources', 20)
  if (rateLimited) return rateLimited

  try {
    const body = await request.json()
    const { title, description, resourceType, courseId, areaId, subareaId, isFree, priceClp, tags, filePath, editablePath, previewPath } = body

    if (!title || courseId == null || areaId == null || !filePath) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    if (title.length > 200) {
      return NextResponse.json({ error: 'El título es demasiado largo (máximo 200 caracteres)' }, { status: 400 })
    }
    if (description && description.length > 5000) {
      return NextResponse.json({ error: 'La descripción es demasiado larga (máximo 5000 caracteres)' }, { status: 400 })
    }
    if (filePath.length > 500) {
      return NextResponse.json({ error: 'Ruta de archivo inválida' }, { status: 400 })
    }

    const courseNum = Number(courseId)
    const areaNum = Number(areaId)
    if (isNaN(courseNum) || isNaN(areaNum)) {
      return NextResponse.json({ error: 'Curso o área inválidos' }, { status: 400 })
    }

    const [course, area, subarea] = await Promise.all([
      prisma.course.findUnique({ where: { id: courseNum } }),
      prisma.area.findUnique({ where: { id: areaNum } }),
      subareaId
        ? prisma.subarea.findUnique({ where: { id: Number(subareaId) } })
        : Promise.resolve(null),
    ])
    if (!course || !area) {
      return NextResponse.json({ error: 'Curso o área inválidos' }, { status: 400 })
    }

    const resource = await prisma.resource.create({
      data: {
        title, description: description || '',
        filePath: filePath.startsWith('uploads/') ? filePath : `uploads/pdfs/${filePath}`,
        editablePath: editablePath ? (editablePath.startsWith('uploads/') ? editablePath : `uploads/pdfs/${editablePath}`) : null,
        previewPath: previewPath || '/previews/placeholder.svg',
        resourceType: resourceType || 'evaluation',
        isFree: isFree ?? true,
        priceClp: isFree ? null : (priceClp ? Number(priceClp) : null),
        courseId: course.id, areaId: area.id,
        subareaId: subarea?.id || null, isActive: true,
      },
    })

    if (tags) await upsertTags(tags, resource.id, prisma)
    return NextResponse.json({ resource }, { status: 201 })
  } catch (err: unknown) {
    logger.error('Error al crear recurso', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al crear' }, { status: 500 })
  }
}

/** GET /api/resources — Lista todos los recursos (solo admin, campos seguros) */
export async function GET() {
  try {
    const admin = await requireAdminSession()
    if (admin instanceof NextResponse) return admin

    const resources = await prisma.resource.findMany({
      select: {
        id: true, title: true, description: true, resourceType: true,
        isFree: true, priceClp: true, promoFreeUntil: true, isActive: true,
        downloadsCount: true, createdAt: true,
        course: { select: { id: true, name: true, slug: true } },
        area: { select: { id: true, name: true, slug: true } },
        subarea: { select: { id: true, name: true, slug: true } },
        tags: { select: { tag: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      resources: resources.map(r => ({
        ...r,
        tags: r.tags.map(t => t.tag.name),
      })),
    })
  } catch (err: unknown) {
    logger.error('Error al obtener recursos', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al obtener recursos' }, { status: 500 })
  }
}
