import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { upsertTags } from '@/lib/utils'
import { csrfCheck } from '@/lib/csrf'

/* Resuelve IDs del mock data a IDs reales en BD */
const resolver = (prismaModel: string, mockDataKey: string) => async (mockId: number) => {
  const mock = await import('@/lib/data')
  const entries: any[] = (mock as any)[mockDataKey]
  const item = entries.find((e: any) => e.id === mockId)
  if (!item) return null
  const existente = await (prisma as any)[prismaModel]?.findUnique({ where: { id: mockId } })
  if (existente) return existente.id
  const porSlug = await (prisma as any)[prismaModel]?.findFirst({ where: { slug: item.slug } })
  if (porSlug) return porSlug.id
  const creado = await (prisma as any)[prismaModel].create({ data: { id: item.id, ...item } })
  return creado.id
}

const resolverCurso = resolver('course', 'courses')
const resolverArea = resolver('area', 'areas')
const resolverSubarea = resolver('subarea', 'subareas')

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

    const resolvedCourseId = await resolverCurso(Number(courseId))
    const resolvedAreaId = await resolverArea(Number(areaId))
    const resolvedSubareaId = subareaId ? await resolverSubarea(Number(subareaId)) : null
    if (!resolvedCourseId || !resolvedAreaId) return NextResponse.json({ error: 'Curso o área inválidos' }, { status: 400 })

    const resource = await prisma.resource.create({
      data: {
        title, description: description || '', filePath,
        editablePath: editablePath || null,
        previewPath: previewPath || '/previews/placeholder.svg',
        resourceType: resourceType || 'evaluation',
        isFree: isFree ?? true,
        priceClp: isFree ? null : (priceClp ? Number(priceClp) : null),
        courseId: resolvedCourseId, areaId: resolvedAreaId,
        subareaId: resolvedSubareaId, isActive: true,
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
