import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { upsertTags } from '@/lib/utils'
import { csrfCheck } from '@/lib/csrf'

/** POST /api/resources — Crea un nuevo recurso (solo admin) */
export async function POST(request: NextRequest) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf

  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    const { title, description, resourceType, courseId, areaId, subareaId, isFree, priceClp, tags, filePath, editablePath, previewPath } = body

    if (!title || courseId == null || areaId == null || !filePath) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    // Verificar que curso y área existan en la BD
    const course = await prisma.course.findUnique({ where: { id: Number(courseId) } })
    const area = await prisma.area.findUnique({ where: { id: Number(areaId) } })
    if (!course || !area) {
      return NextResponse.json({ error: 'Curso o área inválidos' }, { status: 400 })
    }

    const subarea = subareaId
      ? await prisma.subarea.findUnique({ where: { id: Number(subareaId) } })
      : null

    const resource = await prisma.resource.create({
      data: {
        title, description: description || '', filePath,
        editablePath: editablePath || null,
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
    const msg = err instanceof Error ? err.message : 'Error al crear'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/** GET /api/resources — Lista todos los recursos */
export async function GET() {
  const resources = await prisma.resource.findMany({
    include: { course: true, area: true, subarea: true, tags: { include: { tag: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ resources })
}
